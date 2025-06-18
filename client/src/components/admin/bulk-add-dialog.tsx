import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { type Course } from "@shared/schema";

// Form schema for bulk add users
const bulkAddSchema = z.object({
  // Global settings that apply to all users
  defaultLanguage: z.string().min(1, "Default language is required"),
  defaultAssets: z.string().optional(),
  defaultRoleCategory: z.string().optional(),
  defaultSeniority: z.string().optional(),
  defaultOrganization: z.string().optional(),
  defaultRole: z.enum(["user", "sub-admin"]).default("user"),
  courseIds: z.array(z.number()).default([]),
  
  // Individual user data
  users: z.array(z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    nationality: z.string().optional(),
    yearsOfExperience: z.string().optional(),
    subCategory: z.string().optional(),
  })).min(1, "At least one user is required"),
});

type BulkAddFormData = z.infer<typeof bulkAddSchema>;

// Dropdown options (same as other components)
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
  { value: "Visitor information centers", label: "Visitor information centers" },
  { value: "Entertainment & Attractions", label: "Entertainment & Attractions" },
];

const ROLE_CATEGORIES = [
  { value: "Transport and parking staff", label: "Transport and parking staff" },
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
  { value: "Emergency & medical services", label: "Emergency & medical services" },
  { value: "Media and public relations", label: "Media and public relations" },
  { value: "Logistics", label: "Logistics" },
  { value: "Recreation and entertainment", label: "Recreation and entertainment" },
];

const SENIORITY_LEVELS = [
  { value: "Manager", label: "Manager" },
  { value: "Staff", label: "Staff" },
];

const YEARS_OF_EXPERIENCE = [
  { value: "Less than 1 year", label: "Less than 1 year" },
  { value: "1-5 years", label: "1-5 years" },
  { value: "5-10 years", label: "5-10 years" },
  { value: "10+ years", label: "10+ years" },
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

interface BulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSubmit: (data: BulkAddFormData) => void;
  isLoading?: boolean;
}

export function BulkAddDialog({
  open,
  onOpenChange,
  courses,
  onSubmit,
  isLoading = false,
}: BulkAddDialogProps) {
  const form = useForm<BulkAddFormData>({
    resolver: zodResolver(bulkAddSchema),
    defaultValues: {
      defaultLanguage: "English",
      defaultAssets: "",
      defaultRoleCategory: "",
      defaultSeniority: "",
      defaultOrganization: "",
      defaultRole: "user",
      courseIds: [],
      users: [
        { firstName: "", lastName: "", email: "", username: "", password: "", nationality: "", yearsOfExperience: "", subCategory: "" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const addUser = () => {
    append({ firstName: "", lastName: "", email: "", username: "", password: "", nationality: "", yearsOfExperience: "", subCategory: "" });
  };

  const removeUser = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleSubmit = (data: BulkAddFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Add Users
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  These settings will be applied to all users being added
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Language *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="defaultRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultAssets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Assets</FormLabel>
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
                    name="defaultRoleCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Role Category</FormLabel>
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
                    name="defaultSeniority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Seniority</FormLabel>
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
                    name="defaultOrganization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                      Add individual user information for each user to be created
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addUser}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">First Name *</TableHead>
                        <TableHead className="min-w-[120px]">Last Name *</TableHead>
                        <TableHead className="min-w-[200px]">Email *</TableHead>
                        <TableHead className="min-w-[120px]">Username *</TableHead>
                        <TableHead className="min-w-[120px]">Password *</TableHead>
                        <TableHead className="min-w-[150px]">Nationality</TableHead>
                        <TableHead className="min-w-[150px]">Experience</TableHead>
                        <TableHead className="min-w-[150px]">Sub Category</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.firstName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="First name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.lastName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.email`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="email" placeholder="Email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.username`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.password`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="password" placeholder="Password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.nationality`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Nationality" />
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
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.yearsOfExperience`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Experience" />
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
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`users.${index}.subCategory`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Sub category" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUser(index)}
                              disabled={fields.length === 1}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Users..." : `Create ${fields.length} User${fields.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}