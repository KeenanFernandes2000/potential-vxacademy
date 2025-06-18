import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

// Define permissions interface
interface UserPermissions {
  canCreateUsers: boolean;
  canCreateSubAdmins: boolean;
  canViewAllUsers: boolean;
  canEditAllUsers: boolean;
  canDeleteAllUsers: boolean;
  canManageRoles: boolean;
  canManageCourses: boolean;
  canManageTrainingAreas: boolean;
  canManageModules: boolean;
  canManageUnits: boolean;
  canManageAssessments: boolean;
  canManageLearningBlocks: boolean;
  canManageBadges: boolean;
  canManageMedia: boolean;
  canManageScorm: boolean;
  canViewAnalytics: boolean;
  canViewDashboard: boolean;
}

export function usePermissions() {
  const { user } = useAuth();

  const { data: permissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ["/api/user/permissions"],
    enabled: !!user,
  });

  // Helper functions for common permission checks
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions?.[permission] || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  const isSubAdmin = (): boolean => {
    return user?.role === "sub-admin";
  };

  const isAdminOrSubAdmin = (): boolean => {
    return isAdmin() || isSubAdmin();
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdminOrSubAdmin();
  };

  // Check if user can manage specific user (for sub-admins)
  const canManageUser = (targetUser: any): boolean => {
    if (isAdmin()) return true;
    if (isSubAdmin()) {
      // Sub-admins can only manage users they created
      return targetUser.createdBy === user?.id;
    }
    return false;
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    isAdmin,
    isSubAdmin,
    isAdminOrSubAdmin,
    canAccessAdminPanel,
    canManageUser,
    // Specific permission helpers
    canCreateUsers: hasPermission('canCreateUsers'),
    canCreateSubAdmins: hasPermission('canCreateSubAdmins'),
    canManageRoles: hasPermission('canManageRoles'),
    canManageCourses: hasPermission('canManageCourses'),
    canManageTrainingAreas: hasPermission('canManageTrainingAreas'),
    canManageModules: hasPermission('canManageModules'),
    canManageUnits: hasPermission('canManageUnits'),
    canManageAssessments: hasPermission('canManageAssessments'),
    canManageLearningBlocks: hasPermission('canManageLearningBlocks'),
    canManageBadges: hasPermission('canManageBadges'),
    canManageMedia: hasPermission('canManageMedia'),
    canManageScorm: hasPermission('canManageScorm'),
    canViewAnalytics: hasPermission('canViewAnalytics'),
    canViewDashboard: hasPermission('canViewDashboard'),
  };
}