import { db } from "./db";
import {
  users,
  userProgress,
  blockCompletions,
  badges,
  userBadges,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { eq, and, sql } from "drizzle-orm";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function seedDatabase() {
  try {
    console.log("Clearing all users except admin...");
    // Delete all users except admin
    await db.delete(users).where(sql`email != 'admin@vx-academy.ae'`);
    
    console.log("Checking for admin user...");
    // Check if admin user exists
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@vx-academy.ae"));

    if (adminUsers.length === 0) {
      console.log("Admin user not found, creating...");
      // Create admin user with new schema
      const hashedPassword = await hashPassword("admin123");
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
      console.log("Admin user exists, updating with new schema...");
      // Update existing admin user to match new schema
      const hashedPassword = await hashPassword("admin123");
      await db.update(users)
        .set({
          password: hashedPassword,
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
          isSubAdmin: false,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(users.email, "admin@vx-academy.ae"));
      console.log("Admin user updated successfully!");
    }

    // Check for badges
    const existingBadges = await db.select().from(badges);

    if (existingBadges.length === 0) {
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

      // Award badges to existing advanced users
      const advancedUser = await db
        .select()
        .from(users)
        .where(eq(users.username, "hassan"))
        .limit(1);
      if (advancedUser.length > 0) {
        const allBadges = await db.select().from(badges);

        // Award all badges to advanced user
        for (const badge of allBadges) {
          await db.insert(userBadges).values({
            userId: advancedUser[0].id,
            badgeId: badge.id,
            earnedAt: new Date(),
          });
        }
      }

      console.log("Badges created successfully!");
    } else {
      console.log("Badges already exist.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Starting database seeding...");
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
