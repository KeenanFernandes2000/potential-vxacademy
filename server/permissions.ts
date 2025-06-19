import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    // Full access to everything
    canCreateUsers: true,
    canCreateSubAdmins: true,
    canViewAllUsers: true,
    canEditAllUsers: true,
    canDeleteAllUsers: true,
    canManageRoles: true,
    canManageCourses: true,
    canManageTrainingAreas: true,
    canManageModules: true,
    canManageUnits: true,
    canManageAssessments: true,
    canManageLearningBlocks: true,
    canManageBadges: true,
    canManageMedia: true,
    canManageScorm: true,
    canViewAnalytics: true,
    canViewDashboard: true,
  },
  "sub-admin": {
    // Limited access - user management, roles, dashboard, analytics, and courses
    canCreateUsers: true,
    canCreateSubAdmins: false,
    canViewAllUsers: false, // Only users they created
    canEditAllUsers: false, // Only users they created
    canDeleteAllUsers: false, // Only users they created
    canManageRoles: true,
    canManageCourses: true,
    canManageTrainingAreas: false,
    canManageModules: false,
    canManageUnits: false,
    canManageAssessments: false,
    canManageLearningBlocks: false,
    canManageBadges: false,
    canManageMedia: false,
    canManageScorm: false,
    canViewAnalytics: true,
    canViewDashboard: true,
  },
  user: {
    // No admin access
    canCreateUsers: false,
    canCreateSubAdmins: false,
    canViewAllUsers: false,
    canEditAllUsers: false,
    canDeleteAllUsers: false,
    canManageRoles: false,
    canManageCourses: false,
    canManageTrainingAreas: false,
    canManageModules: false,
    canManageUnits: false,
    canManageAssessments: false,
    canManageLearningBlocks: false,
    canManageBadges: false,
    canManageMedia: false,
    canManageScorm: false,
    canViewAnalytics: false,
    canViewDashboard: false,
  },
};

// Check if user has specific permission
export function hasPermission(user: User | undefined, permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  if (!user) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) return false;
  
  return rolePermissions[permission];
}

// Middleware to check permissions
export function requirePermission(permission: keyof typeof ROLE_PERMISSIONS.admin) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions.",
        requiredPermission: permission 
      });
    }
    next();
  };
}

// Middleware to ensure user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: "Access denied. Admin role required." 
    });
  }
  next();
}

// Middleware to ensure user is admin or sub-admin
export function requireAdminOrSubAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'sub-admin')) {
    return res.status(403).json({ 
      message: "Access denied. Admin or Sub-Admin role required." 
    });
  }
  next();
}

// Check if user can manage specific user (for sub-admins)
export function canManageUser(currentUser: User, targetUserId: number): boolean {
  // Admins can manage anyone
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // Sub-admins can only manage users they created
  if (currentUser.role === 'sub-admin') {
    // Note: We'll need to check the createdBy field in the actual user record
    return true; // This will be validated in the route handler
  }
  
  return false;
}

// Get filtered permissions for frontend
export function getUserPermissions(user: User | undefined) {
  if (!user) return ROLE_PERMISSIONS.user;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions || ROLE_PERMISSIONS.user;
}