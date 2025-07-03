import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

let seedDb: any;

async function createSeedConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const isLocalDatabase = process.env.DATABASE_URL.includes('localhost') || 
                          process.env.DATABASE_URL.includes('127.0.0.1');

  try {
    if (isLocalDatabase) {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        connectionTimeoutMillis: 15000,
        max: 1
      });
      
      seedDb = drizzle({ client: pool });
      await seedDb.execute(sql`SELECT 1`);
      console.log("Connected to local database successfully");
      return seedDb;
    } else {
      const { drizzle: neonDrizzle } = await import('drizzle-orm/neon-serverless');
      const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
      const ws = await import('ws');
      
      neonConfig.webSocketConstructor = ws.default;
      neonConfig.poolQueryViaFetch = true;
      
      const neonPool = new NeonPool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 30000,
        max: 1
      });
      
      seedDb = neonDrizzle({ client: neonPool });
      await seedDb.execute(sql`SELECT 1`);
      console.log("Connected to Neon database successfully");
      return seedDb;
    }
  } catch (error: any) {
    console.error(`Database connection failed: ${error.message}`);
    
    try {
      console.log("Attempting fallback connection...");
      const { db } = await import("../server/db");
      seedDb = db;
      await seedDb.execute(sql`SELECT 1`);
      console.log("Fallback connection successful");
      return seedDb;
    } catch (serverDbError: any) {
      throw new Error(`All database connection methods failed. Last error: ${serverDbError.message}`);
    }
  }
}

async function createSessionTable() {
  try {
    console.log("Creating session table...");
    
    const db = await createSeedConnection();

    // Create the session table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
    `);

    // Add primary key constraint (only if it doesn't exist)
    try {
      await db.execute(sql`
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
      console.log("Primary key constraint added");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("Primary key constraint already exists");
      } else {
        throw error;
      }
    }

    // Create index (only if it doesn't exist)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    console.log("✅ Session table created successfully!");
  } catch (error) {
    console.error("Failed to create session table:", error);
    throw error;
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('create-session-table.ts')) {
  createSessionTable()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Session table creation failed:", error);
      process.exit(1);
    });
} 