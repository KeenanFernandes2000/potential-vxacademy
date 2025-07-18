import { db } from "../server/db";
import { userAssessmentProgress } from "../shared/schema";
import { sql } from "drizzle-orm";

async function cleanupDuplicateAssessmentProgress() {
  console.log("Starting cleanup of duplicate assessment progress records...");

  try {
    // Find duplicate records (same user, unit, assessment but different courses)
    const duplicates = await db.execute(sql`
      WITH duplicates AS (
        SELECT 
          user_id,
          unit_id,
          assessment_id,
          COUNT(*) as count,
          MIN(id) as keep_id,
          array_agg(id) as all_ids
        FROM user_assessment_progress
        GROUP BY user_id, unit_id, assessment_id
        HAVING COUNT(*) > 1
      )
      SELECT * FROM duplicates
    `);

    console.log(`Found ${duplicates.length} sets of duplicate records`);

    for (const duplicate of duplicates) {
      const { user_id, unit_id, assessment_id, keep_id, all_ids } = duplicate;
      
      console.log(`Processing duplicates for user ${user_id}, unit ${unit_id}, assessment ${assessment_id}`);
      console.log(`  Keeping record ${keep_id}, removing ${all_ids.length - 1} others`);

      // Delete all duplicate records except the one with the lowest ID
      const idsToDelete = all_ids.filter((id: number) => id !== keep_id);
      
      if (idsToDelete.length > 0) {
        await db
          .delete(userAssessmentProgress)
          .where(sql`id = ANY(${idsToDelete})`);
        
        console.log(`  Deleted ${idsToDelete.length} duplicate records`);
      }
    }

    console.log("Cleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateAssessmentProgress()
  .then(() => {
    console.log("Cleanup script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Cleanup script failed:", error);
    process.exit(1);
  }); 