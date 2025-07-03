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

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDays: number, endDays: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - (startDays * 24 * 60 * 60 * 1000));
  const end = new Date(now.getTime() - (endDays * 24 * 60 * 60 * 1000));
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function insertDummyAnalyticsData() {
  console.log("Starting to insert dummy analytics data...");
  
  const db = await createSeedConnection();

  // Insert Training Areas
  console.log("Creating training areas...");
  const trainingAreaData = [
    { name: "Abu Dhabi Heritage", description: "Learn about Abu Dhabi's rich cultural heritage", imageUrl: "https://via.placeholder.com/400x300" },
    { name: "Museum Operations", description: "Museum management and operations", imageUrl: "https://via.placeholder.com/400x300" },
    { name: "Customer Service", description: "Excellence in visitor experience", imageUrl: "https://via.placeholder.com/400x300" },
    { name: "Safety & Security", description: "Safety protocols and security measures", imageUrl: "https://via.placeholder.com/400x300" },
    { name: "Cultural Tourism", description: "Cultural tourism and hospitality", imageUrl: "https://via.placeholder.com/400x300" }
  ];

  const insertedAreas = await db.insert(trainingAreas).values(trainingAreaData).returning();

  // Insert Modules
  console.log("Creating modules...");
  const modulePromises = insertedAreas.map(area => {
    const moduleData = [
      { trainingAreaId: area.id, name: `${area.name} Basics`, description: `Introduction to ${area.name}`, imageUrl: "https://via.placeholder.com/300x200" },
      { trainingAreaId: area.id, name: `${area.name} Advanced`, description: `Advanced concepts in ${area.name}`, imageUrl: "https://via.placeholder.com/300x200" }
    ];
    return db.insert(modules).values(moduleData).returning();
  });

  const insertedModules = (await Promise.all(modulePromises)).flat();

  // Insert Units
  console.log("Creating units...");
  const unitData = [];
  for (let i = 1; i <= 20; i++) {
    unitData.push({
      name: `Unit ${i}: Essential Skills`,
      description: `Learning unit covering essential skills and knowledge`,
      order: i,
      duration: 30 + Math.floor(Math.random() * 60),
      xpPoints: 50 + Math.floor(Math.random() * 100),
    });
  }

  const insertedUnits = await db.insert(units).values(unitData).returning();

  // Insert Courses
  console.log("Creating courses...");
  const courseData = [];
  insertedModules.forEach(module => {
    for (let i = 1; i <= 3; i++) {
      courseData.push({
        trainingAreaId: module.trainingAreaId,
        moduleId: module.id,
        name: `${module.name} - Course ${i}`,
        description: `Comprehensive course covering important aspects of ${module.name}`,
        imageUrl: "https://via.placeholder.com/400x250",
        courseType: Math.random() > 0.5 ? "free" : "sequential",
        duration: 60 + Math.floor(Math.random() * 120),
        level: getRandomElement(["beginner", "intermediate", "advanced"]),
        estimatedDuration: `${1 + Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m`,
        difficultyLevel: getRandomElement(["Easy", "Medium", "Hard"])
      });
    }
  });

  const insertedCourses = await db.insert(courses).values(courseData).returning();

  // Link units to courses
  console.log("Linking units to courses...");
  const courseUnitData = [];
  insertedCourses.forEach(course => {
    const numUnits = 2 + Math.floor(Math.random() * 4);
    const selectedUnits = insertedUnits.slice(0, numUnits);
    selectedUnits.forEach((unit, index) => {
      courseUnitData.push({
        courseId: course.id,
        unitId: unit.id,
        order: index + 1
      });
    });
  });

  await db.insert(courseUnits).values(courseUnitData);

  // Insert Learning Blocks
  console.log("Creating learning blocks...");
  const learningBlockData = [];
  insertedUnits.forEach(unit => {
    const blockTypes = ["video", "text", "interactive"];
    for (let i = 1; i <= 3; i++) {
      learningBlockData.push({
        unitId: unit.id,
        type: getRandomElement(blockTypes),
        title: `Learning Block ${i} - ${unit.name}`,
        content: `This is educational content for learning block ${i}`,
        order: i,
        xpPoints: 10 + Math.floor(Math.random() * 20)
      });
    }
  });

  await db.insert(learningBlocks).values(learningBlockData);

  // Insert Assessments
  console.log("Creating assessments...");
  const assessmentData = [];
  insertedCourses.forEach(course => {
    if (Math.random() > 0.3) {
      assessmentData.push({
        courseId: course.id,
        title: `${course.name} Assessment`,
        description: `Assessment for ${course.name}`,
        placement: Math.random() > 0.5 ? "end" : "beginning",
        isGraded: true,
        passingScore: 70 + Math.floor(Math.random() * 20),
        hasTimeLimit: Math.random() > 0.5,
        timeLimit: Math.random() > 0.5 ? 30 + Math.floor(Math.random() * 60) : null,
        maxRetakes: 3,
        hasCertificate: Math.random() > 0.7,
        xpPoints: 100 + Math.floor(Math.random() * 100)
      });
    }
  });

  const insertedAssessments = await db.insert(assessments).values(assessmentData).returning();

  // Insert Questions for Assessments
  console.log("Creating assessment questions...");
  const questionData = [];
  insertedAssessments.forEach(assessment => {
    const numQuestions = 5 + Math.floor(Math.random() * 10);
    for (let i = 1; i <= numQuestions; i++) {
      questionData.push({
        assessmentId: assessment.id,
        questionText: `Question ${i}: This is a sample question for ${assessment.title}?`,
        questionType: "mcq",
        options: JSON.stringify([
          "Option A - Correct answer",
          "Option B - Incorrect",
          "Option C - Incorrect", 
          "Option D - Incorrect"
        ]),
        correctAnswer: "0",
        order: i
      });
    }
  });

  await db.insert(questions).values(questionData);

  // Insert dummy users
  console.log("Creating dummy users...");
  const roleCategories = ["Transport staff", "Welcome staff", "Guides", "Information desk staff", "Security", "Management"];
  const assets = ["Museum", "Culture site", "Events", "Heritage sites", "Tourism centers"];
  const seniorities = ["Manager", "Senior Staff", "Staff", "Junior Staff"];
  const nationalities = ["United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon", "India", "Philippines", "Pakistan"];

  const userData = [];
  for (let i = 1; i <= 50; i++) {
    const createdDate = getRandomDate(90, 0);
    userData.push({
      firstName: `User${i}`,
      lastName: `Demo`,
      email: `user${i}@demo.com`,
      username: `user${i}`,
      password: await bcrypt.hash("password", 10),
      role: i <= 5 ? "admin" : i <= 10 ? "sub-admin" : "user",
      language: "English",
      nationality: getRandomElement(nationalities),
      yearsOfExperience: getRandomElement(["1-2 years", "3-5 years", "6-10 years", "10+ years"]),
      assets: getRandomElement(assets),
      roleCategory: getRandomElement(roleCategories),
      subCategory: getRandomElement(["Senior", "Junior", "Lead", "Associate"]),
      seniority: getRandomElement(seniorities),
      organizationName: "VX Academy Demo",
      xpPoints: Math.floor(Math.random() * 5000),
      createdAt: createdDate,
      updatedAt: createdDate
    });
  }

  const insertedUsers = await db.insert(users).values(userData).returning();

  // Insert Course Enrollments
  console.log("Creating course enrollments...");
  const enrollmentData = [];
  insertedUsers.forEach(user => {
    const numCourses = 2 + Math.floor(Math.random() * 8);
    const selectedCourses = insertedCourses.sort(() => 0.5 - Math.random()).slice(0, numCourses);
    
    selectedCourses.forEach(course => {
      const enrolledDate = getRandomDate(60, 0);
      enrollmentData.push({
        userId: user.id,
        courseId: course.id,
        enrolledAt: enrolledDate,
        enrollmentSource: getRandomElement(["manual", "role_based", "admin_assigned"])
      });
    });
  });

  await db.insert(courseEnrollments).values(enrollmentData);

  // Insert User Progress
  console.log("Creating user progress...");
  const progressData = [];
  insertedUsers.forEach(user => {
    const userEnrollments = enrollmentData.filter(e => e.userId === user.id);
    userEnrollments.forEach(enrollment => {
      const completed = Math.random() > 0.4;
      const percentComplete = completed ? 100 : Math.floor(Math.random() * 90) + 10;
      const lastAccessed = getRandomDate(30, 0);
      
      progressData.push({
        userId: user.id,
        courseId: enrollment.courseId,
        completed,
        percentComplete,
        lastAccessed,
        createdAt: enrollment.enrolledAt,
        updatedAt: lastAccessed
      });
    });
  });

  await db.insert(userProgress).values(progressData);

  // Insert Assessment Attempts
  console.log("Creating assessment attempts...");
  const attemptData = [];
  insertedUsers.forEach(user => {
    const userCourses = progressData.filter(p => p.userId === user.id);
    userCourses.forEach(progress => {
      const courseAssessments = insertedAssessments.filter(a => a.courseId === progress.courseId);
      courseAssessments.forEach(assessment => {
        if (Math.random() > 0.3) {
          const numAttempts = 1 + Math.floor(Math.random() * 3);
          for (let attempt = 0; attempt < numAttempts; attempt++) {
            const score = 40 + Math.floor(Math.random() * 60);
            const passed = score >= (assessment.passingScore || 70);
            const attemptDate = getRandomDate(45, 0);
            
            attemptData.push({
              userId: user.id,
              assessmentId: assessment.id,
              score,
              passed,
              answers: JSON.stringify({ example: "user answers" }),
              startedAt: attemptDate,
              completedAt: new Date(attemptDate.getTime() + Math.random() * 3600000)
            });
            
            if (passed) break;
          }
        }
      });
    });
  });

  await db.insert(assessmentAttempts).values(attemptData);

  // Insert User Activity Logs
  console.log("Creating user activity logs...");
  const activityTypes = ["login", "logout", "course_started", "course_completed", "assessment_started", "assessment_completed", "video_watched", "content_viewed"];
  const activityData = [];
  
  insertedUsers.forEach(user => {
    const numActivities = 10 + Math.floor(Math.random() * 50);
    for (let i = 0; i < numActivities; i++) {
      const activityDate = getRandomDate(60, 0);
      activityData.push({
        userId: user.id,
        activity: getRandomElement(activityTypes),
        metadata: JSON.stringify({ sessionId: `session_${Math.random().toString(36).substr(2, 9)}` }),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Demo Browser)",
        createdAt: activityDate
      });
    }
  });

  await db.insert(userActivityLogs).values(activityData);

  // Insert Daily Analytics
  console.log("Creating daily analytics...");
  const dailyAnalyticsData = [];
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayActivities = activityData.filter(a => {
      const activityDate = new Date(a.createdAt);
      return activityDate.toDateString() === date.toDateString();
    });
    
    const dayEnrollments = enrollmentData.filter(e => {
      const enrollDate = new Date(e.enrolledAt);
      return enrollDate.toDateString() === date.toDateString();
    });
    
    const dayUsers = userData.filter(u => {
      const userDate = new Date(u.createdAt);
      return userDate.toDateString() === date.toDateString();
    });
    
    const dayCompletions = progressData.filter(p => {
      if (!p.completed) return false;
      const progressDate = new Date(p.lastAccessed);
      return progressDate.toDateString() === date.toDateString();
    });
    
    const dayAssessments = attemptData.filter(a => {
      const attemptDate = new Date(a.startedAt);
      return attemptDate.toDateString() === date.toDateString();
    });
    
    dailyAnalyticsData.push({
      date,
      totalUsers: Math.min(insertedUsers.length, Math.floor(Math.random() * insertedUsers.length) + (90 - i)),
      activeUsers: new Set(dayActivities.map(a => a.userId)).size,
      newUsers: dayUsers.length,
      newEnrollments: dayEnrollments.length,
      courseCompletions: dayCompletions.length,
      assessmentAttempts: dayAssessments.length,
      averageSessionDuration: 30 + Math.floor(Math.random() * 60)
    });
  }

  await db.insert(dailyAnalytics).values(dailyAnalyticsData);

  console.log("✅ Dummy analytics data inserted successfully!");
  console.log(`Created:`);
  console.log(`- ${insertedAreas.length} training areas`);
  console.log(`- ${insertedModules.length} modules`);
  console.log(`- ${insertedCourses.length} courses`);
  console.log(`- ${insertedUsers.length} users`);
  console.log(`- ${enrollmentData.length} enrollments`);
  console.log(`- ${progressData.length} progress records`);
  console.log(`- ${attemptData.length} assessment attempts`);
  console.log(`- ${activityData.length} activity logs`);
  console.log(`- ${dailyAnalyticsData.length} daily analytics records`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('insert-dummy-analytics.ts')) {
  insertDummyAnalyticsData()
    .then(() => {
      console.log("Dummy analytics data insertion completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to insert dummy analytics data:", error);
      process.exit(1);
    });
}

export { insertDummyAnalyticsData }; 