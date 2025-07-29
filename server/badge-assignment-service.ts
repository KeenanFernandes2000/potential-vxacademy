import { IStorage } from "./storage";
import { NotificationTriggers } from "./notification-triggers";
import { Badge, UserBadge, AssessmentAttempt, UserProgress, Course } from "@shared/schema";

export class BadgeAssignmentService {
  private storage: IStorage;
  private notificationTriggers: NotificationTriggers;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.notificationTriggers = new NotificationTriggers(storage);
  }

  /**
   * Check and award badges after assessment completion
   */
  async checkAssessmentBadges(userId: number, assessmentId: number, score: number, passed: boolean): Promise<void> {
    if (!passed) return;

    try {
      // Get all badges
      const allBadges = await this.storage.getBadges();
      const userBadges = await this.storage.getUserBadges(userId);

      // Check for "First Assessment" badge
      await this.checkFirstAssessmentBadge(userId, allBadges, userBadges);

      // Check for "Perfect Score" badge
      if (score === 100) {
        await this.checkPerfectScoreBadge(userId, allBadges, userBadges);
      }

    } catch (error) {
      console.error("Error checking assessment badges:", error);
    }
  }

  /**
   * Check and award badges after course completion
   */
  async checkCourseCompletionBadges(userId: number, courseId: number): Promise<void> {
    try {
      // Get all badges
      const allBadges = await this.storage.getBadges();
      const userBadges = await this.storage.getUserBadges(userId);

      // Check for "Course Completion" badge
      await this.checkCourseCompletionBadge(userId, courseId, allBadges, userBadges);

      // Check for "Abu Dhabi Expert" badge
      await this.checkAbuDhabiExpertBadge(userId, allBadges, userBadges);

    } catch (error) {
      console.error("Error checking course completion badges:", error);
    }
  }

  /**
   * Check for "First Assessment" badge
   */
  private async checkFirstAssessmentBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const firstAssessmentBadge = allBadges.find(b => b.type === "assessment");
    if (!firstAssessmentBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === firstAssessmentBadge.id);
    if (hasBadge) return;

    // Check if this is the user's first assessment
    const allAssessmentAttempts = await this.storage.getAllAssessmentAttempts();
    const userAttempts = allAssessmentAttempts.filter(attempt => attempt.userId === userId);
    const passedAttempts = userAttempts.filter(attempt => attempt.passed);
    
    if (passedAttempts.length === 1) {
      // This is the first passed assessment
      await this.awardBadge(userId, firstAssessmentBadge.id, firstAssessmentBadge.name);
    }
  }

  /**
   * Check for "Perfect Score" badge
   */
  private async checkPerfectScoreBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const perfectScoreBadge = allBadges.find(b => b.type === "assessment_perfect");
    if (!perfectScoreBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === perfectScoreBadge.id);
    if (hasBadge) return;

    // Check if user has any perfect scores
    const allAssessmentAttempts = await this.storage.getAllAssessmentAttempts();
    const userAttempts = allAssessmentAttempts.filter(attempt => attempt.userId === userId);
    const perfectScores = userAttempts.filter(attempt => attempt.score === 100 && attempt.passed);
    
    if (perfectScores.length > 0) {
      // Award the perfect score badge
      await this.awardBadge(userId, perfectScoreBadge.id, perfectScoreBadge.name);
    }
  }

  /**
   * Check for "Course Completion" badge
   */
  private async checkCourseCompletionBadge(
    userId: number, 
    courseId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const courseCompletionBadge = allBadges.find(b => b.type === "course_completion");
    if (!courseCompletionBadge) return;

    // Check if user already has this badge for this course
    const hasBadge = userBadges.some(ub => ub.badgeId === courseCompletionBadge.id);
    if (hasBadge) return;

    // Award the course completion badge
    await this.awardBadge(userId, courseCompletionBadge.id, courseCompletionBadge.name);
  }

  /**
   * Check for "Abu Dhabi Expert" badge
   */
  private async checkAbuDhabiExpertBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const abuDhabiExpertBadge = allBadges.find(b => b.type === "area_completion");
    if (!abuDhabiExpertBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === abuDhabiExpertBadge.id);
    if (hasBadge) return;

    // Get all courses in Abu Dhabi training area
    const trainingAreas = await this.storage.getTrainingAreas();
    const abuDhabiArea = trainingAreas.find(area => 
      area.name.toLowerCase().includes("abu dhabi") || 
      area.name.toLowerCase().includes("ad")
    );

    if (!abuDhabiArea) return;

    // Get all courses in Abu Dhabi area
    const allCourses = await this.storage.getCourses();
    const abuDhabiCourses = allCourses.filter(course => 
      course.trainingAreaId === abuDhabiArea.id
    );

    if (abuDhabiCourses.length === 0) return;

    // Check if user has completed all Abu Dhabi courses
    const userProgress = await this.storage.getUserProgressForAllCourses(userId);
    const completedAbuDhabiCourses = userProgress.filter(progress => {
      const course = abuDhabiCourses.find(c => c.id === progress.courseId);
      return course && progress.completed;
    });

    if (completedAbuDhabiCourses.length === abuDhabiCourses.length) {
      // User has completed all Abu Dhabi courses
      await this.awardBadge(userId, abuDhabiExpertBadge.id, abuDhabiExpertBadge.name);
    }
  }

  /**
   * Check for "Assessment Master" badge
   */
  private async checkAssessmentMasterBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const assessmentMasterBadge = allBadges.find(b => b.type === "assessment_master");
    if (!assessmentMasterBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === assessmentMasterBadge.id);
    if (hasBadge) return;

    // Check if user has passed 10 assessments with 90% or higher
    const allAssessmentAttempts = await this.storage.getAllAssessmentAttempts();
    const userAttempts = allAssessmentAttempts.filter(attempt => attempt.userId === userId);
    const highScoreAttempts = userAttempts.filter(attempt => attempt.score >= 90 && attempt.passed);
    
    if (highScoreAttempts.length >= 10) {
      await this.awardBadge(userId, assessmentMasterBadge.id, assessmentMasterBadge.name);
    }
  }

  /**
   * Check for "Course Explorer" badge
   */
  private async checkCourseExplorerBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const courseExplorerBadge = allBadges.find(b => b.type === "explorer");
    if (!courseExplorerBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === courseExplorerBadge.id);
    if (hasBadge) return;

    // Check if user has enrolled in 5 different courses
    const userProgress = await this.storage.getUserProgressForAllCourses(userId);
    const enrolledCourses = userProgress.filter(progress => progress.percentComplete > 0);
    
    if (enrolledCourses.length >= 5) {
      await this.awardBadge(userId, courseExplorerBadge.id, courseExplorerBadge.name);
    }
  }

  /**
   * Check for "Knowledge Seeker" badge
   */
  private async checkKnowledgeSeekerBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const knowledgeSeekerBadge = allBadges.find(b => b.type === "blocks");
    if (!knowledgeSeekerBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === knowledgeSeekerBadge.id);
    if (hasBadge) return;

    // Check if user has completed 50 learning blocks
    const userProgress = await this.storage.getUserProgressForAllCourses(userId);
    let totalCompletedBlocks = 0;

    for (const progress of userProgress) {
      const units = await this.storage.getUnits(progress.courseId);
      for (const unit of units) {
        const blockProgress = await this.storage.getUserBlockProgressForUnit(
          userId, 
          progress.courseId, 
          unit.id
        );
        const completedBlocks = blockProgress.filter(bp => bp.isCompleted);
        totalCompletedBlocks += completedBlocks.length;
      }
    }
    
    if (totalCompletedBlocks >= 50) {
      await this.awardBadge(userId, knowledgeSeekerBadge.id, knowledgeSeekerBadge.name);
    }
  }

  /**
   * Check for "Certificate Collector" badge
   */
  private async checkCertificateCollectorBadge(
    userId: number, 
    allBadges: Badge[], 
    userBadges: UserBadge[]
  ): Promise<void> {
    const certificateCollectorBadge = allBadges.find(b => b.type === "certificates");
    if (!certificateCollectorBadge) return;

    // Check if user already has this badge
    const hasBadge = userBadges.some(ub => ub.badgeId === certificateCollectorBadge.id);
    if (hasBadge) return;

    // Check if user has earned 5 certificates
    const userCertificates = await this.storage.getUserCertificates(userId);
    
    if (userCertificates.length >= 5) {
      await this.awardBadge(userId, certificateCollectorBadge.id, certificateCollectorBadge.name);
    }
  }

  /**
   * Award a badge to a user
   */
  private async awardBadge(userId: number, badgeId: number, badgeName: string): Promise<void> {
    try {
      // Check if user already has this badge
      const existingUserBadge = await this.storage.getUserBadges(userId);
      const alreadyHasBadge = existingUserBadge.some(ub => ub.badgeId === badgeId);
      
      if (alreadyHasBadge) return;

      // Create user badge record
      await this.storage.createUserBadge({
        userId,
        badgeId,
        earnedAt: new Date(),
      });

      // Get badge details for XP award
      const badge = await this.storage.getBadge(badgeId);
      if (badge) {
        // Award XP points
        const user = await this.storage.getUser(userId);
        if (user) {
          await this.storage.updateUser(userId, {
            xpPoints: (user.xpPoints || 0) + badge.xpPoints,
          });
        }
      }

      // Send notification
      await this.notificationTriggers.onBadgeEarned(userId, badgeId, badgeName);

      console.log(`Badge "${badgeName}" awarded to user ${userId}`);

    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  }

  /**
   * Check for all possible badges for a user (comprehensive check)
   */
  async checkAllBadges(userId: number): Promise<void> {
    try {
      const allBadges = await this.storage.getBadges();
      const userBadges = await this.storage.getUserBadges(userId);

      // Check assessment-related badges
      await this.checkFirstAssessmentBadge(userId, allBadges, userBadges);
      await this.checkPerfectScoreBadge(userId, allBadges, userBadges);
      await this.checkAssessmentMasterBadge(userId, allBadges, userBadges);

      // Check course completion badges
      const userProgress = await this.storage.getUserProgressForAllCourses(userId);
      const completedCourses = userProgress.filter(progress => progress.completed);
      
      for (const progress of completedCourses) {
        await this.checkCourseCompletionBadge(userId, progress.courseId, allBadges, userBadges);
      }

      // Check area completion badges
      await this.checkAbuDhabiExpertBadge(userId, allBadges, userBadges);

      // Check other badges
      await this.checkCourseExplorerBadge(userId, allBadges, userBadges);
      await this.checkKnowledgeSeekerBadge(userId, allBadges, userBadges);
      await this.checkCertificateCollectorBadge(userId, allBadges, userBadges);

    } catch (error) {
      console.error("Error checking all badges:", error);
    }
  }
} 