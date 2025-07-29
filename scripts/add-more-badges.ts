import { db } from "../server/db";
import { badges } from "@shared/schema";

export async function addMoreBadges() {
  try {
    console.log("Adding more badges to the system...");

    // Check existing badges
    const existingBadges = await db.select().from(badges);
    console.log(`Found ${existingBadges.length} existing badges`);

    // Add more comprehensive badges
    const newBadges = [
      {
        name: "Learning Streak",
        description: "Completed learning activities for 7 consecutive days",
        imageUrl: "https://img.icons8.com/fluent/96/000000/fire.png",
        xpPoints: 150,
        type: "streak",
      },
      {
        name: "Speed Learner",
        description: "Completed a course in under 24 hours",
        imageUrl: "https://img.icons8.com/fluent/96/000000/rocket.png",
        xpPoints: 200,
        type: "speed",
      },
      {
        name: "Assessment Master",
        description: "Passed 10 assessments with 90% or higher",
        imageUrl: "https://img.icons8.com/fluent/96/000000/graduation-cap.png",
        xpPoints: 300,
        type: "assessment_master",
      },
      {
        name: "Course Explorer",
        description: "Enrolled in 5 different courses",
        imageUrl: "https://img.icons8.com/fluent/96/000000/compass.png",
        xpPoints: 100,
        type: "explorer",
      },
      {
        name: "Perfect Attendance",
        description: "Logged in and completed activities for 30 consecutive days",
        imageUrl: "https://img.icons8.com/fluent/96/000000/calendar.png",
        xpPoints: 500,
        type: "attendance",
      },
      {
        name: "Knowledge Seeker",
        description: "Completed 50 learning blocks",
        imageUrl: "https://img.icons8.com/fluent/96/000000/book.png",
        xpPoints: 250,
        type: "blocks",
      },
      {
        name: "Certificate Collector",
        description: "Earned 5 certificates",
        imageUrl: "https://img.icons8.com/fluent/96/000000/certificate.png",
        xpPoints: 400,
        type: "certificates",
      },
      {
        name: "Early Bird",
        description: "Completed your first course within 7 days of enrollment",
        imageUrl: "https://img.icons8.com/fluent/96/000000/sunrise.png",
        xpPoints: 175,
        type: "early_bird",
      },
    ];

    // Insert new badges
    for (const badge of newBadges) {
      // Check if badge already exists
      const existingBadge = existingBadges.find(
        (b) => b.name === badge.name || b.type === badge.type
      );
      
      if (!existingBadge) {
        await db.insert(badges).values(badge);
        console.log(`✓ Added badge: ${badge.name}`);
      } else {
        console.log(`- Skipped existing badge: ${badge.name}`);
      }
    }

    console.log("Badge addition completed!");
    
    // Show final count
    const finalBadges = await db.select().from(badges);
    console.log(`Total badges in system: ${finalBadges.length}`);
    
    // List all badges
    console.log("\nAll available badges:");
    finalBadges.forEach((badge, index) => {
      console.log(`${index + 1}. ${badge.name} (${badge.type}) - ${badge.xpPoints} XP`);
    });

  } catch (error) {
    console.error("Error adding badges:", error);
    throw error;
  }
}

// Run the script
addMoreBadges()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 