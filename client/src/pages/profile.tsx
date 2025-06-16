import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Badge, Certificate } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Form schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  language: z.string().min(1, "Please select a language"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch user badges
  const { data: userBadges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/user/badges"],
  });

  // Fetch user certificates
  const { data: userCertificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/user/certificates"],
  });

  // Profile update form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      language: user?.language || "en",
    },
  });

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to change password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  // Calculate achievement level
  const achievementLevel = user?.xpPoints
    ? user.xpPoints >= 3000 ? "Expert"
    : user.xpPoints >= 1500 ? "Advanced"
    : user.xpPoints >= 500 ? "Intermediate" : "Beginner"
    : "Beginner";

  const achievementIcon = user?.xpPoints
    ? user.xpPoints >= 3000 ? "workspace_premium"
    : user.xpPoints >= 1500 ? "emoji_events"
    : user.xpPoints >= 500 ? "military_tech" : "person"
    : "person";

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-primary" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-neutrals-100 p-4 pb-16 md:pb-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    <span className={`material-icons text-lg ${
                      user?.xpPoints && user.xpPoints >= 3000 ? "text-secondary" :
                      user?.xpPoints && user.xpPoints >= 1500 ? "text-neutrals-500" :
                      user?.xpPoints && user.xpPoints >= 500 ? "text-amber-700" : "text-neutrals-400"
                    }`}>
                      {achievementIcon}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-neutrals-800 mb-1">{user?.name}</h1>
                  <p className="text-neutrals-600 mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-primary">stars</span>
                      <span className="font-semibold text-primary">{user?.xpPoints?.toLocaleString() || 0} XP</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-accent">military_tech</span>
                      <span className="text-accent font-medium">{achievementLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-secondary">verified_user</span>
                      <span className="text-secondary font-medium capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">User Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Achievements Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2 text-primary">emoji_events</span>
                        Achievements
                      </CardTitle>
                      <CardDescription>Your earned badges and accomplishments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {badgesLoading ? (
                        <div className="space-y-3">
                          {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center space-x-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userBadges && userBadges.length > 0 ? (
                        <div className="space-y-3">
                          {userBadges.slice(0, 5).map((badge) => (
                            <div key={badge.id} className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                                <span className="material-icons text-primary text-lg">emoji_events</span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{badge.name}</p>
                                <p className="text-xs text-neutrals-600">{badge.description}</p>
                              </div>
                            </div>
                          ))}
                          {userBadges.length > 5 && (
                            <p className="text-sm text-neutrals-600 mt-2">
                              +{userBadges.length - 5} more badges
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <span className="material-icons text-4xl text-neutrals-400 mb-2">emoji_events</span>
                          <p className="text-neutrals-600">No badges earned yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certificates Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2 text-secondary">verified</span>
                        Certificates
                      </CardTitle>
                      <CardDescription>Your earned course certificates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {certificatesLoading ? (
                        <div className="space-y-3">
                          {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          ))}
                        </div>
                      ) : userCertificates && userCertificates.length > 0 ? (
                        <div className="space-y-3">
                          {userCertificates.slice(0, 5).map((certificate) => (
                            <div key={certificate.id} className="border-l-4 border-secondary pl-4">
                              <p className="font-medium text-sm">Certificate #{certificate.certificateNumber}</p>
                              <p className="text-xs text-neutrals-600">
                                Status: <span className="capitalize font-medium">{certificate.status}</span>
                              </p>
                            </div>
                          ))}
                          {userCertificates.length > 5 && (
                            <p className="text-sm text-neutrals-600 mt-2">
                              +{userCertificates.length - 5} more certificates
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <span className="material-icons text-4xl text-neutrals-400 mb-2">verified</span>
                          <p className="text-neutrals-600">No certificates earned yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2 text-accent">trending_up</span>
                      Learning Progress
                    </CardTitle>
                    <CardDescription>Your learning journey at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {user?.xpPoints?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">Total XP Earned</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">
                          {userBadges?.length || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">Badges Earned</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {userCertificates?.length || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">Certificates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Details Tab */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your preferred language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="min-w-[120px]"
                          >
                            {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password for enhanced security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your current password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your new password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters long
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={changePasswordMutation.isPending}
                            className="min-w-[120px]"
                          >
                            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Account Security Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Security information and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="material-icons text-green-600 mt-0.5">check_circle</span>
                        <div>
                          <p className="font-medium">Password Protected</p>
                          <p className="text-sm text-neutrals-600">Your account is secured with a password</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="material-icons text-green-600 mt-0.5">verified_user</span>
                        <div>
                          <p className="font-medium">Account Verified</p>
                          <p className="text-sm text-neutrals-600">Your account has been verified and is active</p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="material-icons text-amber-600 mt-0.5">security</span>
                          <div>
                            <p className="font-medium text-amber-800">Security Recommendations</p>
                            <ul className="text-sm text-amber-700 mt-2 space-y-1">
                              <li>• Use a strong, unique password</li>
                              <li>• Change your password regularly</li>
                              <li>• Don't share your account credentials</li>
                              <li>• Log out from shared devices</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}