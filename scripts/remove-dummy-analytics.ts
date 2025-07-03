import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  users,
  trainingAreas,
  modules,
  courses,
  userProgress,
  assessmentAttempts,
  userActivityLogs,
  courseEnrollments,
  dailyAnalytics,
  assessments,
  questions,
  units,
  courseUnits,
  learningBlocks,
  blockCompletions,
  badges,
  userBadges,
  roleMandatoryCourses,
  coursePrerequisites,
} from "@shared/schema";
import { sql, like, or, inArray } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

let seedDb: any;

async function createSeedConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set. Please check your .env file or Replit secrets.");
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

async function removeDummyAnalyticsData() {
  console.log("Starting to remove dummy analytics data...");
  
  const db = await createSeedConnection();

  try {
    // Remove in order to respect foreign key constraints
    console.log("Removing user badges...");
    const dummyBadges = await db.select().from(badges).where(
      or(
        like(badges.name, "%First Steps%"),
        like(badges.name, "%Dedicated Learner%"),
        like(badges.name, "%Assessment Master%"),
        like(badges.name, "%Heritage Expert%"),
        like(badges.name, "%Quick Learner%")
      )
    );
    
    if (dummyBadges.length > 0) {
      const badgeIds = dummyBadges.map(b => b.id);
      await db.delete(userBadges).where(inArray(userBadges.badgeId, badgeIds));
      await db.delete(badges).where(inArray(badges.id, badgeIds));
      console.log(`Removed ${dummyBadges.length} dummy badges and their user assignments`);
    }

    // Remove block completions for dummy users
    console.log("Removing block completions...");
    const dummyUsers = await db.select().from(users).where(
      or(
        like(users.email, "%@demo.com"),
        like(users.username, "user%"),
        like(users.organizationName, "%Demo%")
      )
    );
    
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(blockCompletions).where(inArray(blockCompletions.userId, userIds));
      console.log(`Removed block completions for ${dummyUsers.length} dummy users`);
    }

    // Remove user activity logs
    console.log("Removing user activity logs...");
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(userActivityLogs).where(inArray(userActivityLogs.userId, userIds));
      console.log("Removed user activity logs for dummy users");
    }

    // Remove assessment attempts
    console.log("Removing assessment attempts...");
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(assessmentAttempts).where(inArray(assessmentAttempts.userId, userIds));
      console.log("Removed assessment attempts for dummy users");
    }

    // Remove user progress
    console.log("Removing user progress...");
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(userProgress).where(inArray(userProgress.userId, userIds));
      console.log("Removed user progress for dummy users");
    }

    // Remove course enrollments
    console.log("Removing course enrollments...");
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(courseEnrollments).where(inArray(courseEnrollments.userId, userIds));
      console.log("Removed course enrollments for dummy users");
    }

    // Remove dummy users (but preserve admin user)
    console.log("Removing dummy users...");
    if (dummyUsers.length > 0) {
      const userIds = dummyUsers.map(u => u.id);
      await db.delete(users).where(inArray(users.id, userIds));
      console.log(`Removed ${dummyUsers.length} dummy users`);
    }

    // Remove questions for dummy assessments
    console.log("Removing assessment questions...");
    const dummyAssessments = await db.select().from(assessments).where(
      or(
        like(assessments.title, "%Course 1%"),
        like(assessments.title, "%Course 2%"),
        like(assessments.title, "%Course 3%"),
        like(assessments.description, "%Assessment for%")
      )
    );
    
    if (dummyAssessments.length > 0) {
      const assessmentIds = dummyAssessments.map(a => a.id);
      await db.delete(questions).where(inArray(questions.assessmentId, assessmentIds));
      console.log(`Removed questions for ${dummyAssessments.length} dummy assessments`);
    }

    // Remove dummy assessments
    console.log("Removing dummy assessments...");
    if (dummyAssessments.length > 0) {
      const assessmentIds = dummyAssessments.map(a => a.id);
      await db.delete(assessments).where(inArray(assessments.id, assessmentIds));
      console.log(`Removed ${dummyAssessments.length} dummy assessments`);
    }

    // Remove learning blocks for dummy units
    console.log("Removing learning blocks...");
    const dummyUnits = await db.select().from(units).where(
      like(units.name, "Unit %: Essential Skills")
    );
    
    if (dummyUnits.length > 0) {
      const unitIds = dummyUnits.map(u => u.id);
      await db.delete(learningBlocks).where(inArray(learningBlocks.unitId, unitIds));
      console.log(`Removed learning blocks for ${dummyUnits.length} dummy units`);
    }

    // Remove course-unit relationships
    console.log("Removing course-unit relationships...");
    const dummyCourses = await db.select().from(courses).where(
      or(
        like(courses.name, "%- Course 1"),
        like(courses.name, "%- Course 2"),
        like(courses.name, "%- Course 3")
      )
    );
    
    if (dummyCourses.length > 0) {
      const courseIds = dummyCourses.map(c => c.id);
      await db.delete(courseUnits).where(inArray(courseUnits.courseId, courseIds));
      console.log(`Removed course-unit relationships for ${dummyCourses.length} dummy courses`);
    }

    // Remove dummy courses
    console.log("Removing dummy courses...");
    if (dummyCourses.length > 0) {
      const courseIds = dummyCourses.map(c => c.id);
      await db.delete(courses).where(inArray(courses.id, courseIds));
      console.log(`Removed ${dummyCourses.length} dummy courses`);
    }

    // Remove dummy units
    console.log("Removing dummy units...");
    if (dummyUnits.length > 0) {
      const unitIds = dummyUnits.map(u => u.id);
      await db.delete(units).where(inArray(units.id, unitIds));
      console.log(`Removed ${dummyUnits.length} dummy units`);
    }

    // Remove dummy modules
    console.log("Removing dummy modules...");
    const dummyModules = await db.select().from(modules).where(
      or(
        like(modules.name, "%Basics"),
        like(modules.name, "%Advanced")
      )
    );
    
    if (dummyModules.length > 0) {
      const moduleIds = dummyModules.map(m => m.id);
      await db.delete(modules).where(inArray(modules.id, moduleIds));
      console.log(`Removed ${dummyModules.length} dummy modules`);
    }

    // Remove dummy training areas
    console.log("Removing dummy training areas...");
    const dummyAreas = await db.select().from(trainingAreas).where(
      or(
        like(trainingAreas.name, "%Abu Dhabi Heritage%"),
        like(trainingAreas.name, "%Museum Operations%"),
        like(trainingAreas.name, "%Customer Service%"),
        like(trainingAreas.name, "%Safety & Security%"),
        like(trainingAreas.name, "%Cultural Tourism%")
      )
    );
    
    if (dummyAreas.length > 0) {
      const areaIds = dummyAreas.map(a => a.id);
      await db.delete(trainingAreas).where(inArray(trainingAreas.id, areaIds));
      console.log(`Removed ${dummyAreas.length} dummy training areas`);
    }

    // Remove daily analytics (all of it since it's all dummy data)
    console.log("Removing daily analytics...");
    await db.delete(dailyAnalytics);
    console.log("Removed all daily analytics records");

    console.log("✅ All dummy analytics data removed successfully!");

  } catch (error) {
    console.error("Error removing dummy data:", error);
    throw error;
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('remove-dummy-analytics.ts')) {
  removeDummyAnalyticsData()
    .then(() => {
      console.log("Dummy analytics data removal completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to remove dummy analytics data:", error);
      process.exit(1);
    });
}

export { removeDummyAnalyticsData }; 