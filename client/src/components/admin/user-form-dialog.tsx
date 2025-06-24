import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { type User, type Course } from "@shared/schema";

// Create different schemas for create and edit modes
const baseUserSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  username: z.string().min(1, "Username is required"),
  role: z.enum(["user", "sub-admin"]),
  language: z.string().min(1, "Language is required"),
  nationality: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  assets: z.string().optional(),
  roleCategory: z.string().optional(),
  subCategory: z.string().optional(),
  seniority: z.string().optional(),
  organizationName: z.string().optional(),
  isActive: z.boolean().default(true),
  courseIds: z.array(z.number()).default([]),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

// Dynamic schema based on edit mode
const getUserFormSchema = (isEditing: boolean) => 
  isEditing ? editUserSchema : createUserSchema;

type UserFormData = z.infer<typeof baseUserSchema> & { password?: string };

// Dropdown options
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

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  courses: Course[];
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  courses,
  onSubmit,
  isLoading = false,
}: UserFormDialogProps) {
  const { user: currentUser } = useAuth();
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const isEditing = !!user;
  const isCurrentUserSubAdmin = currentUser?.role === "sub-admin";

  const form = useForm<UserFormData>({
    resolver: zodResolver(getUserFormSchema(isEditing)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      role: "user",
      language: "English",
      nationality: "",
      yearsOfExperience: "",
      assets: "",
      roleCategory: "",
      subCategory: "",
      seniority: "",
      organizationName: "",
      isActive: true,
      courseIds: [],
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      // Only allow setting sub-admin if current user is admin and editing a sub-admin
      const canSetSubAdmin =
        !isCurrentUserSubAdmin && user.role === "sub-admin";
      setIsSubAdmin(canSetSubAdmin);
      form.reset({
        id: user.id, // Include the user ID for updates
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        password: "", // Don't pre-fill password for security
        role: canSetSubAdmin ? "sub-admin" : "user",
        language: user.language || "English",
        nationality: user.nationality || "",
        yearsOfExperience: user.yearsOfExperience || "",
        assets: user.assets || "",
        roleCategory: user.roleCategory || "",
        subCategory: user.subCategory || "",
        seniority: user.seniority || "",
        organizationName: user.organizationName || "",
        isActive: user.isActive,
        courseIds: [],
      });
    } else {
      // For new users, sub-admins can only create regular users
      setIsSubAdmin(false);
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        role: "user",
        language: "English",
        nationality: "",
        yearsOfExperience: "",
        assets: "",
        roleCategory: "",
        subCategory: "",
        seniority: "",
        organizationName: "",
        isActive: true,
        courseIds: [],
      });
    }
  }, [user, form, isCurrentUserSubAdmin]);

  // Update role when toggle changes (only if current user is admin)
  useEffect(() => {
    if (!isCurrentUserSubAdmin) {
      form.setValue("role", isSubAdmin ? "sub-admin" : "user");
    } else {
      // Sub-admins can only create users
      form.setValue("role", "user");
    }
  }, [isSubAdmin, form, isCurrentUserSubAdmin]);

  const handleSubmit = (data: UserFormData) => {
    console.log("handleSubmit called with data:", data);
    console.log("isEditing:", isEditing, "user:", user);
    
    if (isEditing && user) {
      // For updates, include the user ID
      console.log("Submitting update for user:", user.id);
      const updateData = { ...data, id: user.id };
      console.log("Final update data:", updateData);
      onSubmit(updateData);
    } else {
      // For new users, just pass the data
      console.log("Submitting new user data:", data);
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("Form submit event triggered");
              console.log("Form errors:", form.formState.errors);
              console.log("Form is valid:", form.formState.isValid);
              return form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-6"
          >
            {/* Role Toggle - Only visible to admin users */}
            {!isCurrentUserSubAdmin && (
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Switch
                  id="role-toggle"
                  checked={isSubAdmin}
                  onCheckedChange={setIsSubAdmin}
                />
                <Label htmlFor="role-toggle" className="font-medium">
                  {isSubAdmin ? "Sub-Admin" : "User"}
                </Label>
                <span className="text-sm text-gray-600">
                  {isSubAdmin
                    ? "Can create and manage users"
                    : "Standard user access"}
                </span>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(!isEditing || form.watch("password")) && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password {!isEditing && "*"}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            isEditing
                              ? "Leave blank to keep current password"
                              : "Enter password"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NATIONALITIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
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
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS_OF_EXPERIENCE.map((exp) => (
                          <SelectItem key={exp.value} value={exp.value}>
                            {exp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assets</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSETS.map((asset) => (
                          <SelectItem key={asset.value} value={asset.value}>
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
                control={form.control}
                name="roleCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_CATEGORIES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
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
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sub category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seniority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seniority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seniority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SENIORITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    firstName: "",
                    lastName: "",
                    email: "",
                    username: "",
                    password: "",
                    role: "user",
                    language: "English",
                    nationality: "",
                    yearsOfExperience: "",
                    assets: "",
                    roleCategory: "",
                    subCategory: "",
                    seniority: "",
                    organizationName: "",
                    isActive: true,
                    courseIds: [],
                  });
                  form.clearErrors();
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={() => console.log("Submit button clicked")}
              >
                {isLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
