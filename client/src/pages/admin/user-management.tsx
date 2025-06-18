import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, Upload, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { insertUserSchema, type User, type Course } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Dropdown options as constants
const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "hi", label: "Hindi" },
  { value: "tl", label: "Tagalog" },
  { value: "bn", label: "Bengali" },
  { value: "ml", label: "Malayalam" },
  { value: "ta", label: "Tamil" },
  { value: "fa", label: "Farsi" },
];

const YEARS_OF_EXPERIENCE = [
  { value: "less-than-1", label: "Less than 1 year" },
  { value: "1-5", label: "1-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10-plus", label: "10+ years" },
];

const ASSETS = [
  { value: "museum", label: "Museum" },
  { value: "culture-site", label: "Culture site" },
  { value: "events", label: "Events" },
  { value: "mobility-operators", label: "Mobility operators" },
  { value: "airports", label: "Airports" },
  { value: "cruise-terminals", label: "Cruise terminals" },
  { value: "hospitality", label: "Hospitality" },
  { value: "malls", label: "Malls" },
  { value: "tour-guides-operators", label: "Tour Guides & operators" },
  { value: "visitor-information-centers", label: "Visitor information centers" },
  { value: "entertainment-attractions", label: "Entertainment & Attractions" },
];

const ROLE_CATEGORIES = [
  { value: "transport-parking-staff", label: "Transport and parking staff" },
  { value: "welcome-staff", label: "Welcome staff" },
  { value: "ticketing-staff", label: "Ticketing staff" },
  { value: "information-desk-staff", label: "Information desk staff" },
  { value: "guides", label: "Guides" },
  { value: "events-staff", label: "Events staff" },
  { value: "security-personnel", label: "Security personnel" },
  { value: "retail-staff", label: "Retail staff" },
  { value: "fb-staff", label: "F&B staff" },
  { value: "housekeeping-janitorial", label: "Housekeeping & janitorial" },
  { value: "customer-service", label: "Customer service" },
  { value: "emergency-medical-services", label: "Emergency & medical services" },
  { value: "media-public-relations", label: "Media and public relations" },
  { value: "logistics", label: "Logistics" },
  { value: "recreation-entertainment", label: "Recreation and entertainment" },
];

const SENIORITY_LEVELS = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

const NATIONALITIES = [
  { value: "ae", label: "United Arab Emirates" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "pk", label: "Pakistan" },
  { value: "bd", label: "Bangladesh" },
  { value: "ph", label: "Philippines" },
  { value: "eg", label: "Egypt" },
  { value: "jo", label: "Jordan" },
  { value: "lb", label: "Lebanon" },
  { value: "sy", label: "Syria" },
  { value: "iq", label: "Iraq" },
  { value: "ir", label: "Iran" },
  { value: "af", label: "Afghanistan" },
  { value: "ly", label: "Libya" },
  { value: "tn", label: "Tunisia" },
  { value: "ma", label: "Morocco" },
  { value: "dz", label: "Algeria" },
  { value: "sd", label: "Sudan" },
  { value: "et", label: "Ethiopia" },
  { value: "so", label: "Somalia" },
  { value: "ke", label: "Kenya" },
  { value: "ug", label: "Uganda" },
  { value: "tz", label: "Tanzania" },
  { value: "za", label: "South Africa" },
  { value: "ng", label: "Nigeria" },
  { value: "gh", label: "Ghana" },
  { value: "ml", label: "Mali" },
  { value: "sn", label: "Senegal" },
  { value: "ci", label: "Côte d'Ivoire" },
  { value: "bf", label: "Burkina Faso" },
  { value: "ne", label: "Niger" },
  { value: "td", label: "Chad" },
  { value: "cm", label: "Cameroon" },
  { value: "cf", label: "Central African Republic" },
  { value: "cd", label: "Democratic Republic of Congo" },
  { value: "cg", label: "Republic of Congo" },
  { value: "ga", label: "Gabon" },
  { value: "gq", label: "Equatorial Guinea" },
  { value: "ao", label: "Angola" },
  { value: "zm", label: "Zambia" },
  { value: "zw", label: "Zimbabwe" },
  { value: "bw", label: "Botswana" },
  { value: "na", label: "Namibia" },
  { value: "ls", label: "Lesotho" },
  { value: "sz", label: "Eswatini" },
  { value: "mz", label: "Mozambique" },
  { value: "mw", label: "Malawi" },
  { value: "mg", label: "Madagascar" },
  { value: "mu", label: "Mauritius" },
  { value: "sc", label: "Seychelles" },
  { value: "km", label: "Comoros" },
  { value: "dj", label: "Djibouti" },
  { value: "er", label: "Eritrea" },
  { value: "ss", label: "South Sudan" },
  { value: "rw", label: "Rwanda" },
  { value: "bi", label: "Burundi" },
  { value: "cn", label: "China" },
  { value: "jp", label: "Japan" },
  { value: "kr", label: "South Korea" },
  { value: "kp", label: "North Korea" },
  { value: "mn", label: "Mongolia" },
  { value: "tw", label: "Taiwan" },
  { value: "hk", label: "Hong Kong" },
  { value: "mo", label: "Macau" },
  { value: "th", label: "Thailand" },
  { value: "vn", label: "Vietnam" },
  { value: "kh", label: "Cambodia" },
  { value: "la", label: "Laos" },
  { value: "mm", label: "Myanmar" },
  { value: "my", label: "Malaysia" },
  { value: "sg", label: "Singapore" },
  { value: "id", label: "Indonesia" },
  { value: "bn", label: "Brunei" },
  { value: "tl", label: "Timor-Leste" },
  { value: "au", label: "Australia" },
  { value: "nz", label: "New Zealand" },
  { value: "pg", label: "Papua New Guinea" },
  { value: "fj", label: "Fiji" },
  { value: "vu", label: "Vanuatu" },
  { value: "nc", label: "New Caledonia" },
  { value: "pf", label: "French Polynesia" },
  { value: "ws", label: "Samoa" },
  { value: "to", label: "Tonga" },
  { value: "ki", label: "Kiribati" },
  { value: "tv", label: "Tuvalu" },
  { value: "nr", label: "Nauru" },
  { value: "pw", label: "Palau" },
  { value: "fm", label: "Federated States of Micronesia" },
  { value: "mh", label: "Marshall Islands" },
  { value: "sb", label: "Solomon Islands" },
  { value: "ck", label: "Cook Islands" },
  { value: "nu", label: "Niue" },
  { value: "tk", label: "Tokelau" },
  { value: "ru", label: "Russia" },
  { value: "ua", label: "Ukraine" },
  { value: "by", label: "Belarus" },
  { value: "md", label: "Moldova" },
  { value: "ro", label: "Romania" },
  { value: "bg", label: "Bulgaria" },
  { value: "rs", label: "Serbia" },
  { value: "hr", label: "Croatia" },
  { value: "ba", label: "Bosnia and Herzegovina" },
  { value: "me", label: "Montenegro" },
  { value: "mk", label: "North Macedonia" },
  { value: "al", label: "Albania" },
  { value: "xk", label: "Kosovo" },
  { value: "si", label: "Slovenia" },
  { value: "hu", label: "Hungary" },
  { value: "sk", label: "Slovakia" },
  { value: "cz", label: "Czech Republic" },
  { value: "pl", label: "Poland" },
  { value: "lt", label: "Lithuania" },
  { value: "lv", label: "Latvia" },
  { value: "ee", label: "Estonia" },
  { value: "fi", label: "Finland" },
  { value: "se", label: "Sweden" },
  { value: "no", label: "Norway" },
  { value: "dk", label: "Denmark" },
  { value: "is", label: "Iceland" },
  { value: "ie", label: "Ireland" },
  { value: "de", label: "Germany" },
  { value: "at", label: "Austria" },
  { value: "ch", label: "Switzerland" },
  { value: "li", label: "Liechtenstein" },
  { value: "lu", label: "Luxembourg" },
  { value: "be", label: "Belgium" },
  { value: "nl", label: "Netherlands" },
  { value: "fr", label: "France" },
  { value: "mc", label: "Monaco" },
  { value: "ad", label: "Andorra" },
  { value: "es", label: "Spain" },
  { value: "pt", label: "Portugal" },
  { value: "it", label: "Italy" },
  { value: "sm", label: "San Marino" },
  { value: "va", label: "Vatican City" },
  { value: "mt", label: "Malta" },
  { value: "cy", label: "Cyprus" },
  { value: "gr", label: "Greece" },
  { value: "tr", label: "Turkey" },
  { value: "ge", label: "Georgia" },
  { value: "am", label: "Armenia" },
  { value: "az", label: "Azerbaijan" },
  { value: "kz", label: "Kazakhstan" },
  { value: "kg", label: "Kyrgyzstan" },
  { value: "tj", label: "Tajikistan" },
  { value: "tm", label: "Turkmenistan" },
  { value: "uz", label: "Uzbekistan" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "ye", label: "Yemen" },
  { value: "om", label: "Oman" },
  { value: "qa", label: "Qatar" },
  { value: "bh", label: "Bahrain" },
  { value: "kw", label: "Kuwait" },
  { value: "il", label: "Israel" },
  { value: "ps", label: "Palestine" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
  { value: "gt", label: "Guatemala" },
  { value: "bz", label: "Belize" },
  { value: "sv", label: "El Salvador" },
  { value: "hn", label: "Honduras" },
  { value: "ni", label: "Nicaragua" },
  { value: "cr", label: "Costa Rica" },
  { value: "pa", label: "Panama" },
  { value: "cu", label: "Cuba" },
  { value: "jm", label: "Jamaica" },
  { value: "ht", label: "Haiti" },
  { value: "do", label: "Dominican Republic" },
  { value: "pr", label: "Puerto Rico" },
  { value: "tt", label: "Trinidad and Tobago" },
  { value: "bb", label: "Barbados" },
  { value: "gd", label: "Grenada" },
  { value: "vc", label: "Saint Vincent and the Grenadines" },
  { value: "lc", label: "Saint Lucia" },
  { value: "dm", label: "Dominica" },
  { value: "ag", label: "Antigua and Barbuda" },
  { value: "kn", label: "Saint Kitts and Nevis" },
  { value: "bs", label: "Bahamas" },
  { value: "co", label: "Colombia" },
  { value: "ve", label: "Venezuela" },
  { value: "gy", label: "Guyana" },
  { value: "sr", label: "Suriname" },
  { value: "gf", label: "French Guiana" },
  { value: "br", label: "Brazil" },
  { value: "ec", label: "Ecuador" },
  { value: "pe", label: "Peru" },
  { value: "bo", label: "Bolivia" },
  { value: "py", label: "Paraguay" },
  { value: "uy", label: "Uruguay" },
  { value: "ar", label: "Argentina" },
  { value: "cl", label: "Chile" },
  { value: "fk", label: "Falkland Islands" },
];

// Form schemas
const createUserSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  courseIds: z.array(z.string()).optional(),
});

const bulkUserSchema = z.object({
  defaultLanguage: z.string(),
  defaultAssets: z.string(),
  defaultRoleCategory: z.string(),
  defaultSeniority: z.string(),
  users: z.array(z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().optional(),
  })),
  courseIds: z.array(z.string()).optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type BulkUserForm = z.infer<typeof bulkUserSchema>;

// Enhanced user type for display
interface EnhancedUser extends User {
  badgesCollected: number;
  mandatoryCoursesProgress: string;
  creatorName?: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformRoleFilter, setPlatformRoleFilter] = useState("all");
  const [assetsFilter, setAssetsFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [seniorityFilter, setSeniorityFilter] = useState("all");

  // Forms
  const addUserForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      language: "en",
      nationality: "",
      yearsOfExperience: "",
      assets: "",
      roleCategory: "",
      subCategory: "",
      seniority: "",
      organizationName: "",
      role: "user",
      isActive: true,
      courseIds: [],
    },
  });

  const bulkUserForm = useForm<BulkUserForm>({
    resolver: zodResolver(bulkUserSchema),
    defaultValues: {
      defaultLanguage: "en",
      defaultAssets: "",
      defaultRoleCategory: "",
      defaultSeniority: "",
      users: [{ firstName: "", lastName: "", email: "", username: "", password: "" }],
      courseIds: [],
    },
  });

  // Data fetching
  const { data: users = [], isLoading } = useQuery<EnhancedUser[]>({
    queryKey: ["/api/admin/users/enhanced"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserForm) => 
      fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create user");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      setIsAddDialogOpen(false);
      addUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (bulkData: BulkUserForm) =>
      fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulkData),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create users");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Users created",
        description: "Bulk user creation completed successfully",
      });
      setIsBulkUploadOpen(false);
      bulkUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to delete user");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatformRole = platformRoleFilter === "all" || user.role === platformRoleFilter;
    const matchesAssets = assetsFilter === "all" || user.assets === assetsFilter;
    const matchesRoleCategory = roleCategoryFilter === "all" || user.roleCategory === roleCategoryFilter;
    const matchesSeniority = seniorityFilter === "all" || user.seniority === seniorityFilter;

    return matchesSearch && matchesPlatformRole && matchesAssets && matchesRoleCategory && matchesSeniority;
  });

  // Helper functions
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "sub-admin": return "secondary";
      default: return "default";
    }
  };

  const handleViewDetails = (user: EnhancedUser) => {
    setSelectedUser(user);
    setIsViewDetailsOpen(true);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,First Name,Last Name,Email,Username,Password\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, sub-admins, and their platform access with comprehensive profile data
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download CSV template for bulk user upload</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk User Upload</DialogTitle>
              </DialogHeader>
              <Form {...bulkUserForm}>
                <form onSubmit={bulkUserForm.handleSubmit((data) => bulkCreateMutation.mutate(data))} className="space-y-4">
                  {/* Bulk upload form content will be implemented */}
                  <div className="text-center py-8 text-muted-foreground">
                    Bulk upload form implementation in progress...
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <Form {...addUserForm}>
                <form onSubmit={addUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <FormField
                      control={addUserForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Platform Role */}
                    <FormField
                      control={addUserForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Preferences */}
                    <FormField
                      control={addUserForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      control={addUserForm.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NATIONALITIES.map((nationality) => (
                                <SelectItem key={nationality.value} value={nationality.value}>
                                  {nationality.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
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

                    {/* Sector/Asset Classification */}
                    <FormField
                      control={addUserForm.control}
                      name="assets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assets</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select asset category" />
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
                      control={addUserForm.control}
                      name="roleCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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
                      control={addUserForm.control}
                      name="seniority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seniority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select seniority level" />
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
                      control={addUserForm.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub-Category</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter sub-category (optional)" 
                              value={field.value || ""} 
                              onChange={field.onChange} 
                              onBlur={field.onBlur} 
                              name={field.name} 
                              ref={field.ref} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addUserForm.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter organization name (optional)" 
                              value={field.value || ""} 
                              onChange={field.onChange} 
                              onBlur={field.onBlur} 
                              name={field.name} 
                              ref={field.ref} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
          <CardDescription>
            Use the filters below to find specific users. Showing {filteredUsers.length} of {users.length} users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-role">Platform Role</Label>
              <Select value={platformRoleFilter} onValueChange={setPlatformRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assets">Assets</Label>
              <Select value={assetsFilter} onValueChange={setAssetsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {ASSETS.map((asset) => (
                    <SelectItem key={asset.value} value={asset.value}>
                      {asset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-category">Role Category</Label>
              <Select value={roleCategoryFilter} onValueChange={setRoleCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ROLE_CATEGORIES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {SENIORITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {users.length === 0 
                ? "No users found. Create your first user to get started."
                : "No users match the current filters. Try adjusting your search criteria."
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Platform Role</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Role Category</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>XP Points</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === "sub-admin" ? "Sub-Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.assets ? ASSETS.find(a => a.value === user.assets)?.label || user.assets : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.roleCategory ? ROLE_CATEGORIES.find(r => r.value === user.roleCategory)?.label || user.roleCategory : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.seniority ? SENIORITY_LEVELS.find(s => s.value === user.seniority)?.label || user.seniority : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.xpPoints} XP</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.badgesCollected || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.mandatoryCoursesProgress || "0/0"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-sm">@{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Platform Role</Label>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role === "sub-admin" ? "Sub-Admin" : selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Language</Label>
                  <p className="text-sm">{LANGUAGES.find(l => l.value === selectedUser.language)?.label || selectedUser.language}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                  <p className="text-sm">{NATIONALITIES.find(n => n.value === selectedUser.nationality)?.label || selectedUser.nationality || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                  <p className="text-sm">{YEARS_OF_EXPERIENCE.find(e => e.value === selectedUser.yearsOfExperience)?.label || selectedUser.yearsOfExperience || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assets</Label>
                  <p className="text-sm">{ASSETS.find(a => a.value === selectedUser.assets)?.label || selectedUser.assets || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role Category</Label>
                  <p className="text-sm">{ROLE_CATEGORIES.find(r => r.value === selectedUser.roleCategory)?.label || selectedUser.roleCategory || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Seniority</Label>
                  <p className="text-sm">{SENIORITY_LEVELS.find(s => s.value === selectedUser.seniority)?.label || selectedUser.seniority || "—"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sub-Category</Label>
                  <p className="text-sm">{selectedUser.subCategory || "—"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                  <p className="text-sm">{selectedUser.organizationName || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">XP Points</Label>
                  <Badge variant="outline">{selectedUser.xpPoints} XP</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Badges Collected</Label>
                  <Badge variant="outline">{selectedUser.badgesCollected || 0}</Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Mandatory Courses Progress</Label>
                  <p className="text-sm">{selectedUser.mandatoryCoursesProgress || "0/0"}</p>
                </div>
                {selectedUser.creatorName && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                    <p className="text-sm">{selectedUser.creatorName}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}