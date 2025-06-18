import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { type Course } from "@shared/schema";

// Form schema for bulk upload
const bulkUploadSchema = z.object({
  file: z.any().optional(),
  defaultLanguage: z.string().min(1, "Default language is required"),
  defaultAssets: z.string().optional(),
  defaultRoleCategory: z.string().optional(),
  defaultSeniority: z.string().optional(),
  defaultOrganization: z.string().optional(),
  defaultRole: z.enum(["user", "sub-admin"]).default("user"),
  courseIds: z.array(z.number()).default([]),
});

type BulkUploadFormData = z.infer<typeof bulkUploadSchema>;

// Dropdown options (same as in UserFormDialog)
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

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSubmit: (data: BulkUploadFormData & { file: File }) => void;
  isLoading?: boolean;
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  courses,
  onSubmit,
  isLoading = false,
}: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<BulkUploadFormData>({
    resolver: zodResolver(bulkUploadSchema),
    defaultValues: {
      defaultLanguage: "English",
      defaultAssets: "",
      defaultRoleCategory: "",
      defaultSeniority: "",
      defaultOrganization: "",
      defaultRole: "user",
      courseIds: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const handleSubmit = (data: BulkUploadFormData) => {
    if (!selectedFile) {
      form.setError("file", { message: "Please select a file to upload" });
      return;
    }

    onSubmit({ ...data, file: selectedFile });
  };

  const downloadTemplate = () => {
    // Create CSV template content
    const csvContent = [
      "firstName,lastName,email,username,nationality,yearsOfExperience,subCategory",
      "John,Doe,john.doe@example.com,johndoe,United Arab Emirates,1-5 years,Manager",
      "Jane,Smith,jane.smith@example.com,janesmith,India,5-10 years,Staff",
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_users_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>
                Download the Excel template to format your user data correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                className="w-full"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload File
                  </CardTitle>
                  <CardDescription>
                    Select your CSV or Excel file containing user data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="mt-2"
                      />
                      {selectedFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Default Values Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Values</CardTitle>
                  <CardDescription>
                    These values will be applied to all users in the upload where not specified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Button type="submit" disabled={isLoading || !selectedFile}>
                  {isLoading ? "Uploading..." : "Upload Users"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}