import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config();

// Default to local PostgreSQL if no DATABASE_URL is provided
const DEFAULT_LOCAL_DB_URL = "";
const databaseUrl = process.env.DATABASE_URL || "DEFAULT_LOCAL_DB_URL";

console.log(
  `Database configuration: ${
    databaseUrl.includes("localhost") ? "Local PostgreSQL" : "Remote PostgreSQL"
  }`
);

let pool: Pool;
let db: any;

async function createDatabaseConnection() {
  try {
    // Use traditional PostgreSQL driver for all connections
    pool = new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      connectionTimeoutMillis: 15000,
      max: 5,
    });

    db = drizzle({ client: pool, schema });

    // Test the connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful");

    return { pool, db };
  } catch (error: any) {
    console.error(`❌ Database connection failed: ${error.message}`);

    // Fallback to local database if remote connection fails
    if (databaseUrl !== DEFAULT_LOCAL_DB_URL) {
      console.log("🔄 Attempting fallback to local PostgreSQL...");
      try {
        pool = new Pool({
          connectionString: DEFAULT_LOCAL_DB_URL,
          ssl: false,
          connectionTimeoutMillis: 15000,
          max: 5,
        });

        db = drizzle({ client: pool, schema });
        await db.execute(sql`SELECT 1`);
        console.log("✅ Fallback to local PostgreSQL successful");

        return { pool, db };
      } catch (fallbackError: any) {
        console.error(
          `❌ Fallback to local database also failed: ${fallbackError.message}`
        );
        console.error(
          "Please ensure PostgreSQL is running locally on port 5432"
        );
        throw fallbackError;
      }
    } else {
      console.error(
        "Local database connection failed. Please ensure PostgreSQL is running on localhost:5432"
      );
      console.error("You may need to:");
      console.error("1. Install PostgreSQL");
      console.error("2. Create a database named 'vx_academy'");
      console.error("3. Ensure the connection string is correct");
      throw error;
    }
  }
}

// Initialize connection on module load
createDatabaseConnection().catch((error) => {
  console.error("Failed to initialize database connection:", error);
});

export { pool, db };
