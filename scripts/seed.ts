import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  users,
  badges,
  userBadges,
  roles,
  roleMandatoryCourses,
  trainingAreas,
  modules,
  courses,
  coursePrerequisites,
  units,
  courseUnits,
  learningBlocks,
  assessments,
  questions,
  userProgress,
  blockCompletions,
  assessmentAttempts,
  aiTutorConversations,
  scormPackages,
  scormTrackingData,
  certificates,
  notifications,
  mediaFiles,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

// Create a separate database connection for seeding
let seedDb: any;

async function createSeedConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please check your .env file or Replit secrets."
    );
  }

  const isLocalDatabase =
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1");

  try {
    if (isLocalDatabase) {
      // Use traditional PostgreSQL driver for local development
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        connectionTimeoutMillis: 15000,
        max: 1,
      });

      seedDb = drizzle({ client: pool });

      // Test the connection
      await seedDb.execute(sql`SELECT 1`);
      console.log("Connected to local database successfully");

      return seedDb;
    } else {
      // Use Neon serverless for production/cloud databases
      const { drizzle: neonDrizzle } = await import(
        "drizzle-orm/neon-serverless"
      );
      const { Pool: NeonPool, neonConfig } = await import(
        "@neondatabase/serverless"
      );
      const ws = await import("ws");

      // Configure neon for better reliability
      neonConfig.webSocketConstructor = ws.default;
      neonConfig.poolQueryViaFetch = true;

      const neonPool = new NeonPool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 30000,
        max: 1,
      });

      seedDb = neonDrizzle({ client: neonPool });
      await seedDb.execute(sql`SELECT 1`);
      console.log("Connected to Neon database successfully");
      return seedDb;
    }
  } catch (error: any) {
    console.error(`Database connection failed: ${error.message}`);

    // Final fallback: try importing the server db
    try {
      console.log("Attempting fallback connection...");
      const { db } = await import("../server/db");
      seedDb = db;
      await seedDb.execute(sql`SELECT 1`);
      console.log("Fallback connection successful");
      return seedDb;
    } catch (serverDbError: any) {
      throw new Error(
        `All database connection methods failed. Last error: ${serverDbError.message}`
      );
    }
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function clearDatabase(db: any) {
  console.log("Clearing existing database data...");

  try {
    // Delete in order to respect foreign key constraints
    // Delete dependent tables first, then parent tables

    // Clear junction/relationship tables first
    await db.delete(userBadges);
    await db.delete(roleMandatoryCourses);
    await db.delete(courseUnits);
    await db.delete(coursePrerequisites);

    // Clear user-related data
    await db.delete(userProgress);
    await db.delete(blockCompletions);
    await db.delete(assessmentAttempts);
    await db.delete(aiTutorConversations);
    await db.delete(certificates);
    await db.delete(notifications);

    // Clear content-related data
    await db.delete(scormTrackingData);
    await db.delete(scormPackages);
    await db.delete(questions);
    await db.delete(assessments);
    await db.delete(learningBlocks);
    await db.delete(units);
    await db.delete(courses);
    await db.delete(modules);
    await db.delete(trainingAreas);

    // Clear system data
    await db.delete(badges);
    await db.delete(mediaFiles);
    await db.delete(roles);

    // Clear users last (as other tables may reference it)
    await db.delete(users);

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    const db = await createSeedConnection();

    // Clear all existing data first
    await clearDatabase(db);

    // Now seed fresh data
    console.log("Creating admin user...");
    const hashedPassword = await hashPassword("password");
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      email: "admin@vx-academy.ae",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      language: "English",
      nationality: "United Arab Emirates",
      yearsOfExperience: "10+ years",
      assets: "Museum",
      roleCategory: "Information desk staff",
      subCategory: "Manager",
      seniority: "Manager",
      organizationName: "VX Academy",
    });
    console.log("Admin user created successfully!");

    console.log("Creating badges...");

    // Create completion badges
    await db.insert(badges).values([
      {
        name: "Course Completion",
        description: "Successfully completed a course in VX Academy",
        imageUrl: "https://img.icons8.com/fluent/96/000000/diploma.png",
        xpPoints: 100,
        type: "course_completion",
      },
    ]);

    await db.insert(badges).values([
      {
        name: "Abu Dhabi Expert",
        description: "Completed all Abu Dhabi Information courses",
        imageUrl: "https://img.icons8.com/fluent/96/000000/trophy.png",
        xpPoints: 200,
        type: "area_completion",
      },
    ]);

    await db.insert(badges).values([
      {
        name: "First Assessment",
        description: "Passed your first assessment",
        imageUrl: "https://img.icons8.com/fluent/96/000000/test.png",
        xpPoints: 50,
        type: "assessment",
      },
    ]);

    await db.insert(badges).values([
      {
        name: "Perfect Score",
        description: "Achieved 100% on an assessment",
        imageUrl: "https://img.icons8.com/fluent/96/000000/medal.png",
        xpPoints: 75,
        type: "assessment_perfect",
      },
    ]);

    console.log("Badges created successfully!");
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.includes("seed.ts")
) {
  seedDatabase()
    .then(() => {
      // process.exit(0);
    })
    .catch((error) => {
      console.error("Database seeding failed:", error);
      process.exit(1);
    });
}
