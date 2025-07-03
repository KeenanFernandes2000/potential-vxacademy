import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config();

// Default to local PostgreSQL if no DATABASE_URL is provided or if in development
const DEFAULT_LOCAL_DB_URL = "postgresql://postgres:password@localhost:5432/vx_academy";
const databaseUrl = process.env.DATABASE_URL || DEFAULT_LOCAL_DB_URL;
const isLocalDatabase = databaseUrl.includes('localhost') || 
                        databaseUrl.includes('127.0.0.1') || 
                        !process.env.DATABASE_URL; // No DATABASE_URL means use local

console.log(`Database configuration: ${isLocalDatabase ? 'Local PostgreSQL' : 'Neon Serverless'}`);

let pool: any;
let db: any;

if (isLocalDatabase) {
  console.log("🔧 Configuring local PostgreSQL database...");
  // Use traditional PostgreSQL for local development
  pool = new PgPool({
    connectionString: databaseUrl,
    ssl: false,
    connectionTimeoutMillis: 15000,
    max: 5
  });
  
  db = pgDrizzle({ client: pool, schema });
  
} else {
  console.log("🔧 Configuring Neon serverless database...");
  // Configure neon for serverless environments
  neonConfig.webSocketConstructor = ws;
  neonConfig.poolQueryViaFetch = true;

  // Use Neon serverless for production
  pool = new Pool({ 
    connectionString: databaseUrl,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    max: 3,
    ssl: { rejectUnauthorized: false }
  });

  db = drizzle({ client: pool, schema });
}

// Test the connection on startup
async function testConnection() {
  try {
    await db.execute(sql`SELECT 1` as any);
    console.log(`✅ Database connection successful (${isLocalDatabase ? 'Local PostgreSQL' : 'Neon'})`);
  } catch (error: any) {
    console.error(`❌ Database connection failed: ${error.message}`);
    
    if (!isLocalDatabase) {
      console.log("🔄 Attempting fallback to local PostgreSQL...");
      try {
        // Recreate connection with local PostgreSQL
        pool = new PgPool({
          connectionString: DEFAULT_LOCAL_DB_URL,
          ssl: false,
          connectionTimeoutMillis: 15000,
          max: 5
        });
        
        db = pgDrizzle({ client: pool, schema });
        await db.execute(sql`SELECT 1` as any);
        console.log("✅ Fallback to local PostgreSQL successful");
      } catch (fallbackError: any) {
        console.error(`❌ Fallback to local database also failed: ${fallbackError.message}`);
        console.error("Please ensure PostgreSQL is running locally on port 5432");
      }
    } else {
      console.error("Local database connection failed. Please ensure PostgreSQL is running on localhost:5432");
      console.error("You may need to:");
      console.error("1. Install PostgreSQL");
      console.error("2. Create a database named 'vx_academy'");
      console.error("3. Ensure the connection string is correct");
    }
  }
}

// Test connection on module load
testConnection();

export { pool, db };
