import {
  users,
  type User,
  type InsertUser,
  courses,
  type Course,
  badges,
  type Badge,
  userProgress,
  type UserProgress,
  userUnitProgress,
  type UserUnitProgress,
  type InsertUserUnitProgress,
  userBlockProgress,
  type UserBlockProgress,
  type InsertUserBlockProgress,
  userAssessmentProgress,
  type UserAssessmentProgress,
  type InsertUserAssessmentProgress,
  blockCompletions,
  type BlockCompletion,
  userBadges,
  type UserBadge,
  aiTutorConversations,
  type AiTutorConversation,
  assessmentAttempts,
  type AssessmentAttempt,
  trainingAreas,
  type TrainingArea,
  modules,
  type Module,
  units,
  type Unit,
  courseUnits,
  type CourseUnit,
  type InsertCourseUnit,
  learningBlocks,
  type LearningBlock,
  assessments,
  type Assessment,
  questions,
  type Question,
  scormPackages,
  type ScormPackage,
  scormTrackingData,
  type ScormTrackingData,
  type InsertCourse,
  type InsertBadge,
  type InsertUserProgress,
  type InsertBlockCompletion,
  type InsertUserBadge,
  type InsertAiTutorConversation,
  type InsertAssessmentAttempt,
  type InsertTrainingArea,
  type InsertModule,
  type InsertUnit,
  type InsertLearningBlock,
  type InsertAssessment,
  type InsertQuestion,
  type InsertScormPackage,
  type InsertScormTrackingData,
  roles,
  type Role,
  type InsertRole,
  roleMandatoryCourses,
  type RoleMandatoryCourse,
  type InsertRoleMandatoryCourse,
  certificates,
  type Certificate,
  type InsertCertificate,
  notifications,
  type Notification,
  type InsertNotification,
  mediaFiles,
  type MediaFile,
  type InsertMediaFile,
  coursePrerequisites,
  type CoursePrerequisite,
  type InsertCoursePrerequisite,
  userActivityLogs,
  type UserActivityLog,
  type InsertUserActivityLog,
  courseEnrollments,
  type CourseEnrollment,
  type InsertCourseEnrollment,
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;

  // Role Management
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, roleData: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Role Mandatory Courses
  getRoleMandatoryCourses(roleId: number): Promise<Course[]>;
  addMandatoryCourseToRole(
    data: InsertRoleMandatoryCourse
  ): Promise<RoleMandatoryCourse>;
  removeMandatoryCourseFromRole(
    roleId: number,
    courseId: number
  ): Promise<boolean>;
  getMandatoryCoursesForUser(userId: number): Promise<Course[]>;

  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;

  // Course Management
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(
    id: number,
    courseData: Partial<Course>
  ): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Course Prerequisites
  getCoursePrerequisites(courseId: number): Promise<Course[]>;
  addCoursePrerequisite(
    data: InsertCoursePrerequisite
  ): Promise<CoursePrerequisite>;
  removeCoursePrerequisite(
    courseId: number,
    prerequisiteCourseId: number
  ): Promise<boolean>;
  getUserAccessibleCourses(userId: number): Promise<Course[]>;

  // Badge Management
  getBadge(id: number): Promise<Badge | undefined>;
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  updateBadge(id: number, data: Partial<Badge>): Promise<Badge | undefined>;

  // User Progress
  getUserProgress(
    userId: number,
    courseId: number
  ): Promise<UserProgress | undefined>;
  getUserProgressForAllCourses(userId: number): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(
    userId: number,
    courseId: number,
    data: Partial<UserProgress>
  ): Promise<UserProgress | undefined>;

  // User Unit Progress
  getUserUnitProgress(
    userId: number,
    courseId: number,
    unitId: number
  ): Promise<UserUnitProgress | undefined>;
  getUserUnitProgressForCourse(
    userId: number,
    courseId: number
  ): Promise<UserUnitProgress[]>;
  createUserUnitProgress(
    progress: InsertUserUnitProgress
  ): Promise<UserUnitProgress>;
  updateUserUnitProgress(
    userId: number,
    courseId: number,
    unitId: number,
    data: Partial<UserUnitProgress>
  ): Promise<UserUnitProgress | undefined>;
  markUnitAsComplete(
    userId: number,
    courseId: number,
    unitId: number
  ): Promise<UserUnitProgress>;

  // User Block Progress
  getUserBlockProgress(
    userId: number,
    courseId: number,
    unitId: number,
    blockId: number
  ): Promise<UserBlockProgress | undefined>;
  getUserBlockProgressForUnit(
    userId: number,
    courseId: number,
    unitId: number
  ): Promise<UserBlockProgress[]>;
  markBlockComplete(
    userId: number,
    courseId: number,
    unitId: number,
    blockId: number
  ): Promise<UserBlockProgress>;
  markBlockIncomplete(
    userId: number,
    courseId: number,
    unitId: number,
    blockId: number
  ): Promise<UserBlockProgress | undefined>;

  // User Assessment Progress
  getUserAssessmentProgress(
    userId: number,
    courseId: number,
    unitId: number,
    assessmentId: number
  ): Promise<UserAssessmentProgress | undefined>;
  getUserAssessmentProgressForUnit(
    userId: number,
    courseId: number,
    unitId: number
  ): Promise<UserAssessmentProgress[]>;
  markAssessmentComplete(
    userId: number,
    courseId: number,
    unitId: number,
    assessmentId: number
  ): Promise<UserAssessmentProgress>;
  markAssessmentIncomplete(
    userId: number,
    courseId: number,
    unitId: number,
    assessmentId: number
  ): Promise<UserAssessmentProgress | undefined>;

  // Block Completions
  getBlockCompletion(
    userId: number,
    blockId: number
  ): Promise<BlockCompletion | undefined>;
  createBlockCompletion(
    completion: InsertBlockCompletion
  ): Promise<BlockCompletion>;

  // User Badges
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;

  // AI Tutor Conversations
  getAiTutorConversation(
    userId: number
  ): Promise<AiTutorConversation | undefined>;
  createAiTutorConversation(
    conversation: InsertAiTutorConversation
  ): Promise<AiTutorConversation>;
  updateAiTutorConversation(
    id: number,
    messages: any[]
  ): Promise<AiTutorConversation | undefined>;

  // Assessment Attempts
  getAssessmentAttempts(
    userId: number,
    assessmentId: number,
    courseId?: number
  ): Promise<AssessmentAttempt[]>;
  createAssessmentAttempt(
    attempt: InsertAssessmentAttempt
  ): Promise<AssessmentAttempt>;

  // Training Areas
  getTrainingAreas(): Promise<TrainingArea[]>;
  getTrainingArea(id: number): Promise<TrainingArea | undefined>;
  createTrainingArea(area: InsertTrainingArea): Promise<TrainingArea>;
  updateTrainingArea(
    id: number,
    data: Partial<TrainingArea>
  ): Promise<TrainingArea | undefined>;
  deleteTrainingArea(id: number): Promise<boolean>;

  // Modules
  getModules(trainingAreaId?: number): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, data: Partial<Module>): Promise<Module | undefined>;
  deleteModule(id: number): Promise<boolean>;

  // Units
  getUnits(courseId?: number): Promise<Unit[]>;
  getAllUnits(): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, data: Partial<Unit>): Promise<Unit | undefined>;
  deleteUnit(id: number): Promise<boolean>;

  // Course-Unit associations
  addUnitToCourse(
    courseId: number,
    unitId: number,
    order: number
  ): Promise<CourseUnit>;
  removeUnitFromCourse(courseId: number, unitId: number): Promise<boolean>;
  getUnitsForCourse(courseId: number): Promise<Unit[]>;
  getCoursesForUnit(unitId: number): Promise<Course[]>;

  // Order validation
  checkUniqueUnitOrder(order: number, excludeId?: number): Promise<boolean>;
  checkUniqueLearningBlockOrder(
    unitId: number,
    order: number,
    excludeId?: number
  ): Promise<boolean>;

  // Learning Blocks
  getLearningBlocks(unitId: number): Promise<LearningBlock[]>;
  getLearningBlock(id: number): Promise<LearningBlock | undefined>;
  createLearningBlock(block: InsertLearningBlock): Promise<LearningBlock>;
  updateLearningBlock(
    id: number,
    data: Partial<LearningBlock>
  ): Promise<LearningBlock | undefined>;
  deleteLearningBlock(id: number): Promise<boolean>;

  // Assessments
  getAssessments(unitId: number): Promise<Assessment[]>;
  getAllAssessments(): Promise<Assessment[]>;
  getAssessmentsByCourse(courseId: number): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(
    id: number,
    data: Partial<Assessment>
  ): Promise<Assessment | undefined>;
  deleteAssessment(id: number): Promise<boolean>;

  // Questions
  getQuestions(assessmentId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(
    id: number,
    data: Partial<Question>
  ): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;

  // Certificates
  getUserCertificates(userId: number): Promise<Certificate[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByCourseAndUser(
    userId: number,
    courseId: number
  ): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(
    id: number,
    data: Partial<Certificate>
  ): Promise<Certificate | undefined>;

  // SCORM Packages
  getScormPackages(): Promise<ScormPackage[]>;
  getScormPackage(id: number): Promise<ScormPackage | undefined>;
  createScormPackage(packageData: InsertScormPackage): Promise<ScormPackage>;
  updateScormPackage(
    id: number,
    data: Partial<ScormPackage>
  ): Promise<ScormPackage | undefined>;
  deleteScormPackage(id: number): Promise<boolean>;

  // SCORM Tracking Data
  getScormTrackingData(
    userId: number,
    scormPackageId: number
  ): Promise<ScormTrackingData | undefined>;
  createScormTrackingData(
    trackingData: InsertScormTrackingData
  ): Promise<ScormTrackingData>;
  updateScormTrackingData(
    id: number,
    data: Partial<ScormTrackingData>
  ): Promise<ScormTrackingData | undefined>;

  // Notifications
  getUserNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  getNotification(notificationId: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;

  // Media Files
  getMediaFiles(): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  createMediaFile(file: InsertMediaFile): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<boolean>;
  deleteMultipleMediaFiles(ids: number[]): Promise<number>;

  // Analytics Methods
  createUserActivityLog(
    activity: InsertUserActivityLog
  ): Promise<UserActivityLog>;
  getUserActivityLogs(
    userId: number,
    limit?: number
  ): Promise<UserActivityLog[]>;
  getActivityLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<UserActivityLog[]>;

  createCourseEnrollment(
    enrollment: InsertCourseEnrollment
  ): Promise<CourseEnrollment>;
  getCourseEnrollment(
    userId: number,
    courseId: number
  ): Promise<CourseEnrollment | undefined>;
  getUserEnrollments(userId: number): Promise<CourseEnrollment[]>;
  getEnrollmentsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<CourseEnrollment[]>;

  getActiveUsersCount(startDate: Date, endDate: Date): Promise<number>;
  getNewUsersCount(startDate: Date, endDate: Date): Promise<number>;
  getCourseCompletionsCount(startDate: Date, endDate: Date): Promise<number>;
  getAssessmentAttemptsCount(startDate: Date, endDate: Date): Promise<number>;
  getAllUsersCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  getAllUserProgress(): Promise<UserProgress[]>;
  getAllAssessmentAttempts(): Promise<AssessmentAttempt[]>;

  // Note: No additional methods needed - using existing userActivityLogs for login tracking
}

// Import DatabaseStorage and create instance
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
