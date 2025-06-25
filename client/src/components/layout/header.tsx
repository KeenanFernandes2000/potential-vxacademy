import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import {
  GraduationCap,
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } =
    useQuery<Notification[]>({
      queryKey: ["/api/notifications"],
      enabled: !!user,
    });

  // Fetch notification count
  const { data: notificationCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    enabled: !!user,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: (_, notificationId) => {
      // Optimistically update the notifications list
      queryClient.setQueryData(["/api/notifications"], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        );
      });
      
      // Update the notification count
      queryClient.setQueryData(["/api/notifications/count"], (oldData: { count: number } | undefined) => {
        if (!oldData) return { count: 0 };
        return { count: Math.max(0, oldData.count - 1) };
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok)
        throw new Error("Failed to mark all notifications as read");
      return response.json();
    },
    onSuccess: () => {
      // Optimistically update all notifications to read
      queryClient.setQueryData(["/api/notifications"], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification => ({ ...notification, read: true }));
      });
      
      // Reset notification count to 0
      queryClient.setQueryData(["/api/notifications/count"], { count: 0 });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    // Navigation is now handled in the auth hook's onSuccess callback
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course_assigned":
      case "course_reminder":
        return "📚";
      case "badge_earned":
      case "achievement":
        return "🏆";
      case "leaderboard_update":
        return "📊";
      default:
        return "🔔";
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <header className="bg-white shadow-lg z-10 border-b border-slate-200/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button
            className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center ml-3">
            <GraduationCap className="h-6 w-6 text-teal-400 mr-2" />
            <span className="font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              VX Academy
            </span>
          </div>
        </div>

        <div className="flex ml-auto items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-all duration-200">
                <Bell className="h-5 w-5" />
                {notificationCount && notificationCount.count > 0 && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                    {notificationCount.count}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 max-h-96 overflow-y-auto"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Notifications
                </span>
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    Mark all read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notificationsLoading ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="cursor-pointer hover:bg-slate-50 p-3"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={`flex items-start gap-3 w-full ${!notification.read ? "bg-teal-50 rounded-lg p-2" : ""}`}
                    >
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTimeAgo(notification.createdAt!)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}

              {notifications.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-teal-600 font-medium cursor-pointer hover:bg-teal-50">
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-all duration-200">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold mr-2 shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/95 backdrop-blur-xl border border-slate-200/50"
            >
              <DropdownMenuLabel className="text-slate-800">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-slate-50"
                onClick={handleProfileClick}
              >
                <User className="h-4 w-4 mr-2 text-slate-600" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-slate-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2 text-slate-600" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
