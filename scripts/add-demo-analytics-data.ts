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
  assessments,
  units,
  courseUnits,
} from "@shared/schema";
import bcrypt from "bcrypt";
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
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function addDemoData() {
  try {
    console.log("Adding demo analytics data...");
    
    const db = await createSeedConnection();
    const hashedPassword = await hashPassword("password");

    // Clear existing demo data first
    console.log("Clearing existing demo data...");
    await db.execute(sql`DELETE FROM user_activity_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com')`);
    await db.execute(sql`DELETE FROM assessment_attempts WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com')`);
    await db.execute(sql`DELETE FROM user_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com')`);
    await db.execute(sql`DELETE FROM course_enrollments WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com')`);
    await db.execute(sql`DELETE FROM course_units`);
    await db.execute(sql`DELETE FROM assessments`);
    await db.execute(sql`DELETE FROM units`);
    await db.execute(sql`DELETE FROM courses WHERE title LIKE '%Falconry%'`);
    await db.execute(sql`DELETE FROM modules WHERE name LIKE '%Falconry%'`);
    await db.execute(sql`DELETE FROM training_areas WHERE name LIKE '%Heritage%'`);
    await db.execute(sql`DELETE FROM users WHERE email LIKE '%@demo.com'`);

    // Create demo users
    console.log("Creating demo users...");
    const demoUsers = await db.insert(users).values([
      {
        username: "demo_user_1",
        password: hashedPassword,
        email: "user1@demo.com",
        firstName: "Ahmed",
        lastName: "Al-Mansoori",
        role: "user",
        language: "Arabic",
        nationality: "United Arab Emirates",
        yearsOfExperience: "1-3 years",
        assets: "Museum",
        roleCategory: "Information desk staff",
        subCategory: "Junior",
        seniority: "Junior",
        organizationName: "VX Academy",
        xpPoints: 250,
      },
      {
        username: "demo_user_2",
        password: hashedPassword,
        email: "user2@demo.com",
        firstName: "Fatima",
        lastName: "Al-Zahra",
        role: "user",
        language: "English",
        nationality: "United Arab Emirates",
        yearsOfExperience: "3-5 years",
        assets: "Heritage Site",
        roleCategory: "Tour guide",
        subCategory: "Senior",
        seniority: "Senior",
        organizationName: "VX Academy",
        xpPoints: 450,
      },
      {
        username: "demo_user_3",
        password: hashedPassword,
        email: "user3@demo.com",
        firstName: "Mohammed",
        lastName: "Al-Rashid",
        role: "user",
        language: "English",
        nationality: "United Arab Emirates",
        yearsOfExperience: "5+ years",
        assets: "Cultural Center",
        roleCategory: "Educator",
        subCategory: "Manager",
        seniority: "Manager",
        organizationName: "VX Academy",
        xpPoints: 680,
      }
    ]).returning();

    console.log(`Created ${demoUsers.length} demo users`);

    // Create training areas
    const trainingArea = await db.insert(trainingAreas).values({
      name: "Abu Dhabi Heritage & Culture",
      description: "Learn about the rich heritage and culture of Abu Dhabi",
      imageUrl: "/images/heritage-bg.jpg"
    }).returning();

    // Create modules
    const module1 = await db.insert(modules).values({
      name: "Traditional Falconry",
      description: "Understanding the ancient art of falconry in UAE culture",
      trainingAreaId: trainingArea[0].id,
      order: 1
    }).returning();

    // Create courses
    const course1 = await db.insert(courses).values({
      title: "Introduction to Falconry",
      description: "Basic concepts and history of falconry in the UAE",
      trainingAreaId: trainingArea[0].id,
      moduleId: module1[0].id,
      duration: 30,
      difficultyLevel: "Beginner",
      order: 1,
      imageUrl: "/images/falconry-course.jpg"
    }).returning();

    const course2 = await db.insert(courses).values({
      title: "Advanced Falconry Techniques",
      description: "Advanced training methods and bird care",
      trainingAreaId: trainingArea[0].id,
      moduleId: module1[0].id,
      duration: 45,
      difficultyLevel: "Advanced",
      order: 2,
      imageUrl: "/images/falconry-advanced.jpg"
    }).returning();

    // Create units
    const unit1 = await db.insert(units).values({
      title: "History of Falconry",
      description: "Learn about the origins and cultural significance",
      order: 1
    }).returning();

    const unit2 = await db.insert(units).values({
      title: "Types of Falcons",
      description: "Different species used in traditional falconry",
      order: 2
    }).returning();

    // Link units to courses
    await db.insert(courseUnits).values([
      { courseId: course1[0].id, unitId: unit1[0].id, order: 1 },
      { courseId: course1[0].id, unitId: unit2[0].id, order: 2 },
      { courseId: course2[0].id, unitId: unit2[0].id, order: 1 }
    ]);

    // Create assessments
    const assessment1 = await db.insert(assessments).values({
      title: "Falconry Basics Quiz",
      description: "Test your knowledge of basic falconry concepts",
      unitId: unit1[0].id,
      timeLimit: 15,
      totalMarks: 100,
      passingMarks: 70
    }).returning();

    // Create course enrollments
    console.log("Creating course enrollments...");
    for (const user of demoUsers) {
      await db.insert(courseEnrollments).values([
        { userId: user.id, courseId: course1[0].id, enrollmentSource: "role_based" },
        { userId: user.id, courseId: course2[0].id, enrollmentSource: "manual" }
      ]);
    }

    // Create user progress
    console.log("Creating user progress...");
    for (const user of demoUsers) {
      await db.insert(userProgress).values([
        {
          userId: user.id,
          courseId: course1[0].id,
          progressPercentage: Math.floor(Math.random() * 100),
          completed: Math.random() > 0.5,
          lastAccessed: new Date()
        },
        {
          userId: user.id,
          courseId: course2[0].id,
          progressPercentage: Math.floor(Math.random() * 80),
          completed: false,
          lastAccessed: new Date()
        }
      ]);
    }

    // Create assessment attempts
    console.log("Creating assessment attempts...");
    for (const user of demoUsers) {
      await db.insert(assessmentAttempts).values({
        userId: user.id,
        assessmentId: assessment1[0].id,
        score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
        maxScore: 100,
        passed: true,
        startedAt: new Date(),
        completedAt: new Date()
      });
    }

    // Create user activity logs (login activities for the past 30 days)
    console.log("Creating user activity logs...");
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Some users log in each day
      for (const user of demoUsers) {
        if (Math.random() > 0.3) { // 70% chance of login each day
          await db.insert(userActivityLogs).values({
            userId: user.id,
            activity: "login",
            metadata: { loginMethod: "email", timestamp: date.toISOString() },
            createdAt: date
          });
          
          // Add some course activity
          if (Math.random() > 0.5) {
            await db.insert(userActivityLogs).values({
              userId: user.id,
              activity: "course_started",
              metadata: { courseId: course1[0].id, timestamp: date.toISOString() },
              createdAt: date
            });
          }
        }
      }
    }

    console.log("✅ Demo analytics data added successfully!");
    console.log("Summary:");
    console.log(`- ${demoUsers.length} demo users created`);
    console.log(`- 1 training area created`);
    console.log(`- 1 module created`);
    console.log(`- 2 courses created`);
    console.log(`- 2 units created`);
    console.log(`- 1 assessment created`);
    console.log(`- Course enrollments and progress created`);
    console.log(`- Assessment attempts created`);
    console.log(`- 30 days of user activity logs created`);
    
  } catch (error) {
    console.error("Error adding demo data:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('add-demo-analytics-data.ts')) {
  addDemoData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Demo data creation failed:", error);
      process.exit(1);
    });
} 