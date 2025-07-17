import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge, Certificate } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// Dropdown options from user-form-dialog.tsx
const LANGUAGES = [
  { value: "Arabic", label: "Arabic" },
  { value: "English", label: "English" },
  { value: "Urdu", label: "Urdu" },
  { value: "Hindi", label: "Hindi" },
  { value: "Tagalog", label: "Tagalog" },
  { value: "Bengali", label: "Bengali" },
  { value: "Malayalam", label: "Malayalam" },
  { value: "Tamil", label: "Tamil" },
  { value: "Farsi", label: "Farsi" },
];

const YEARS_OF_EXPERIENCE = [
  { value: "Less than 1 year", label: "Less than 1 year" },
  { value: "1-5 years", label: "1-5 years" },
  { value: "5-10 years", label: "5-10 years" },
  { value: "10+ years", label: "10+ years" },
];

const ASSETS = [
  { value: "Museum", label: "Museum" },
  { value: "Culture site", label: "Culture site" },
  { value: "Events", label: "Events" },
  { value: "Mobility operators", label: "Mobility operators" },
  { value: "Airports", label: "Airports" },
  { value: "Cruise terminals", label: "Cruise terminals" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Malls", label: "Malls" },
  { value: "Tour Guides & operators", label: "Tour Guides & operators" },
  {
    value: "Visitor information centers",
    label: "Visitor information centers",
  },
  {
    value: "Entertainment & Attractions",
    label: "Entertainment & Attractions",
  },
];

const ROLE_CATEGORIES = [
  {
    value: "Transport and parking staff",
    label: "Transport and parking staff",
  },
  { value: "Welcome staff", label: "Welcome staff" },
  { value: "Ticketing staff", label: "Ticketing staff" },
  { value: "Information desk staff", label: "Information desk staff" },
  { value: "Guides", label: "Guides" },
  { value: "Events staff", label: "Events staff" },
  { value: "Security personnel", label: "Security personnel" },
  { value: "Retail staff", label: "Retail staff" },
  { value: "F&B staff", label: "F&B staff" },
  { value: "Housekeeping & janitorial", label: "Housekeeping & janitorial" },
  { value: "Customer service", label: "Customer service" },
  {
    value: "Emergency & medical services",
    label: "Emergency & medical services",
  },
  { value: "Media and public relations", label: "Media and public relations" },
  { value: "Logistics", label: "Logistics" },
  {
    value: "Recreation and entertainment",
    label: "Recreation and entertainment",
  },
];

const SENIORITY_LEVELS = [
  { value: "Manager", label: "Manager" },
  { value: "Staff", label: "Staff" },
];

const NATIONALITIES = [
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "India", label: "India" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Philippines", label: "Philippines" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Egypt", label: "Egypt" },
  { value: "Jordan", label: "Jordan" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Syria", label: "Syria" },
  // Add more as needed
];

// Form schemas - limited editing for basic users
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  language: z.string().min(1, "Please select a language"),
  nationality: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  organizationName: z.string().optional(),
  roleCategory: z.string().optional(),
  subCategory: z.string().optional(),
  seniority: z.string().optional(),
  assets: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
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
  const { data: userCertificates, isLoading: certificatesLoading } = useQuery<
    Certificate[]
  >({
    queryKey: ["/api/user/certificates"],
  });

  // Profile update form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      language: "English",
      nationality: "",
      yearsOfExperience: "",
      organizationName: "",
      roleCategory: "",
      subCategory: "",
      seniority: "",
      assets: "",
    },
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      console.log("Updating form with user data:", user); // Debug log
      const formData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        language: user.language || "English",
        nationality: user.nationality || "",
        yearsOfExperience: user.yearsOfExperience || "",
        organizationName: user.organizationName || "",
        roleCategory: user.roleCategory || "",
        subCategory: user.subCategory || "",
        seniority: user.seniority || "",
        assets: user.assets || "",
      };
      console.log("Form data to reset:", formData); // Debug log
      profileForm.reset(formData);

      // Log form values after reset
      setTimeout(() => {
        console.log("Form values after reset:", profileForm.getValues());
      }, 100);
    }
  }, [user, profileForm]);

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
    onSuccess: (updatedUser) => {
      // Update the user data in the auth context
      queryClient.setQueryData(["/api/user"], updatedUser);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Invalidate user queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update profile. Please try again.",
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
        description:
          error.message || "Failed to change password. Please try again.",
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
    ? user.xpPoints >= 3000
      ? "Expert"
      : user.xpPoints >= 1500
      ? "Advanced"
      : user.xpPoints >= 500
      ? "Intermediate"
      : "Beginner"
    : "Beginner";

  const achievementIcon = user?.xpPoints
    ? user.xpPoints >= 3000
      ? "workspace_premium"
      : user.xpPoints >= 1500
      ? "emoji_events"
      : user.xpPoints >= 500
      ? "military_tech"
      : "person"
    : "person";

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-64 bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
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
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {user?.firstName?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "U"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    <span
                      className={`material-icons text-lg ${
                        user?.xpPoints && user.xpPoints >= 3000
                          ? "text-secondary"
                          : user?.xpPoints && user.xpPoints >= 1500
                          ? "text-neutrals-500"
                          : user?.xpPoints && user.xpPoints >= 500
                          ? "text-amber-700"
                          : "text-neutrals-400"
                      }`}
                    >
                      {achievementIcon}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-neutrals-800 mb-1">
                    {user ? `${user.firstName} ${user.lastName}` : ""}
                  </h1>
                  <p className="text-neutrals-600 mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-primary">stars</span>
                      <span className="font-semibold text-primary">
                        {user?.xpPoints?.toLocaleString() || 0} XP
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-accent">
                        military_tech
                      </span>
                      <span className="text-accent font-medium">
                        {achievementLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-secondary">
                        verified_user
                      </span>
                      <span className="text-secondary font-medium capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
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
                        <span className="material-icons mr-2 text-primary">
                          emoji_events
                        </span>
                        Achievements
                      </CardTitle>
                      <CardDescription>
                        Your earned badges and accomplishments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {badgesLoading ? (
                        <div className="space-y-3">
                          {Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-3"
                              >
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
                            <div
                              key={badge.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                                <span className="material-icons text-primary text-lg">
                                  emoji_events
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {badge.name}
                                </p>
                                <p className="text-xs text-neutrals-600">
                                  {badge.description}
                                </p>
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
                          <span className="material-icons text-4xl text-neutrals-400 mb-2">
                            emoji_events
                          </span>
                          <p className="text-neutrals-600">
                            No badges earned yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certificates Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2 text-secondary">
                          verified
                        </span>
                        Certificates
                      </CardTitle>
                      <CardDescription>
                        Your earned course certificates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {certificatesLoading ? (
                        <div className="space-y-3">
                          {Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            ))}
                        </div>
                      ) : userCertificates && userCertificates.length > 0 ? (
                        <div className="space-y-3">
                          {userCertificates.slice(0, 5).map((certificate) => (
                            <div
                              key={certificate.id}
                              className="border-l-4 border-secondary pl-4"
                            >
                              <p className="font-medium text-sm">
                                Certificate #{certificate.certificateNumber}
                              </p>
                              <p className="text-xs text-neutrals-600">
                                Status:{" "}
                                <span className="capitalize font-medium">
                                  {certificate.status}
                                </span>
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
                          <span className="material-icons text-4xl text-neutrals-400 mb-2">
                            verified
                          </span>
                          <p className="text-neutrals-600">
                            No certificates earned yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2 text-accent">
                        trending_up
                      </span>
                      Learning Progress
                    </CardTitle>
                    <CardDescription>
                      Your learning journey at a glance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {user?.xpPoints?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">
                          Total XP Earned
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">
                          {userBadges?.length || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">
                          Badges Earned
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {userCertificates?.length || 0}
                        </div>
                        <p className="text-sm text-neutrals-600">
                          Certificates
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Details Tab */}
              <TabsContent value="details">
                <div className="space-y-6">
                  {/* Editable Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Editable Information</CardTitle>
                      <CardDescription>
                        Information you can update
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form
                          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your first name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your last name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Language</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your preferred language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                      <SelectItem
                                        key={lang.value}
                                        value={lang.value}
                                      >
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="nationality"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nationality</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select nationality" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {NATIONALITIES.map((country) => (
                                        <SelectItem
                                          key={country.value}
                                          value={country.value}
                                        >
                                          {country.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="yearsOfExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Years of Experience</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select experience" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {YEARS_OF_EXPERIENCE.map((exp) => (
                                        <SelectItem
                                          key={exp.value}
                                          value={exp.value}
                                        >
                                          {exp.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="organizationName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organization</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your organization name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="roleCategory"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role Category</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ROLE_CATEGORIES.map((role) => (
                                        <SelectItem
                                          key={role.value}
                                          value={role.value}
                                        >
                                          {role.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="seniority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Seniority Level</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select seniority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {SENIORITY_LEVELS.map((level) => (
                                        <SelectItem
                                          key={level.value}
                                          value={level.value}
                                        >
                                          {level.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="assets"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assets</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select assets" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ASSETS.map((asset) => (
                                        <SelectItem
                                          key={asset.value}
                                          value={asset.value}
                                        >
                                          {asset.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="subCategory"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sub Category</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter sub category"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                              className="min-w-[120px]"
                            >
                              {updateProfileMutation.isPending
                                ? "Updating..."
                                : "Update Profile"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Profile Information (Read-Only) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Your account and profile details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Email Address
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.email || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Username
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.username || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Platform Role
                            </Label>
                            <p className="text-sm font-medium capitalize">
                              {user?.role || "User"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Account Status
                            </Label>
                            <p className="text-sm font-medium text-green-600">
                              Active
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              XP Points
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.xpPoints?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Badges Collected
                            </Label>
                            <p className="text-sm font-medium">
                              {userBadges?.length || 0}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Certificates Earned
                            </Label>
                            <p className="text-sm font-medium">
                              {userCertificates?.length || 0}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Account Created
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Work Information (Read-Only) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Work Information</CardTitle>
                      <CardDescription>
                        Your professional details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Organization
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.organizationName || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Role Category
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.roleCategory || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Sub Category
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.subCategory || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Seniority Level
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.seniority || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Assets
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.assets || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Years of Experience
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.yearsOfExperience || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Nationality
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.nationality || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Account Status
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.isActive ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>Other profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              User ID
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.id || "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Avatar
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.avatar ? "Custom" : "Default"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Sub Category
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.subCategory || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Join Date
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Last Updated
                            </Label>
                            <p className="text-sm font-medium">
                              {user?.updatedAt
                                ? new Date(user.updatedAt).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Time Zone
                            </Label>
                            <p className="text-sm font-medium">
                              UAE Standard Time (GMT+4)
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password for enhanced security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form
                        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your current password"
                                  {...field}
                                />
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
                                <Input
                                  type="password"
                                  placeholder="Enter your new password"
                                  {...field}
                                />
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
                                <Input
                                  type="password"
                                  placeholder="Confirm your new password"
                                  {...field}
                                />
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
                            {changePasswordMutation.isPending
                              ? "Changing..."
                              : "Change Password"}
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
                    <CardDescription>
                      Security information and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="material-icons text-green-600 mt-0.5">
                          check_circle
                        </span>
                        <div>
                          <p className="font-medium">Password Protected</p>
                          <p className="text-sm text-neutrals-600">
                            Your account is secured with a password
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="material-icons text-green-600 mt-0.5">
                          verified_user
                        </span>
                        <div>
                          <p className="font-medium">Account Verified</p>
                          <p className="text-sm text-neutrals-600">
                            Your account has been verified and is active
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="material-icons text-amber-600 mt-0.5">
                            security
                          </span>
                          <div>
                            <p className="font-medium text-amber-800">
                              Security Recommendations
                            </p>
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
