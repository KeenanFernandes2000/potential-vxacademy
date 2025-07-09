import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { handleTutorMessage } from "./ai-tutor";
import { NotificationTriggers } from "./notification-triggers";
import { hashPassword } from "@shared/auth-utils";
import {
  uploadScormPackage,
  handleScormUpload,
  getScormPackages,
  getScormPackage,
  serveScormFile,
  saveScormTrackingData,
  getScormTrackingData,
} from "./scorm-handler";
import {
  uploadImage,
  handleImageUpload,
  serveImageFile,
} from "./image-handler";
import {
  uploadCertificateTemplate,
  handleCertificateTemplateUpload,
} from "./certificate-handler";
import { uploadExcel, processExcelUpload } from "./excel-upload-handler";
import {
  uploadMedia,
  handleMediaUpload,
  getMediaFiles,
  deleteMediaFile,
  bulkDeleteMediaFiles,
  serveMediaFile,
} from "./media-handler";
import {
  requirePermission,
  requireAdmin,
  requireAdminOrSubAdmin,
  hasPermission,
  getUserPermissions,
  canManageUser,
} from "./permissions";

// Helper function to generate certificate HTML
function generateCertificateHTML({ certificate, course, user }: { 
  certificate: any, 
  course: any, 
  user: any 
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate - ${user.firstName} ${user.lastName}</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                font-family: 'Georgia', serif;
                background: #f5f5f5;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .certificate {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 8px double #0d9488;
                padding: 60px;
                position: relative;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .corner {
                position: absolute;
                width: 40px;
                height: 40px;
                border: 3px solid #0d9488;
            }
            
            .corner.top-left {
                top: 20px;
                left: 20px;
                border-right: none;
                border-bottom: none;
            }
            
            .corner.top-right {
                top: 20px;
                right: 20px;
                border-left: none;
                border-bottom: none;
            }
            
            .corner.bottom-left {
                bottom: 20px;
                left: 20px;
                border-right: none;
                border-top: none;
            }
            
            .corner.bottom-right {
                bottom: 20px;
                right: 20px;
                border-left: none;
                border-top: none;
            }
            
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .logo-circle {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #0d9488, #06b6d4);
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            
            .academy-name {
                font-size: 32px;
                font-weight: bold;
                color: #0f766e;
                margin: 0;
            }
            
            .divider {
                width: 120px;
                height: 3px;
                background: linear-gradient(to right, #0d9488, #06b6d4);
                margin: 10px auto 40px;
            }
            
            .certificate-title {
                text-align: center;
                font-size: 36px;
                font-weight: bold;
                color: #374151;
                margin-bottom: 30px;
            }
            
            .certifies-text {
                text-align: center;
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 20px;
            }
            
            .recipient-name {
                text-align: center;
                font-size: 42px;
                font-weight: bold;
                color: #0f766e;
                margin: 30px 0;
                border-bottom: 2px solid #a7f3d0;
                padding-bottom: 10px;
            }
            
            .completion-text {
                text-align: center;
                font-size: 18px;
                color: #4b5563;
                margin-bottom: 15px;
            }
            
            .course-name {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                color: #374151;
                background: #f9fafb;
                padding: 20px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                margin: 20px 0 40px;
            }
            
            .certificate-details {
                display: flex;
                justify-content: center;
                gap: 60px;
                margin-bottom: 50px;
            }
            
            .detail-item {
                text-align: center;
            }
            
            .detail-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .detail-value {
                font-size: 16px;
                font-weight: bold;
                color: #374151;
                font-family: 'Courier New', monospace;
            }
            
            .signature-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 60px;
            }
            
            .signature {
                text-align: center;
                width: 200px;
            }
            
            .signature-line {
                width: 180px;
                height: 2px;
                background: #9ca3af;
                margin: 0 auto 10px;
            }
            
            .signature-title {
                font-size: 14px;
                font-weight: 600;
                color: #4b5563;
            }
            
            .signature-subtitle {
                font-size: 12px;
                color: #6b7280;
            }
            
            .seal {
                width: 80px;
                height: 80px;
                background: #d1fae5;
                border: 2px solid #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: #047857;
                text-align: center;
                margin-bottom: 10px;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .certificate { 
                    box-shadow: none; 
                    page-break-inside: avoid;
                }
                @page {
                    margin: 0.5in;
                    size: landscape;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
            
            <div class="logo">
                <div class="logo-circle">VX</div>
                <h1 class="academy-name">VX Academy</h1>
                <div class="divider"></div>
            </div>
            
            <h2 class="certificate-title">Certificate of Completion</h2>
            
            <p class="certifies-text">This is to certify that</p>
            
            <div class="recipient-name">${user.firstName} ${user.lastName}</div>
            
            <p class="completion-text">has successfully completed the course</p>
            
            <div class="course-name">${course.name}</div>
            
            <div class="certificate-details">
                <div class="detail-item">
                    <div class="detail-label">Certificate ID</div>
                    <div class="detail-value">${certificate.certificateNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date Issued</div>
                    <div class="detail-value">${formatDate(certificate.createdAt)}</div>
                </div>
            </div>
            
            <div class="signature-section">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-title">Director, VX Academy</div>
                    <div class="signature-subtitle">Abu Dhabi, UAE</div>
                </div>
                <div style="text-align: center;">
                    <div class="seal">OFFICIAL<br>SEAL</div>
                    <div class="signature-subtitle">Official Seal</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Helper function to calculate and update course progress
async function updateCourseProgress(userId: number, courseId: number) {
  try {
    // Get all units for this course
    const units = await storage.getUnits(courseId);
    
    if (units.length === 0) {
      // No units in course, mark as complete
      await storage.updateUserProgress(userId, courseId, {
        percentComplete: 100,
        completed: true,
        lastAccessed: new Date()
      });
      return;
    }

    let totalItems = 0;
    let completedItems = 0;

    // Calculate progress for each unit
    for (const unit of units) {
      // Get blocks for this unit
      const blocks = await storage.getLearningBlocks(unit.id);
      totalItems += blocks.length;

      // Count completed blocks
      for (const block of blocks) {
        const blockCompletion = await storage.getBlockCompletion(userId, block.id);
        if (blockCompletion && blockCompletion.completed) {
          completedItems++;
        }
      }

      // Get assessments for this unit
      const assessments = await storage.getAssessments(unit.id);
      totalItems += assessments.length;

      // Count passed assessments
      for (const assessment of assessments) {
        const attempts = await storage.getAssessmentAttempts(userId, assessment.id);
        if (attempts.some(attempt => attempt.passed)) {
          completedItems++;
        }
      }
    }

    // Get course-level assessments
    let courseAssessments = [];
    try {
      // Try to get course assessments - they should be stored with courseId field
      const allAssessments = await storage.getAllAssessments();
      courseAssessments = allAssessments.filter(assessment => assessment.courseId === courseId);
    } catch (error) {
      console.error("Error fetching course assessments:", error);
      courseAssessments = [];
    }
    totalItems += courseAssessments.length;

    // Count passed course assessments
    for (const assessment of courseAssessments) {
      const attempts = await storage.getAssessmentAttempts(userId, assessment.id);
      if (attempts.some(attempt => attempt.passed)) {
        completedItems++;
      }
    }

    // Calculate percentage
    const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
    const completed = percentComplete === 100;

    // Update or create user progress record
    try {
      const existingProgress = await storage.getUserProgress(userId, courseId);
      if (existingProgress) {
        console.log(`Updating existing progress: user ${userId}, course ${courseId}, ${percentComplete}%`);
        await storage.updateUserProgress(userId, courseId, {
          percentComplete,
          completed,
          lastAccessed: new Date()
        });
      } else {
        console.log(`Creating new progress record: user ${userId}, course ${courseId}, ${percentComplete}%`);
        // Create new progress record if it doesn't exist
        await storage.createUserProgress({
          userId,
          courseId,
          percentComplete,
          completed,
          lastAccessed: new Date()
        });
      }

      console.log(`✓ Successfully updated course progress for user ${userId}, course ${courseId}: ${percentComplete}% (${completedItems}/${totalItems} items)`);
      
      // Verify the update worked by fetching the progress again
      const verifyProgress = await storage.getUserProgress(userId, courseId);
      console.log(`✓ Verified progress update:`, verifyProgress);
      
    } catch (progressError) {
      console.error(`Failed to update/create progress for user ${userId}, course ${courseId}:`, progressError);
      throw progressError;
    }
  } catch (error) {
    console.error("Error calculating course progress:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Initialize notification triggers
  const notificationTriggers = new NotificationTriggers(storage);

  // Serve static files from the public directory
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public/uploads")),
  );

  // Add endpoint to get user permissions
  app.get("/api/user/permissions", (req, res) => {
    const permissions = getUserPermissions(req.user);
    res.json(permissions);
  });

  // Order validation endpoints
  app.post("/api/validate/unit-order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { order, excludeId } = req.body;
      const isUnique = await storage.checkUniqueUnitOrder(order, excludeId);
      res.json({ isUnique });
    } catch (error) {
      res.status(500).json({ message: "Error validating order" });
    }
  });

  app.post("/api/validate/learning-block-order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { unitId, order, excludeId } = req.body;
      const isUnique = await storage.checkUniqueLearningBlockOrder(unitId, order, excludeId);
      res.json({ isUnique });
    } catch (error) {
      res.status(500).json({ message: "Error validating order" });
    }
  });

  // API routes
  // Courses - Protected for admin only
  app.get("/api/courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  // Training Areas - Protected for admin only
  app.get("/api/training-areas", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const areas = await storage.getTrainingAreas();
      res.json(areas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training areas" });
    }
  });

  // Modules - Protected for admin only
  app.get("/api/modules", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const trainingAreaId = req.query.trainingAreaId
        ? parseInt(req.query.trainingAreaId as string)
        : undefined;

      const modules = await storage.getModules(trainingAreaId);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Error fetching modules" });
    }
  });

  // Units
  app.get("/api/courses/:courseId/units", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const units = await storage.getUnits(courseId);
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Error fetching units" });
    }
  });

  app.get("/api/units", async (req, res) => {
    try {
      const courseId = req.query.courseId
        ? parseInt(req.query.courseId as string)
        : undefined;

      console.log("Fetching units, courseId:", courseId);

      // If courseId is provided, get units for that course, otherwise get all units
      let units;
      if (courseId) {
        units = await storage.getUnits(courseId);
      } else {
        units = await storage.getAllUnits();
      }

      console.log("Units fetched successfully:", units?.length);
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res
        .status(500)
        .json({
          message: "Error fetching units",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const { courseIds, ...unitData } = req.body;

      // Create the unit first
      const unit = await storage.createUnit(unitData);

      // Then create course-unit associations if courseIds are provided
      if (courseIds && Array.isArray(courseIds)) {
        for (const courseId of courseIds) {
          const courseIdNum =
            typeof courseId === "string" ? parseInt(courseId) : courseId;
          await storage.addUnitToCourse(
            courseIdNum,
            unit.id,
            unitData.order || 1,
          );
        }
      }

      res.status(201).json(unit);
    } catch (error) {
      console.error("Error creating unit:", error);
      res.status(500).json({ message: "Error creating unit" });
    }
  });

  app.patch("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { courseIds, ...unitData } = req.body;

      // Update the unit data
      const unit = await storage.updateUnit(id, unitData);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }

      // Update course associations if courseIds are provided
      if (courseIds && Array.isArray(courseIds)) {
        // Convert courseIds to numbers if they're strings
        const normalizedCourseIds = courseIds.map((id) =>
          typeof id === "string" ? parseInt(id) : id,
        );

        // Get current courses for this unit
        const currentCourses = await storage.getCoursesForUnit(id);
        const currentCourseIds = currentCourses.map((c) => c.id);

        // Remove associations that are no longer needed
        for (const courseId of currentCourseIds) {
          if (!normalizedCourseIds.includes(courseId)) {
            await storage.removeUnitFromCourse(courseId, id);
          }
        }

        // Add new associations
        for (const courseId of normalizedCourseIds) {
          if (!currentCourseIds.includes(courseId)) {
            await storage.addUnitToCourse(courseId, id, unitData.order || 1);
          }
        }
      }

      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Error updating unit" });
    }
  });

  app.get("/api/units/:id/courses", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const courses = await storage.getCoursesForUnit(id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses for unit" });
    }
  });

  // Course-Units relationships
  app.get("/api/course-units", async (req, res) => {
    try {
      const courseUnits = await storage.getCourseUnits();
      res.json(courseUnits);
    } catch (error) {
      console.error("Error fetching course-units:", error);
      res.status(500).json({ message: "Error fetching course-units" });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUnit(id);
      if (!success) {
        return res.status(404).json({ message: "Unit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting unit" });
    }
  });

  // Course-Units relationships
  app.get("/api/course-units", async (req, res) => {
    try {
      const courseUnits = await storage.getCourseUnits();
      res.json(courseUnits);
    } catch (error) {
      console.error("Error fetching course-units:", error);
      res.status(500).json({
        message: "Error fetching course-units",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Learning Blocks
  // Get all learning blocks (for admin filtering)
  app.get("/api/learning-blocks", async (req, res) => {
    try {
      // Get all units first
      const units = await storage.getAllUnits();
      let allBlocks: any[] = [];

      // Fetch blocks for each unit
      for (const unit of units) {
        const blocks = await storage.getLearningBlocks(unit.id);
        allBlocks = allBlocks.concat(blocks || []);
      }

      console.log(`Retrieved ${allBlocks.length} total learning blocks`);
      res.json(allBlocks);
    } catch (error) {
      console.error("Error fetching all learning blocks:", error);
      res.status(500).json({
        message: "Error fetching learning blocks",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/units/:unitId/blocks", async (req, res) => {
    try {
      const unitId = parseInt(req.params.unitId);
      if (isNaN(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID" });
      }

      console.log(`Fetching learning blocks for unit ID: ${unitId}`);
      const blocks = await storage.getLearningBlocks(unitId);
      console.log(
        `Retrieved ${
          blocks?.length || 0
        } learning blocks for unit ID: ${unitId}`,
      );
      res.json(blocks || []);
    } catch (error) {
      console.error("Error fetching learning blocks:", error);
      res.status(500).json({
        message: "Error fetching learning blocks",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post("/api/learning-blocks", async (req, res) => {
    try {
      const block = await storage.createLearningBlock(req.body);
      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ message: "Error creating learning block" });
    }
  });

  app.patch("/api/learning-blocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const block = await storage.updateLearningBlock(id, req.body);
      if (!block) {
        return res.status(404).json({ message: "Learning block not found" });
      }
      res.json(block);
    } catch (error) {
      res.status(500).json({ message: "Error updating learning block" });
    }
  });

  app.delete("/api/learning-blocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLearningBlock(id);
      if (!success) {
        return res.status(404).json({ message: "Learning block not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting learning block" });
    }
  });

  // User Progress
  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log(
        "Not authenticated for GET /api/progress - User session:",
        req.session,
      );
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      console.log("Fetching progress for user ID:", userId);

      const progress = await storage.getUserProgressForAllCourses(userId);
      console.log("Retrieved progress data:", progress);

      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    console.log("POST /api/progress received - Request body:", req.body);
    console.log("User authenticated:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);

    if (!req.isAuthenticated()) {
      console.log(
        "Not authenticated for POST /api/progress - User session:",
        req.session,
      );
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      console.log("Creating/updating progress for user ID:", userId);

      const { courseId, percentComplete, completed } = req.body;
      console.log("Request data:", { courseId, percentComplete, completed });

      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Check if this user already has progress for this course
      let progress = await storage.getUserProgress(userId, courseId);
      console.log("Existing progress:", progress);

      if (progress) {
        // If progress exists for this user, update it
        console.log("Updating existing progress for user:", userId);

        try {
          progress = await storage.updateUserProgress(userId, courseId, {
            percentComplete: percentComplete ?? progress.percentComplete,
            completed: completed ?? progress.completed,
            lastAccessed: new Date(),
          });
          console.log("Updated progress result:", progress);
        } catch (updateError) {
          console.error("Error updating progress:", updateError);
          // Fall back to creating a new record if update fails
          progress = undefined;
        }
      }

      // If no progress exists or update failed, create a new record
      if (!progress) {
        console.log("Creating new progress for user:", userId);
        progress = await storage.createUserProgress({
          userId,
          courseId,
          percentComplete: percentComplete || 0,
          completed: completed || false,
          lastAccessed: new Date(),
        });
        console.log("Created new progress:", progress);
      }

      // Force refresh the progress data to ensure it's properly saved
      const updatedProgressList =
        await storage.getUserProgressForAllCourses(userId);
      console.log("All user progress after update:", updatedProgressList);

      res.json(progress);
    } catch (error) {
      console.error("Progress update error:", error);
      res
        .status(500)
        .json({ message: "Error updating progress", error: String(error) });
    }
  });

  // Get user's block completions
  app.get("/api/block-completions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const completions = await storage.getUserBlockCompletions(userId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching block completions:", error);
      res.status(500).json({ message: "Error fetching block completions" });
    }
  });

  // Block Completions
  app.post("/api/blocks/:blockId/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const blockId = parseInt(req.params.blockId);

      // Check if already completed
      const existing = await storage.getBlockCompletion(userId, blockId);
      if (existing) {
        return res.json(existing);
      }

      // Get block to award XP
      const block = await storage.getLearningBlock(blockId);
      if (!block) {
        return res.status(404).json({ message: "Learning block not found" });
      }

      // Create completion record
      const completion = await storage.createBlockCompletion({
        userId,
        blockId,
        completed: true,
      });

      // Award XP points
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, {
          xpPoints: user.xpPoints + (block.xpPoints || 10),
        });
      }

      // Log block completion activity
      await storage.createUserActivityLog({
        userId,
        activity: 'block_completed',
        metadata: { 
          blockId, 
          blockTitle: block.title,
          xpAwarded: block.xpPoints || 10 
        }
      }).catch(error => {
        console.error('Failed to log block completion activity:', error);
      });

      // Update course progress after block completion
      try {
        // Get the unit this block belongs to
        const unit = await storage.getUnit(block.unitId);
        if (unit) {
          // Get all courses this unit belongs to
          const coursesForUnit = await storage.getCoursesForUnit(unit.id);
          
          for (const course of coursesForUnit) {
            console.log(`Updating course progress for user ${userId}, course ${course.id} after block ${blockId} completion`);
            // Calculate updated progress for this course
            await updateCourseProgress(userId, course.id);
            
            // Check if course is now complete and log it
            const updatedProgress = await storage.getUserProgress(userId, course.id);
            if (updatedProgress && updatedProgress.completed) {
              await storage.createUserActivityLog({
                userId,
                activity: 'course_completed',
                metadata: { 
                  courseId: course.id, 
                  courseName: course.name,
                  percentComplete: updatedProgress.percentComplete
                }
              }).catch(error => {
                console.error('Failed to log course completion activity:', error);
              });
            }
          }
        }
      } catch (error) {
        console.error("Error updating course progress after block completion:", error);
      }

      res.json(completion);
    } catch (error) {
      res.status(500).json({ message: "Error completing block" });
    }
  });

  // Assessments
  app.get("/api/units/:unitId/assessments", async (req, res) => {
    try {
      const unitId = parseInt(req.params.unitId);
      const assessments = await storage.getAssessments(unitId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching assessments" });
    }
  });

  // Get all assessments for admin management
  app.get("/api/assessments", async (req, res) => {
    try {
      // Use the new getAllAssessments method to fetch both unit and course level assessments
      const allAssessments = await storage.getAllAssessments();
      console.log("Fetched all assessments:", allAssessments.length);
      res.json(allAssessments);
    } catch (error) {
      console.error("Error fetching all assessments:", error);
      res.status(500).json({ message: "Error fetching assessments" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      console.log("Creating assessment with data:", req.body);
      const assessment = await storage.createAssessment(req.body);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Error creating assessment" });
    }
  });

  app.patch("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.updateAssessment(id, req.body);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Error updating assessment" });
    }
  });

  app.delete("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAssessment(id);
      if (!success) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting assessment" });
    }
  });

  app.get("/api/assessments/:assessmentId/questions", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const questions = await storage.getQuestions(assessmentId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching questions" });
    }
  });

  // Question Management APIs
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = req.body;
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ message: "Error creating question" });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Error fetching question" });
    }
  });

  app.patch("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      console.log("Updating question:", id);
      console.log("Request body:", req.body);

      // For true/false questions, ensure the correct answer is properly set
      if (req.body.questionType === "true_false") {
        console.log(
          "True/False question - incoming correctAnswer:",
          req.body.correctAnswer,
        );
      }

      const question = await storage.updateQuestion(id, req.body);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      console.log("Updated question result:", question);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res
        .status(500)
        .json({ message: "Error updating question", error: String(error) });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuestion(id);
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting question" });
    }
  });

  // Legacy assessment submission endpoint - removed to prevent conflicts

  // Badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching badges" });
    }
  });

  app.get("/api/user/badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });    }

    try {
      const userId = req.user!.id;
      const userBadges = await storage.getUserBadges(userId);

      // Get full badge details
      const badgeIds = userBadges.map((ub) => ub.badgeId);
      const badges = await Promise.all(
        badgeIds.map((id) => storage.getBadge(id)),
      );

      // Combine user badge (earned date) with badge details
      const result = userBadges.map((userBadge) => {
        const badge = badges.find((b) => b && b.id === userBadge.badgeId);
        return {
          ...userBadge,
          badge,
        };
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user badges" });
    }
  });

  // Admin Badge Management
  // Create a new badge
  app.post("/api/admin/badges", async (req, res) => {
    if (
      !req.isAuthenticated() ||
      (req.user!.role !== "admin" && req.user!.role !== "instructor")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const badgeData = req.body;
      const newBadge = await storage.createBadge(badgeData);
      res.status(201).json(newBadge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ message: "Error creating badge" });
    }
  });

  // Update an existing badge
  app.patch("/api/admin/badges/:id", async (req, res) => {
    if (
      !req.isAuthenticated() ||
      (req.user!.role !== "admin" && req.user!.role !== "instructor")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const badgeId = parseInt(req.params.id);
      const badge = await storage.getBadge(badgeId);

      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      // Update badge
      const updatedBadge = await storage.updateBadge(badgeId, req.body);
      res.json(updatedBadge);
    } catch (error) {
      console.error("Error updating badge:", error);
      res.status(500).json({ message: "Error updating badge" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);

      // Filter out admin and sub-admin users - only show regular users
      const filteredLeaderboard = leaderboard.filter(
        (user) => user.role === "user",
      );

      // Remove sensitive data
      const sanitizedLeaderboard = filteredLeaderboard.map((user) => {
        const { password, email, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
      });

      res.json(sanitizedLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });

  // User Profile Routes
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const { firstName, lastName, email, language } = req.body;

      // Validate required fields for basic profile update
      if (!firstName || !lastName) {
        return res
          .status(400)
          .json({ message: "First name and last name are required" });
      }

      // Prepare update data - only allow basic users to update limited fields
      const updateData: any = { firstName, lastName };
      if (language) {
        updateData.language = language;
      }
      // Only include email if provided (admin might update it)
      if (email) {
        updateData.email = email;
      }

      // Update user profile
      const updatedUser = await storage.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  app.patch("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Current password and new password are required" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const { comparePasswords } = await import("./auth.js");
      const isCurrentPasswordValid = await comparePasswords(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const { hashPassword } = await import("./auth.js");
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      const updatedUser = await storage.updateUser(userId, {
        password: hashedNewPassword,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Error changing password" });
    }
  });

  // AI Tutor
  app.post("/api/ai-tutor/message", handleTutorMessage);

  app.get("/api/ai-tutor/conversation", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const conversation = await storage.getAiTutorConversation(userId);
      res.json(conversation || { messages: [] });
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversation" });
    }
  });

  // Admin routes
  // Admin Dashboard Stats
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      // Get total users
      const allUsers = await storage.getLeaderboard(1000);
      const usersByRole = allUsers.reduce(
        (acc, user) => {
          const role = user.role || "user";
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Get courses
      const courses = await storage.getCourses();

      // Get courses by module
      const modules = await storage.getModules();
      const coursesByModule = courses.reduce(
        (acc, course) => {
          const module = modules.find((m) => m.id === course.moduleId);
          const moduleName = module ? module.name : `Module ${course.moduleId}`;
          acc[moduleName] = (acc[moduleName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Get progress
      // In a real app, we would calculate these properly
      const totalCompletions = 0;
      const completionRate = 0;

      // Format stats for response
      const stats = {
        users: {
          total: allUsers.length,
          byRole: Object.entries(usersByRole).map(([role, count]) => ({
            role,
            count,
          })),
        },
        courses: {
          total: courses.length,
          byModule: Object.entries(coursesByModule).map(
            ([moduleName, count]) => ({ moduleName, count }),
          ),
        },
        progress: {
          totalCompletions,
          completionRate,
          topCourses: courses
            .slice(0, 5)
            .map((course) => ({ courseName: course.name, completions: 0 })),
        },
        badges: {
          totalAwarded: 0,
        },
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin statistics" });
    }
  });

  // Course Management
  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const course = await storage.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: "Error creating course" });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const updatedCourse = await storage.updateCourse(courseId, req.body);

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Error updating course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const deleted = await storage.deleteCourse(courseId);

      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting course" });
    }
  });

  // Module Management
  app.post("/api/modules", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const module = await storage.createModule(req.body);
      res.status(201).json(module);
    } catch (error) {
      res.status(500).json({ message: "Error creating module" });
    }
  });

  app.patch("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const moduleId = parseInt(req.params.id);
      const existingModule = await storage.getModule(moduleId);

      if (!existingModule) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Update module
      const updatedModule = {
        ...existingModule,
        ...req.body,
      };

      // Save module
      const result = await storage.updateModule(moduleId, updatedModule);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating module" });
    }
  });

  app.delete("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const moduleId = parseInt(req.params.id);

      // Check if module exists
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Delete module
      // In a real app, we would check for related courses first
      const result = await storage.deleteModule(moduleId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting module" });
    }
  });

  // Training Area Management
  app.post("/api/training-areas", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const area = await storage.createTrainingArea(req.body);
      res.status(201).json(area);
    } catch (error) {
      res.status(500).json({ message: "Error creating training area" });
    }
  });

  app.patch("/api/training-areas/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const areaId = parseInt(req.params.id);
      const existingArea = await storage.getTrainingArea(areaId);

      if (!existingArea) {
        return res.status(404).json({ message: "Training area not found" });
      }

      // Update training area
      const updatedArea = {
        ...existingArea,
        ...req.body,
      };

      // Save training area
      const result = await storage.updateTrainingArea(areaId, updatedArea);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating training area" });
    }
  });

  app.delete("/api/training-areas/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const areaId = parseInt(req.params.id);

      // Check if area exists
      const area = await storage.getTrainingArea(areaId);
      if (!area) {
        return res.status(404).json({ message: "Training area not found" });
      }

      // Delete training area
      // In a real app, we would check for related modules first
      const result = await storage.deleteTrainingArea(areaId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting training area" });
    }
  });

  // User Management
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const role = req.query.role as string;
      let users;

      if (role) {
        users = await storage.getUsersByRole(role);
      } else {
        users = Array.from(await storage.getLeaderboard(1000));
      }

      // Remove sensitive data
      const sanitizedUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Get enhanced user data with XP, badges, and progress (admin and sub-admin)
  app.get(
    "/api/admin/users/enhanced",
    requireAdminOrSubAdmin,
    async (req, res) => {
      try {
        let users = Array.from(await storage.getLeaderboard(1000));

        // If sub-admin, filter to only show users they created
        if (req.user!.role === "sub-admin") {
          users = users.filter((user) => user.createdBy === req.user!.id);
        }

        const enhancedUsers = await Promise.all(
          users.map(async (user) => {
            // Get user badges count
            const userBadges = await storage.getUserBadges(user.id);
            const badgesCollected = userBadges.length;

            // Get mandatory courses for user's role
            const mandatoryCourses = await storage.getMandatoryCoursesForUser(
              user.id,
            );
            const totalMandatory = mandatoryCourses.length;

            // Get user progress on mandatory courses
            let completedMandatory = 0;
            if (totalMandatory > 0) {
              const progressPromises = mandatoryCourses.map((course) =>
                storage.getUserProgress(user.id, course.id),
              );
              const progressResults = await Promise.all(progressPromises);
              completedMandatory = progressResults.filter(
                (progress) => progress?.completed,
              ).length;
            }

            const mandatoryProgress =
              totalMandatory > 0
                ? Math.round((completedMandatory / totalMandatory) * 100)
                : 0;

            // Remove password for security
            const { password, ...userWithoutPassword } = user;

            return {
              ...userWithoutPassword,
              badgesCollected,
              mandatoryProgress,
            };
          }),
        );

        res.json(enhancedUsers);
      } catch (error) {
        console.error("Error fetching enhanced users:", error);
        res.status(500).json({ error: "Failed to fetch enhanced users" });
      }
    },
  );

  app.post("/api/admin/users", requireAdminOrSubAdmin, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        username,
        password,
        email,
        role = "user",
        language = "en",
        nationality,
        yearsOfExperience,
        assets,
        roleCategory,
        subCategory,
        seniority,
        organizationName,
        courseIds = [],
      } = req.body;

      if (!firstName || !lastName || !username || !password || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Role-based restrictions
      if (req.user!.role === "sub-admin") {
        // Sub-admins can only create users, not other sub-admins
        if (role !== "user") {
          return res
            .status(403)
            .json({
              message: "Sub-admins can only create users, not sub-admins",
            });
        }
      }

      // Only admins can create sub-admins
      if (role === "sub-admin" && req.user!.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can create sub-admins" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create the user
      const user = await storage.createUser({
        firstName,
        lastName,
        username,
        password: await hashPassword(password),
        email,
        role,
        language,
        nationality,
        yearsOfExperience,
        assets,
        roleCategory,
        subCategory,
        seniority,
        organizationName,
        createdBy: req.user?.id || null,
        isActive: true,
      });

      // If courses are specified, create user progress entries for each
      if (courseIds.length > 0) {
        for (const courseId of courseIds) {
          await storage.createUserProgress({
            userId: user.id,
            courseId: parseInt(courseId),
            completed: false,
            percentComplete: 0,
            lastAccessed: new Date(),
          });
        }
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Redirect old upload endpoint to new one for compatibility
  app.post("/api/admin/users/upload-excel", requireAdminOrSubAdmin, uploadExcel, (req: Request, res: Response) => {
    processExcelUpload(req, res, storage);
  });

  // Create multiple users in bulk (admin and sub-admin)
  app.post(
    "/api/admin/users/bulk",
    requireAdminOrSubAdmin,
    async (req, res) => {
      try {
        const {
          defaultLanguage,
          defaultAssets,
          defaultRoleCategory,
          defaultSeniority,
          defaultNationality,
          defaultYearsOfExperience,
          defaultSubCategory,
          defaultOrganizationName,
          users,
          courseIds = [],
        } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
          return res
            .status(400)
            .json({ message: "No users provided for bulk creation" });
        }

        const createdUsers = [];
        const failedUsers = [];

        // Create users in bulk
        for (const userData of users) {
          try {
            // Check if username is already taken
            const existingUser = await storage.getUserByUsername(
              userData.username,
            );
            if (existingUser) {
              failedUsers.push({
                ...userData,
                error: "Username already exists",
              });
              continue;
            }

            // Generate a random password if none provided
            const password =
              userData.password || Math.random().toString(36).slice(2, 10);
            const hashedPassword = await hashPassword(password);

            const newUser = await storage.createUser({
              firstName: userData.firstName,
              lastName: userData.lastName,
              username: userData.username,
              password: hashedPassword,
              email: userData.email,
              role: "user",
              language: defaultLanguage || "en",
              nationality: defaultNationality || null,
              yearsOfExperience: defaultYearsOfExperience || null,
              assets: defaultAssets || null,
              roleCategory: defaultRoleCategory || null,
              subCategory: defaultSubCategory || null,
              seniority: defaultSeniority || null,
              organizationName: defaultOrganizationName || null,
              createdBy: req.user?.id || null,
              isActive: true,
            });

            // If course IDs were provided, assign the courses to the user
            if (courseIds && courseIds.length > 0) {
              for (const courseId of courseIds) {
                await storage.createUserProgress({
                  userId: newUser.id,
                  courseId: parseInt(courseId),
                  completed: false,
                  percentComplete: 0,
                  lastAccessed: new Date(),
                });
              }
            }

            createdUsers.push({
              ...newUser,
              generatedPassword: !userData.password ? password : undefined, // Include the generated password in the response only if it was auto-generated
            });
          } catch (error) {
            console.error("Error creating user in bulk:", error);
            failedUsers.push({
              ...userData,
              error: "Failed to create user",
            });
          }
        }

        res.status(201).json({
          created: createdUsers.length,
          failed: failedUsers.length,
          users: createdUsers,
          failedUsers: failedUsers,
        });
      } catch (error) {
        console.error("Error in bulk user creation:", error);
        res.status(500).json({ message: "Failed to create users in bulk" });
      }
    },
  );

  // Excel template download route
  app.get("/api/admin/users/template", requireAdminOrSubAdmin, (req, res) => {
    try {
      const templatePath = path.join(
        process.cwd(),
        "client/public/assets/VX Academy Import Format.xlsx",
      );

      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ message: "Template file not found" });
      }

      res.download(templatePath, "VX_Academy_Import_Template.xlsx", (err) => {
        if (err) {
          console.error("Error downloading template:", err);
          res.status(500).json({ message: "Error downloading template" });
        }
      });
    } catch (error) {
      console.error("Error serving template:", error);
      res.status(500).json({ message: "Error serving template" });
    }
  });

  app.put("/api/admin/users/:id", requireAdminOrSubAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Don't allow password changes through this endpoint
      const { password, ...updateData } = req.body;

      const updatedUser = await storage.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Also support PATCH for user updates
  app.patch(
    "/api/admin/users/:id",
    requireAdminOrSubAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);

        // Don't allow password changes through this endpoint
        const { password, ...updateData } = req.body;

        const updatedUser = await storage.updateUser(userId, updateData);

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
      }
    },
  );

  // Delete user endpoint
  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);

      // Don't allow admins to delete themselves
      if (userId === req.user!.id) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      // Get the user to check if they exist
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Implement user deletion
      // We need to add this method to the database storage
      const deleted = await storage.deleteUser(userId);

      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete user" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Role Management
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Error fetching role" });
    }
  });

  // Enhanced role management endpoints
  app.get("/api/admin/roles", async (req, res) => {
    if (
      !req.isAuthenticated() ||
      (req.user!.role !== "admin" && req.user!.role !== "sub-admin")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roles = await storage.getRoles();

      // Add user count for each role
      const enhancedRoles = await Promise.all(
        roles.map(async (role) => {
          const users = await storage.getUsersByRole(role.name);
          return {
            ...role,
            userCount: users.length,
          };
        }),
      );

      res.json(enhancedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.post("/api/admin/roles", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const { name, assets, roleCategory, seniority, description } = req.body;

      if (!name || !assets || !roleCategory || !seniority) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if role name already exists
      const existingRole = await storage.getRoleByName(name);
      if (existingRole) {
        return res.status(400).json({ message: "Role name already exists" });
      }

      const newRole = await storage.createRole({
        name,
        assets,
        roleCategory,
        seniority,
        description: description || null,
        permissions: {},
      });

      res.status(201).json(newRole);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.patch("/api/admin/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roleId = parseInt(req.params.id);
      const { name, assets, roleCategory, seniority, description } = req.body;

      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      // Check if role exists
      const existingRole = await storage.getRole(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Check if new name conflicts with existing role (except current role)
      if (name && name !== existingRole.name) {
        const nameConflict = await storage.getRoleByName(name);
        if (nameConflict) {
          return res.status(400).json({ message: "Role name already exists" });
        }
      }

      const updatedRole = await storage.updateRole(roleId, {
        name,
        assets,
        roleCategory,
        seniority,
        description,
      });

      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/admin/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roleId = parseInt(req.params.id);

      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      // Check if role exists
      const existingRole = await storage.getRole(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Check if role has users assigned
      const usersWithRole = await storage.getUsersByRole(existingRole.name);
      if (usersWithRole.length > 0) {
        return res.status(400).json({
          message: `Cannot delete role. ${usersWithRole.length} users are assigned to this role.`,
        });
      }

      const success = await storage.deleteRole(roleId);
      if (!success) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Unit assignment endpoints for roles
  app.post("/api/admin/roles/:roleId/units", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roleId = parseInt(req.params.roleId);
      const { unitIds } = req.body;

      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      if (!Array.isArray(unitIds) || unitIds.length === 0) {
        return res
          .status(400)
          .json({ message: "Unit IDs must be a non-empty array" });
      }

      // Check if role exists
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Get courses linked to the selected units and add them as mandatory courses
      const assignments = [];
      for (const unitId of unitIds) {
        const coursesForUnit = await storage.getCoursesForUnit(unitId);
        for (const course of coursesForUnit) {
          try {
            const assignment = await storage.addMandatoryCourseToRole({
              roleId,
              courseId: course.id,
            });
            assignments.push(assignment);
          } catch (error) {
            // Skip if already exists
            console.log(
              `Course ${course.id} already assigned to role ${roleId}`,
            );
          }
        }
      }

      res.status(201).json({
        message: "Units assigned successfully",
        assignments: assignments.length,
      });
    } catch (error) {
      console.error("Error assigning units to role:", error);
      res.status(500).json({ message: "Error creating role" });
    }
  });

  app.patch("/api/admin/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      const roleData = req.body;

      // If name is being changed, check if it already exists
      if (roleData.name) {
        const existingRole = await storage.getRoleByName(roleData.name);
        if (existingRole && existingRole.id !== id) {
          return res.status(400).json({ message: "Role name already exists" });
        }
      }

      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // System role modification restriction removed
      // Allow modifying and deleting system roles

      const updatedRole = await storage.updateRole(id, roleData);
      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Error updating role" });
    }
  });

  app.delete("/api/admin/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);

      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // We now allow deleting any role including system roles

      const success = await storage.deleteRole(id);

      if (!success) {
        return res
          .status(400)
          .json({ message: "Cannot delete role that is in use" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Error deleting role" });
    }
  });

  // Role Mandatory Courses Management
  app.get("/api/admin/roles/:roleId/mandatory-courses", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roleId = parseInt(req.params.roleId);
      const coursesWithRelations =
        await storage.getRoleMandatoryCourses(roleId);

      // These courses already have all the required data including the relation ID
      // We're just sending them directly to the client
      res.json(coursesWithRelations);
    } catch (error) {
      console.error("Error fetching mandatory courses for role:", error);
      res.status(500).json({ message: "Error fetching mandatory courses" });
    }
  });

  app.post("/api/admin/roles/:roleId/mandatory-courses", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const roleId = parseInt(req.params.roleId);
      const courseId = parseInt(req.body.courseId);

      if (isNaN(roleId) || isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid roleId or courseId" });
      }

      const entry = await storage.addMandatoryCourseToRole({
        roleId,
        courseId,
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error adding mandatory course to role:", error);
      if (
        error instanceof Error &&
        error.message === "Role or course not found"
      ) {
        return res.status(404).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: "Failed to add mandatory course to role" });
    }
  });

  app.delete(
    "/api/admin/roles/:roleId/mandatory-courses/:courseId",
    async (req, res) => {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      try {
        const roleId = parseInt(req.params.roleId);
        const courseId = parseInt(req.params.courseId);

        if (isNaN(roleId) || isNaN(courseId)) {
          return res
            .status(400)
            .json({ message: "Invalid roleId or courseId" });
        }

        const success = await storage.removeMandatoryCourseFromRole(
          roleId,
          courseId,
        );

        if (!success) {
          return res
            .status(404)
            .json({ message: "Mandatory course relationship not found" });
        }

        res.status(204).send();
      } catch (error) {
        console.error("Error removing mandatory course from role:", error);
        res
          .status(500)
          .json({ message: "Failed to remove mandatory course from role" });
      }
    },
  );

  // Get mandatory courses for the current user
  app.get("/api/my-mandatory-courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const mandatoryCourses = await storage.getMandatoryCoursesForUser(userId);

      // Also get the user's progress data
      const userProgress = await storage.getUserProgressForAllCourses(userId);

      // Enhance course data with progress info
      const enhancedCourses = mandatoryCourses.map((course) => {
        const progress = userProgress.find((p) => p.courseId === course.id);
        return {
          ...course,
          isCompleted: progress?.completed || false,
          percentComplete: progress?.percentComplete || 0,
          lastAccessed: progress?.lastAccessed || null,
        };
      });

      res.json(enhancedCourses);
    } catch (error) {
      console.error("Error fetching mandatory courses for user:", error);
      res.status(500).json({ message: "Failed to fetch mandatory courses" });
    }
  });

  // Image Upload for Learning Blocks
  app.post("/api/images/upload", uploadImage, handleImageUpload);

  // Certificate Template Upload
  app.post(
    "/api/upload/certificate-template",
    uploadCertificateTemplate,
    handleCertificateTemplateUpload,
  );

  // Certificate Routes
  app.get("/api/certificates", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const certificates = await storage.getUserCertificates(userId);

      // Get full course details and user details for each certificate
      const certificatesWithDetails = await Promise.all(
        certificates.map(async (cert) => {
          const course = await storage.getCourse(cert.courseId);
          const user = await storage.getUser(cert.userId);
          console.log(
            `Certificate ${cert.id}: User ID ${cert.userId}, User data:`,
            user,
          );
          return {
            ...cert,
            course,
            user,
          };
        }),
      );

      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(certificatesWithDetails);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Error fetching certificates" });
    }
  });

  app.get("/api/certificates/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const certificateId = parseInt(req.params.id);
      const certificate = await storage.getCertificate(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      // Verify that the certificate belongs to the requesting user
      if (certificate.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get course details
      const course = await storage.getCourse(certificate.courseId);

      // Get user details
      const user = await storage.getUser(certificate.userId);

      res.json({
        ...certificate,
        course,
        user,
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Error fetching certificate" });
    }
  });

  // Generate a certificate for completed course
  app.post("/api/certificates/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const courseId = parseInt(req.body.courseId);

      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if course is completed
      const progress = await storage.getUserProgress(userId, courseId);
      if (!progress || !progress.completed) {
        return res.status(400).json({ message: "Course not completed yet" });
      }

      // Check if certificate already exists
      const existingCertificate = await storage.getCertificateByCourseAndUser(
        userId,
        courseId,
      );
      if (existingCertificate) {
        return res.json(existingCertificate);
      }

      // Generate a unique certificate number
      const certificateNumber = `CERT-${userId}-${courseId}-${Date.now()}`;

      // Create certificate
      const certificate = await storage.createCertificate({
        userId,
        courseId,
        certificateNumber,
        status: "active",
        // Set expiry date to 2 years from now if needed
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      });

      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ message: "Error generating certificate" });
    }
  });

  // Generate certificate PDF
  app.get("/api/certificates/:id/pdf", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const certificateId = parseInt(req.params.id);
      const certificate = await storage.getCertificate(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      // Verify that the certificate belongs to the requesting user
      if (certificate.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get course and user details
      const course = await storage.getCourse(certificate.courseId);
      const user = await storage.getUser(certificate.userId);

      if (!course || !user) {
        return res.status(404).json({ message: "Course or user not found" });
      }

      // Generate HTML for the certificate
      const certificateHtml = generateCertificateHTML({
        certificate,
        course,
        user
      });

      // For now, return the HTML - in production you'd convert to PDF
      res.setHeader('Content-Type', 'text/html');
      res.send(certificateHtml);
    } catch (error) {
      console.error("Error generating certificate PDF:", error);
      res.status(500).json({ message: "Error generating certificate PDF" });
    }
  });

  // SCORM Package Management
  app.get("/api/scorm-packages", getScormPackages);
  app.get("/api/scorm-packages/:id", getScormPackage);
  app.post("/api/scorm-packages/upload", uploadScormPackage, handleScormUpload);
  app.get("/api/scorm-packages/:packageId/files/:filePath(*)", serveScormFile);
  app.post(
    "/api/scorm-packages/:scormPackageId/tracking",
    saveScormTrackingData,
  );
  app.get("/api/scorm-packages/:scormPackageId/tracking", getScormTrackingData);

  // Media Files Management
  app.get("/api/media", getMediaFiles);
  app.post("/api/media/upload", uploadMedia, handleMediaUpload);
  app.delete("/api/media/:id", deleteMediaFile);
  app.post("/api/media/bulk-delete", bulkDeleteMediaFiles);
  app.get("/api/media/files/:filename", serveMediaFile);

  // Assessment Attempts and Submission APIs
  app.get("/api/assessments/:assessmentId/attempts/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const userId = parseInt(req.params.userId);

      // Ensure user can only access their own attempts (unless admin)
      if (req.user!.id !== userId && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const attempts = await storage.getAssessmentAttempts(userId, assessmentId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching assessment attempts:", error);
      res.status(500).json({ message: "Error fetching assessment attempts" });
    }
  });

  app.post("/api/assessments/:assessmentId/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const userId = req.user!.id;
      const { answers, score: clientScore, timeExpired, startedAt } = req.body;

      if (!answers) {
        return res.status(400).json({ message: "Answers are required" });
      }

      // Get assessment details
      const assessment = await storage.getAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Check if user has remaining attempts
      const previousAttempts = await storage.getAssessmentAttempts(userId, assessmentId);
      if (previousAttempts.length >= assessment.maxRetakes) {
        return res.status(400).json({ message: "No attempts remaining" });
      }

      // Get questions for scoring
      console.log("About to fetch questions for assessmentId:", assessmentId);
      const questions = await storage.getQuestions(assessmentId);
      console.log("Questions fetched for assessment:", questions?.length || 0);
      console.log("Questions data:", JSON.stringify(questions, null, 2));
      
      if (!questions || questions.length === 0) {
        console.log("No questions found for assessment ID:", assessmentId);
        return res.status(400).json({ message: "No questions found for assessment" });
      }

      // Calculate score on server side (always recalculate for security)
      let correctAnswers = 0;
      const totalQuestions = questions.length;

      console.log("Starting assessment scoring...");
      console.log("Total questions:", totalQuestions);
      console.log("User answers:", answers);

      questions.forEach(question => {
        const questionId = question.id.toString();
        const userAnswer = answers[questionId];
        const correctAnswer = question.correctAnswer;
        
        // Handle case-insensitive comparison for true/false questions
        let isCorrect = false;
        if (question.questionType === 'true_false') {
          isCorrect = userAnswer?.toLowerCase() === correctAnswer?.toLowerCase();
        } else {
          isCorrect = userAnswer === correctAnswer;
        }
        
        console.log(`Question ${questionId}:`, {
          questionText: question.questionText,
          userAnswer,
          correctAnswer,
          isCorrect,
          questionType: question.questionType,
          comparisonUsed: question.questionType === 'true_false' ? 'case-insensitive' : 'exact'
        });
        
        if (isCorrect) {
          correctAnswers++;
        }
      });

      console.log("Final scoring results:", {
        correctAnswers,
        totalQuestions,
        percentage: Math.round((correctAnswers / totalQuestions) * 100)
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = assessment.isGraded ? (assessment.passingScore ? score >= assessment.passingScore : score >= 70) : true;

      // Create assessment attempt record
      const attempt = await storage.createAssessmentAttempt({
        userId,
        assessmentId,
        score,
        passed,
        answers: answers,
        completedAt: new Date()
      });

      // Log assessment activity
      await storage.createUserActivityLog({
        userId,
        activity: passed ? 'assessment_passed' : 'assessment_failed',
        metadata: { 
          assessmentId, 
          score, 
          assessmentTitle: assessment.title,
          totalQuestions,
          correctAnswers
        }
      }).catch(error => {
        console.error('Failed to log assessment activity:', error);
      });

      let certificateGenerated = false;

      // Award XP points if passed
      if (passed) {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(userId, { 
            xpPoints: (user.xpPoints || 0) + assessment.xpPoints 
          });
        }

        // Update course progress
        try {
          let courseId = assessment.courseId;
          if (!courseId && assessment.unitId) {
            // Get course from unit if assessment is unit-level
            const courses = await storage.getCoursesForUnit(assessment.unitId);
            courseId = courses[0]?.id;
          }

          if (courseId) {
            await updateCourseProgress(userId, courseId);
          }
        } catch (error) {
          console.error("Error updating course progress after assessment:", error);
        }

        // Generate certificate if enabled and user passed
        if (assessment.hasCertificate) {
          try {
            // Get course information for certificate
            let courseId = assessment.courseId;
            if (!courseId && assessment.unitId) {
              // Get course from unit if assessment is unit-level
              const courses = await storage.getCoursesForUnit(assessment.unitId);
              courseId = courses[0]?.id;
            }

            if (courseId) {
              // Check if certificate already exists
              const existingCertificate = await storage.getCertificateByCourseAndUser(userId, courseId);

              if (!existingCertificate) {
                const course = await storage.getCourse(courseId);
                const user = await storage.getUser(userId);

                if (course && user) {
                  const certificate = await storage.createCertificate({
                    userId,
                    courseId,
                    certificateNumber: `CERT-${Date.now()}-${userId}`,
                    status: "active",
                    expiryDate: null
                  });

                  certificateGenerated = true;

                  // Create notification for certificate
                  await storage.createNotification({
                    userId,
                    type: "certificate-earned",
                    title: "Certificate Earned!",
                    message: `Congratulations! You've earned a certificate for completing "${course.name}".`,
                    read: false
                  });
                }
              }
            }
          } catch (certError) {
            console.error("Error generating certificate:", certError);
            // Don't fail the assessment submission if certificate generation fails
          }
        }

        // Create success notification
        await storage.createNotification({
          userId,
          type: "assessment-passed",
          title: "Assessment Passed!",
          message: `You successfully passed "${assessment.title}" with a score of ${score}%.`,
          read: false
        });
      } else {
        // Create notification for failed attempt
        const attemptsRemaining = assessment.maxRetakes - previousAttempts.length - 1;
        await storage.createNotification({
          userId,
          type: "assessment-failed",
          title: "Assessment Not Passed",
          message: `You scored ${score}% on "${assessment.title}". ${attemptsRemaining > 0 ? `You have ${attemptsRemaining} attempts remaining.` : 'No attempts remaining.'}`,
          read: false
        });
      }

      const responseData = {
        success: true,
        score,
        passed,
        correctAnswers,
        totalQuestions,
        certificateGenerated,
        attemptsRemaining: assessment.maxRetakes - previousAttempts.length - 1
      };

      console.log("Sending response:", responseData);
      res.json(responseData);

    } catch (error) {
      console.error("Error submitting assessment:", error);
      res.status(500).json({ message: "Error submitting assessment" });
    }
  });

  // Get assessments by placement for course flow
  app.get("/api/courses/:courseId/assessments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const courseId = parseInt(req.params.courseId);
      const placement = req.query.placement as string;

      console.log(`Fetching assessments for course ${courseId}, placement: ${placement}`);

      // Get all assessments and filter for course-level ones
      const allAssessments = await storage.getAllAssessments();
      const courseAssessments = allAssessments.filter(assessment => assessment.courseId === courseId);

      console.log(`Found ${courseAssessments.length} course-level assessments for course ${courseId}`);

      // Get unit-level assessments for this course
      const units = await storage.getUnits(courseId);
      let unitAssessments: any[] = [];

      for (const unit of units) {
        const assessments = await storage.getAssessments(unit.id);
        unitAssessments.push(...assessments);
      }

      console.log(`Found ${unitAssessments.length} unit-level assessments for course ${courseId}`);

      let finalAssessments = [...courseAssessments, ...unitAssessments];

      // Filter by placement if specified
      if (placement) {
        finalAssessments = finalAssessments.filter(assessment => assessment.placement === placement);
        console.log(`After filtering by placement '${placement}': ${finalAssessments.length} assessments`);
      }

      res.json(finalAssessments);
    } catch (error) {
      console.error("Error fetching course assessments:", error);
      res.status(500).json({ message: "Error fetching course assessments" });
    }
  });

  // Notification Management
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.get("/api/notifications/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Error fetching notification count" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(notificationId);

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res
        .status(500)
        .json({ message: "Error marking all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Verify the notification belongs to the user before deleting
      const notification = await storage.getNotification(notificationId);
      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const success = await storage.deleteNotification(notificationId);

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Error deleting notification" });
    }
  });

  // Excel upload endpoint for users
  app.post("/api/admin/users/bulk-upload", requireAdminOrSubAdmin, uploadExcel, (req: Request, res: Response) => {
    processExcelUpload(req, res, storage);
  });

  // Manual course progress refresh endpoint for debugging
  app.post("/api/refresh-course-progress/:courseId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const courseId = parseInt(req.params.courseId);

      console.log(`Manual progress refresh requested for user ${userId}, course ${courseId}`);
      await updateCourseProgress(userId, courseId);

      // Get updated progress
      const updatedProgress = await storage.getUserProgress(userId, courseId);
      res.json({ 
        success: true, 
        progress: updatedProgress,
        message: "Course progress refreshed successfully"
      });
    } catch (error) {
      console.error("Error refreshing course progress:", error);
      res.status(500).json({ message: "Error refreshing course progress" });
    }
  });

  // Excel template download endpoint
  app.get("/api/admin/users/template", requireAdminOrSubAdmin, (req: Request, res: Response) => {
    const templatePath = path.join(__dirname, "../attached_assets/VX_Academy_Import_Format.xlsx");
    if (fs.existsSync(templatePath)) {
      res.download(templatePath, "VX_Academy_Import_Template.xlsx");
    } else {
      res.status(404).json({ message: "Template file not found" });
    }
  });

  // Analytics Endpoints
  app.get("/api/admin/analytics", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const timeRange = req.query.timeRange as string || "month";
      
      // Calculate date range based on timeRange parameter
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "quarter":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get analytics data from existing tables using createdAt timestamps
      const [
        totalUsers,
        allUsers,
        allProgress,
        allCourses,
        allAssessmentAttempts,
        newUsers,
        courseCompletions,
        assessmentAttempts,
        enrollments
      ] = await Promise.all([
        storage.getAllUsersCount(),
        storage.getAllUsers(),
        storage.getAllUserProgress(),
        storage.getCourses(),
        storage.getAllAssessmentAttempts(),
        storage.getNewUsersCount(startDate, endDate),
        storage.getCourseCompletionsCount(startDate, endDate),
        storage.getAssessmentAttemptsCount(startDate, endDate),
        storage.getEnrollmentsByDateRange(startDate, endDate)
      ]);

      // Calculate active users from user activity logs (login activity)
      const activeUsers = await storage.getActiveUsersCount(startDate, endDate);

      // Calculate completion rate
      const completedProgress = allProgress.filter(p => p.completed);
      const avgCompletionRate = allProgress.length > 0 
        ? Math.round((completedProgress.length / allProgress.length) * 100) 
        : 0;

      // Role distribution
      const roleDistribution = allUsers.reduce((acc, user) => {
        const role = user.role || 'user';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Course completion data by course
      const courseCompletionData = allCourses.map(course => {
        const courseProgress = allProgress.filter(p => p.courseId === course.id);
        const completedCount = courseProgress.filter(p => p.completed).length;
        const totalEnrolled = courseProgress.length;
        const completionRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;
        
        return {
          name: course.name,
          completionRate,
          totalEnrolled,
          completedCount
        };
      }).sort((a, b) => b.completionRate - a.completionRate);

      // XP distribution
      const xpDistribution = allUsers.reduce((acc, user) => {
        const xp = user.xpPoints || 0;
        if (xp <= 500) acc['Beginner (0-500 XP)'] = (acc['Beginner (0-500 XP)'] || 0) + 1;
        else if (xp <= 1500) acc['Intermediate (501-1500 XP)'] = (acc['Intermediate (501-1500 XP)'] || 0) + 1;
        else if (xp <= 3000) acc['Advanced (1501-3000 XP)'] = (acc['Advanced (1501-3000 XP)'] || 0) + 1;
        else acc['Expert (3000+ XP)'] = (acc['Expert (3000+ XP)'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Assessment performance
      const assessmentPerformance = allAssessmentAttempts.reduce((acc, attempt) => {
        if (attempt.passed) {
          acc.passed += 1;
        }
        acc.total += 1;
        acc.totalScore += attempt.score;
        return acc;
      }, { passed: 0, total: 0, totalScore: 0 });

      const avgAssessmentScore = assessmentPerformance.total > 0 
        ? Math.round(assessmentPerformance.totalScore / assessmentPerformance.total) 
        : 0;

      const passRate = assessmentPerformance.total > 0 
        ? Math.round((assessmentPerformance.passed / assessmentPerformance.total) * 100) 
        : 0;

      res.json({
        summary: {
          totalUsers,
          activeUsers,
          newUsers,
          courseCompletions,
          avgCompletionRate,
          assessmentAttempts,
          avgAssessmentScore,
          passRate
        },
        roleDistribution: Object.entries(roleDistribution).map(([name, value]) => ({ name, value })),
        courseCompletion: courseCompletionData,
        xpDistribution: Object.entries(xpDistribution).map(([name, value]) => ({ name, value })),
        timeRange: {
          start: startDate,
          end: endDate,
          period: timeRange
        },
        enrollments: enrollments.length
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  // Time series analytics data
  app.get("/api/admin/analytics/timeseries", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const timeRange = req.query.timeRange as string || "month";
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate periods
      let periodCount: number;
      let periodLength: number; // in days
      
      switch (timeRange) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          periodCount = 7;
          periodLength = 1;
          break;
        case "month":
          startDate.setDate(endDate.getDate() - 30);
          periodCount = 30;
          periodLength = 1;
          break;
        case "quarter":
          startDate.setDate(endDate.getDate() - 90);
          periodCount = 12; // weekly periods
          periodLength = 7;
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          periodCount = 12; // monthly periods
          periodLength = 30;
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
          periodCount = 30;
          periodLength = 1;
      }

      const timeSeriesData = [];
      
      for (let i = periodCount - 1; i >= 0; i--) {
        const periodEnd = new Date();
        periodEnd.setDate(endDate.getDate() - (i * periodLength));
        periodEnd.setHours(23, 59, 59, 999);
        
        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodEnd.getDate() - (periodLength - 1));
        periodStart.setHours(0, 0, 0, 0);

        // Get data for this period using existing tables
        const [activeUsers, newUsers, enrollments, completions] = await Promise.all([
          storage.getActiveUsersCount(periodStart, periodEnd), // Users who had any activity
          storage.getNewUsersCount(periodStart, periodEnd), // New user registrations
          storage.getEnrollmentsByDateRange(periodStart, periodEnd), // Course enrollments
          storage.getCourseCompletionsCount(periodStart, periodEnd) // Completed courses
        ]);

        let dateLabel: string;
        if (timeRange === "week" || timeRange === "month") {
          dateLabel = periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (timeRange === "quarter") {
          dateLabel = periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          dateLabel = periodEnd.toLocaleDateString('en-US', { month: 'short' });
        }

        timeSeriesData.push({
          date: dateLabel,
          activeUsers,
          newUsers,
          enrollments: enrollments.length,
          completions
        });
      }

      res.json({ data: timeSeriesData, timeRange });
    } catch (error) {
      console.error("Time series analytics error:", error);
      res.status(500).json({ message: "Error fetching time series data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}