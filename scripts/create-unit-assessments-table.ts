import { pool } from '../server/db';

async function createUnitAssessmentsTable() {
  try {
    console.log('🔄 Creating unit_assessments table from scratch...');

    // Drop the table if it exists (for a clean slate)
    await pool.query('DROP TABLE IF EXISTS "unit_assessments" CASCADE;');
    console.log('✅ Dropped existing unit_assessments table');

    // Create the table with course_id
    await pool.query(`
      CREATE TABLE "unit_assessments" (
        "id" serial PRIMARY KEY NOT NULL,
        "unit_id" integer NOT NULL,
        "assessment_id" integer NOT NULL,
        "course_id" integer NOT NULL,
        "order" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Created unit_assessments table');

    // Add foreign key constraints
    await pool.query(`
      ALTER TABLE "unit_assessments"
      ADD CONSTRAINT "unit_assessments_unit_id_units_id_fk"
      FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await pool.query(`
      ALTER TABLE "unit_assessments"
      ADD CONSTRAINT "unit_assessments_assessment_id_assessments_id_fk"
      FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await pool.query(`
      ALTER TABLE "unit_assessments"
      ADD CONSTRAINT "unit_assessments_course_id_courses_id_fk"
      FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    console.log('✅ Added foreign key constraints');

    // Create unique index
    await pool.query(`
      CREATE UNIQUE INDEX "unit_assessments_unit_assessment_course_idx"
      ON "unit_assessments" ("unit_id", "assessment_id", "course_id");
    `);
    console.log('✅ Created unique index');

    // Add comments for documentation
    await pool.query(`
      COMMENT ON TABLE "unit_assessments" IS 'Explicit relationship table between units and assessments, per course, similar to course_units table';
    `);
    await pool.query(`
      COMMENT ON COLUMN "unit_assessments"."unit_id" IS 'Reference to the unit that contains this assessment';
    `);
    await pool.query(`
      COMMENT ON COLUMN "unit_assessments"."assessment_id" IS 'Reference to the assessment that belongs to this unit';
    `);
    await pool.query(`
      COMMENT ON COLUMN "unit_assessments"."course_id" IS 'Reference to the course that contains this unit-assessment relationship';
    `);
    await pool.query(`
      COMMENT ON COLUMN "unit_assessments"."order" IS 'Order of the assessment within the unit (default: 1)';
    `);
    console.log('✅ Added comments');

    // Populate the table with existing assessment data
    console.log('🔄 Populating unit_assessments table with existing assessment data...');
    
    // Get all assessments
    const assessmentsResult = await pool.query(`
      SELECT id, "unit_id", "course_id", "training_area_id", "module_id" 
      FROM assessments 
      ORDER BY id;
    `);
    
    console.log(`📊 Found ${assessmentsResult.rows.length} assessments to process`);
    
    let insertedCount = 0;
    
    for (const assessment of assessmentsResult.rows) {
      const assessmentId = assessment.id;
      const unitId = assessment.unit_id;
      const courseId = assessment.course_id;
      
      if (unitId && courseId) {
        // Assessment has both unitId and courseId - direct relationship
        await pool.query(`
          INSERT INTO "unit_assessments" ("unit_id", "assessment_id", "course_id", "order")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("unit_id", "assessment_id", "course_id") DO NOTHING;
        `, [unitId, assessmentId, courseId, 1]);
        insertedCount++;
        console.log(`✅ Inserted: Assessment ${assessmentId} -> Unit ${unitId} -> Course ${courseId}`);
      } else if (unitId && !courseId) {
        // Assessment has unitId but no courseId - need to find course from course_units
        const courseUnitsResult = await pool.query(`
          SELECT "course_id" FROM "course_units" WHERE "unit_id" = $1;
        `, [unitId]);
        
        for (const courseUnit of courseUnitsResult.rows) {
          await pool.query(`
            INSERT INTO "unit_assessments" ("unit_id", "assessment_id", "course_id", "order")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("unit_id", "assessment_id", "course_id") DO NOTHING;
          `, [unitId, assessmentId, courseUnit.course_id, 1]);
          insertedCount++;
          console.log(`✅ Inserted: Assessment ${assessmentId} -> Unit ${unitId} -> Course ${courseUnit.course_id} (from course_units)`);
        }
      } else if (!unitId && courseId) {
        // Assessment has courseId but no unitId - this is a course-level assessment
        // We need to find all units in this course and create relationships
        const courseUnitsResult = await pool.query(`
          SELECT "unit_id" FROM "course_units" WHERE "course_id" = $1;
        `, [courseId]);
        
        for (const courseUnit of courseUnitsResult.rows) {
          await pool.query(`
            INSERT INTO "unit_assessments" ("unit_id", "assessment_id", "course_id", "order")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("unit_id", "assessment_id", "course_id") DO NOTHING;
          `, [courseUnit.unit_id, assessmentId, courseId, 1]);
          insertedCount++;
          console.log(`✅ Inserted: Assessment ${assessmentId} -> Unit ${courseUnit.unit_id} -> Course ${courseId} (course-level assessment)`);
        }
      } else {
        // Assessment has neither unitId nor courseId - this is problematic
        console.log(`⚠️  Warning: Assessment ${assessmentId} has no unitId or courseId - skipping`);
      }
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} unit_assessment relationships`);

    // Show sample data
    const sampleData = await pool.query(`
      SELECT ua.*, a.title as assessment_title, u.name as unit_name, c.name as course_name
      FROM unit_assessments ua
      JOIN assessments a ON ua.assessment_id = a.id
      JOIN units u ON ua.unit_id = u.id
      JOIN courses c ON ua.course_id = c.id
      LIMIT 5;
    `);
    console.log('📊 Sample unit_assessments data:');
    sampleData.rows.forEach(row => {
      console.log(`  Assessment: "${row.assessment_title}" -> Unit: "${row.unit_name}" -> Course: "${row.course_name}"`);
    });

    console.log('🎉 Successfully created and populated unit_assessments table!');
  } catch (error) {
    console.error('❌ Error creating unit_assessments table:', error);
    throw error;
  }
}

createUnitAssessmentsTable()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 