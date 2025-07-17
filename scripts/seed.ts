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
} from "../shared/schema";
import { hashPassword } from "../shared/auth-utils";
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

  try {
    // Use traditional PostgreSQL driver for all connections
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      connectionTimeoutMillis: 15000,
      max: 1,
    });

    seedDb = drizzle({ client: pool });

    // Test the connection
    await seedDb.execute(sql`SELECT 1`);
    console.log("Connected to database successfully");

    return seedDb;
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

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    const db = await createSeedConnection();

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (existingAdmin.length === 0) {
      console.log("Admin user not found. Creating admin user...");
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
    } else {
      console.log("Admin user already exists. Skipping creation.");
    }

    console.log("Creating badges...");
    // Check if badges already exist before inserting
    const existingBadges = await db.select().from(badges);
    if (existingBadges.length === 0) {
      // Create completion badges
      await db.insert(badges).values([
        {
          name: "Course Completion",
          description: "Successfully completed a course in VX Academy",
          imageUrl: "https://img.icons8.com/fluent/96/000000/diploma.png",
          xpPoints: 100,
          type: "course_completion",
        },
        {
          name: "Abu Dhabi Expert",
          description: "Completed all Abu Dhabi Information courses",
          imageUrl: "https://img.icons8.com/fluent/96/000000/trophy.png",
          xpPoints: 200,
          type: "area_completion",
        },
        {
          name: "First Assessment",
          description: "Passed your first assessment",
          imageUrl: "https://img.icons8.com/fluent/96/000000/test.png",
          xpPoints: 50,
          type: "assessment",
        },
        {
          name: "Perfect Score",
          description: "Achieved 100% on an assessment",
          imageUrl: "https://img.icons8.com/fluent/96/000000/medal.png",
          xpPoints: 75,
          type: "assessment_perfect",
        },
      ]);
      console.log("Badges created successfully!");
    } else {
      console.log("Badges already exist. Skipping creation.");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Only run seeding if this file is executed directly via node/tsx
// This prevents accidental execution when the file is imported
if (require.main === module) {
  console.log("Starting manual database seeding...");
  seedDatabase()
    .then(() => {
      console.log("Database seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database seeding failed:", error);
      process.exit(1);
    });
}
