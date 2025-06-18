import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import type { Course } from "@shared/schema";
import type { roles as RoleType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Filter, MoreVertical, Upload, FileSpreadsheet } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  FormDescription,
} from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "wouter";

// User edit form schema
const userEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  language: z.string().min(1, "Language is required"),
  assets: z.string().optional(),
  roleCategory: z.string().optional(),
  seniority: z.string().optional(),
});

// New user form schema
const newUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  language: z.string().min(1, "Language is required"),
  courseIds: z.array(z.string()).optional(),
});

// Bulk user creation schema
const bulkUserSchema = z.object({
  defaultRole: z.string().min(1, "Role is required"),
  defaultLanguage: z.string().min(1, "Language is required"),
  users: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      username: z.string().min(3, "Username must be at least 3 characters"),
      password: z.string().min(6, "Password must be at least 6 characters").optional(),
    })
  ).min(1, "At least one user is required"),
  courseIds: z.array(z.string()).optional(),
});

type BulkUserData = z.infer<typeof bulkUserSchema>;
type UserEditFormValues = z.infer<typeof userEditSchema>;
type NewUserFormValues = z.infer<typeof newUserSchema>;

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformRoleFilter, setPlatformRoleFilter] = useState("all");
  const [assetsFilter, setAssetsFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [seniorityFilter, setSeniorityFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [isExcelUploadDialogOpen, setIsExcelUploadDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Add New User Form
  const addUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      role: "frontliner",
      language: "en",
      courseIds: [],
    }
  });
  
  // Bulk Add Users Form
  const bulkUserForm = useForm<BulkUserData>({
    resolver: zodResolver(bulkUserSchema),
    defaultValues: {
      defaultRole: "frontliner",
      defaultLanguage: "en",
      users: [{ name: "", email: "", username: "", password: "" }],
      courseIds: [],
    }
  });
  
  // Setup field array for bulk user creation
  const { fields: userFields, append: appendUser, remove: removeUser } = useFieldArray({
    name: "users",
    control: bulkUserForm.control,
  });
  
  // Function to add a new user field in bulk creation
  const addUserField = () => {
    appendUser({ name: "", email: "", username: "", password: "" });
  };
  
  // Function to remove a user field
  const removeUserField = (index: number) => {
    removeUser(index);
  };
  
  // Handle bulk user submission
  const onBulkAddSubmit = (data: BulkUserData) => {
    createBulkUsersMutation.mutate(data);
  };
  
  // Handle single user submission
  const onAddUserSubmit = (data: NewUserFormValues) => {
    createUserMutation.mutate(data);
  };

  // Redirect if not admin
  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch users with enhanced data including XP, badges, and progress
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users/enhanced"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users/enhanced");
      return await res.json();
    },
  });

  // Fetch courses for assigning to users
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Fetch available roles
  const { data: roles } = useQuery<typeof RoleType.$inferSelect[]>({
    queryKey: ["/api/roles"],
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { id: number }) => {
      const { id, ...data } = userData;
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUserFormValues) => {
      const res = await apiRequest("POST", `/api/admin/users`, userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      setIsAddDialogOpen(false);
      addUserForm.reset({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "frontliner",
        language: "en",
        courseIds: [],
      });
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
  
  // Create bulk users mutation
  const createBulkUsersMutation = useMutation({
    mutationFn: async (usersData: BulkUserData) => {
      const res = await apiRequest("POST", `/api/admin/users/bulk`, usersData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Users created in bulk",
        description: `${data.created || 0} users were created successfully`,
      });
      setIsBulkAddDialogOpen(false);
      bulkUserForm.reset({
        defaultRole: "frontliner",
        defaultLanguage: "en",
        users: [{ name: "", email: "", username: "", password: "" }],
        courseIds: [],
      });
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
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
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

  // Function to handle user deletion
  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };
  
  // Excel upload mutation
  const uploadExcelMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/admin/users/upload-excel", {
        method: "POST",
        body: formData,
        // Don't set Content-Type here, it will be automatically set with the boundary parameter
      });
      return res.json();
    },
    onSuccess: (data) => {
      setIsExcelUploadDialogOpen(false);
      setUploadResult(data);
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Excel import successful",
        description: `Created ${data.created} users. ${data.failed} failed.`,
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Excel import failed",
        description: "There was an error importing users. Please check your file format.",
        variant: "destructive",
      });
      console.error("Excel upload error:", error);
    }
  });
  
  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' || 
          file.type === 'text/csv' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls') || 
          file.name.endsWith('.csv')) {
        setSelectedFile(file);
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile && !fileInputRef.current?.files?.length) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    
    // Validate required fields
    const defaultRole = formData.get("defaultRole") as string;
    const defaultLanguage = formData.get("defaultLanguage") as string;
    
    if (!defaultRole || !defaultLanguage) {
      toast({
        title: "Missing required fields",
        description: "Please select a default role and language.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    uploadExcelMutation.mutate(formData);
  };

  // Edit user form
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: selectedUser?.name || "",
      email: selectedUser?.email || "",
      role: selectedUser?.role || "frontliner",
      language: selectedUser?.language || "en",
    },
  });

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language || "en",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: UserEditFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        ...data,
      });
    }
  };

  // Download template CSV file
  const downloadTemplate = () => {
    const csvContent = [
      ['name', 'email', 'username', 'password'],
      ['John Doe', 'john.doe@example.com', 'johndoe', 'password123'],
      ['Jane Smith', 'jane.smith@example.com', 'janesmith', 'password456']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter users based on search and multiple filters
  const filteredUsers = users 
    ? users.filter(user => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPlatformRole = platformRoleFilter === "all" || user.role === platformRoleFilter;
        const matchesAssets = assetsFilter === "all" || (user.assets && user.assets.includes(assetsFilter));
        const matchesRoleCategory = roleCategoryFilter === "all" || (user.roleCategory && user.roleCategory === roleCategoryFilter);
        const matchesSeniority = seniorityFilter === "all" || (user.seniority && user.seniority === seniorityFilter);
        
        return matchesSearch && matchesPlatformRole && matchesAssets && matchesRoleCategory && matchesSeniority;
      })
    : [];

  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-primary" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar (always visible on md+) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-neutrals-100 p-4 pb-16 md:pb-4">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Title Section */}
                <div>
                  <h1 className="font-heading text-3xl font-bold text-neutrals-800">User Management</h1>
                  <p className="text-neutrals-600 mt-1">Manage users, roles, and permissions across the platform</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)} 
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md"
                  >
                    <span className="material-icons mr-2 text-lg">add</span>
                    Add User
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBulkAddDialogOpen(true)} 
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 shadow-sm"
                  >
                    <span className="material-icons mr-2 text-lg">group_add</span>
                    Bulk Add
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsExcelUploadDialogOpen(true)} 
                    className="bg-cyan-50 text-teal-700 hover:bg-cyan-100 border border-cyan-200 shadow-sm"
                  >
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Import Excel
                  </Button>
                </div>
              </div>

              {/* Search and Filters Section */}
              <div className="mt-6 bg-slate-50/50 rounded-xl p-4 border border-slate-200/60">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="relative lg:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by name, email, or username..."
                      className="pl-10 bg-white border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Select value={platformRoleFilter} onValueChange={setPlatformRoleFilter}>
                      <SelectTrigger className="bg-white border-slate-300 focus:border-teal-500">
                        <Filter className="mr-2 h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Platform Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platform Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={assetsFilter} onValueChange={setAssetsFilter}>
                      <SelectTrigger className="bg-white border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Assets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={roleCategoryFilter} onValueChange={setRoleCategoryFilter}>
                      <SelectTrigger className="bg-white border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Role Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="frontline">Frontline</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
                      <SelectTrigger className="bg-white border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Seniority Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="rounded-md border">
                <div className="p-4">
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="space-y-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assets</TableHead>
                      <TableHead>Role Category</TableHead>
                      <TableHead>Seniority</TableHead>
                      <TableHead>XP Points</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead>Mandatory Progress</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center text-sm font-semibold mr-2">
                                {user.name.charAt(0)}
                              </div>
                              {user.name}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-teal-100 text-teal-700' :
                              user.role === 'supervisor' ? 'bg-cyan-100 text-cyan-700' :
                              user.role === 'content_creator' ? 'bg-teal-50 text-teal-600' :
                              'bg-neutrals-200 text-neutrals-700'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">
                              {user.assets || 'Not Assigned'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-md text-xs bg-purple-50 text-purple-700">
                              {user.roleCategory || 'Not Set'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-md text-xs bg-orange-50 text-orange-700">
                              {user.seniority || 'Not Set'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-yellow-600">{user.xpPoints?.toLocaleString() || '0'}</span>
                              <span className="text-xs text-gray-500">XP</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-blue-600">{user.badgesCollected || 0}</span>
                              <span className="text-xs text-gray-500">badges</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${user.mandatoryProgress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{user.mandatoryProgress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600">{user.language || 'English'}</span>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <span className="material-icons text-sm mr-2">edit</span>
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedUserForDetails(user)}>
                                  <span className="material-icons text-sm mr-2">visibility</span>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-danger"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <span className="material-icons text-sm mr-2">delete</span>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles && roles.length > 0 ? (
                          roles.map(role => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="content_creator">Content Creator</SelectItem>
                            <SelectItem value="frontliner">Frontliner</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
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
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assets" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not Assigned</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
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
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not Set</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="frontline">Frontline</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seniority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not Set</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateUserMutation.isPending} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign courses. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input 
                          type="password" 
                          placeholder="Enter password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles && roles.length > 0 ? (
                            roles.map(role => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="admin">Administrator</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                          <SelectItem value="ur">Urdu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Course Assignment - only show if courses are available */}
              {courses && courses.length > 0 && (
                <FormField
                  control={addUserForm.control}
                  name="courseIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Assign Courses (Optional)</FormLabel>
                        <FormDescription>
                          Select courses that this user will have access to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {courses.map((course) => (
                          <FormField
                            key={course.id}
                            control={addUserForm.control}
                            name="courseIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={course.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(course.id.toString())}
                                      onCheckedChange={(checked) => {
                                        const courseId = course.id.toString();
                                        return checked
                                          ? field.onChange([...(field.value || []), courseId])
                                          : field.onChange(
                                              field.value?.filter((id) => id !== courseId) || []
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-normal">
                                      {course.name}
                                    </FormLabel>
                                    {course.description && (
                                      <FormDescription className="text-xs">
                                        {course.description.substring(0, 80)}{course.description.length > 80 ? "..." : ""}
                                      </FormDescription>
                                    )}
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Users Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Bulk Add Users</DialogTitle>
            <DialogDescription>
              Add multiple users at once. Each user requires a name, email, and username.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bulkUserForm}>
            <form onSubmit={bulkUserForm.handleSubmit(onBulkAddSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default Role */}
                <FormField
                  control={bulkUserForm.control}
                  name="defaultRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.map(role => (
                            <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Default Language */}
                <FormField
                  control={bulkUserForm.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                          <SelectItem value="ur">Urdu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Course Assignment - only show if courses are available */}
              {courses && courses.length > 0 && (
                <FormField
                  control={bulkUserForm.control}
                  name="courseIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Assign Courses (Optional)</FormLabel>
                        <FormDescription>
                          Select courses to assign to all new users
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {courses.map((course) => (
                          <div key={course.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`bulk-course-${course.id}`}
                              checked={field.value?.includes(course.id.toString())}
                              onCheckedChange={(checked) => {
                                const courseId = course.id.toString();
                                return checked
                                  ? field.onChange([...(field.value || []), courseId])
                                  : field.onChange(
                                      field.value?.filter((id) => id !== courseId) || []
                                    );
                              }}
                            />
                            <label
                              htmlFor={`bulk-course-${course.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Users List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Users</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addUserField}
                  >
                    <span className="material-icons mr-1 text-sm">add</span>
                    Add Another User
                  </Button>
                </div>
                
                {userFields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 relative">
                    <div className="absolute right-2 top-2">
                      {index > 0 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeUserField(index)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="material-icons text-red-500">close</span>
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <FormField
                        control={bulkUserForm.control}
                        name={`users.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Email */}
                      <FormField
                        control={bulkUserForm.control}
                        name={`users.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Username */}
                      <FormField
                        control={bulkUserForm.control}
                        name={`users.${index}.username`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Password */}
                      <FormField
                        control={bulkUserForm.control}
                        name={`users.${index}.password`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Leave blank for auto-generated"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Enter Password
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBulkUsersMutation.isPending} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                  {createBulkUsersMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Users
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* User Details Modal */}
      <Dialog open={!!selectedUserForDetails} onOpenChange={() => setSelectedUserForDetails(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center text-lg font-semibold">
                {selectedUserForDetails?.name.charAt(0)}
              </div>
              {selectedUserForDetails?.name}
            </DialogTitle>
            <DialogDescription>
              Complete user profile and learning progress overview
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserForDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Email</h4>
                  <p className="text-sm">{selectedUserForDetails.email}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Username</h4>
                  <p className="text-sm">{selectedUserForDetails.username}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Platform Role</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUserForDetails.role === 'admin' ? 'bg-teal-100 text-teal-700' :
                    selectedUserForDetails.role === 'supervisor' ? 'bg-cyan-100 text-cyan-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedUserForDetails.role.charAt(0).toUpperCase() + selectedUserForDetails.role.slice(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Language</h4>
                  <p className="text-sm">{selectedUserForDetails.language || 'English'}</p>
                </div>
              </div>

              {/* Role Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Role Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Assets</h4>
                    <span className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">
                      {selectedUserForDetails.assets || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Role Category</h4>
                    <span className="px-2 py-1 rounded-md text-xs bg-purple-50 text-purple-700">
                      {selectedUserForDetails.roleCategory || 'Not Set'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Seniority</h4>
                    <span className="px-2 py-1 rounded-md text-xs bg-orange-50 text-orange-700">
                      {selectedUserForDetails.seniority || 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Progress */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Learning Progress</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{selectedUserForDetails.xpPoints?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-600">XP Points</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedUserForDetails.badgesCollected || 0}</div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedUserForDetails.mandatoryProgress || 0}%</div>
                    <div className="text-sm text-gray-600">Mandatory Courses</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Mandatory Progress</span>
                    <span>{selectedUserForDetails.mandatoryProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedUserForDetails.mandatoryProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Account Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Created At</h4>
                    <p className="text-sm">{formatDate(selectedUserForDetails.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">User ID</h4>
                    <p className="text-sm font-mono">#{selectedUserForDetails.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUserForDetails(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setSelectedUser(selectedUserForDetails);
              setSelectedUserForDetails(null);
              setIsEditDialogOpen(true);
            }} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Upload Dialog */}
      <Dialog open={isExcelUploadDialogOpen} onOpenChange={setIsExcelUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Users from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with user details. The file should have columns for name and email.
              Email addresses are used for login. Passwords are optional - if not provided, they will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="defaultRole">Default Role</Label>
                <Select name="defaultRole" defaultValue="frontliner" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Frontliner (Default)" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles ? roles.map(role => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        {role.name === "frontliner" && " (Lowest Privilege)"}
                      </SelectItem>
                    )) : (
                      <>
                        <SelectItem value="frontliner">Frontliner (Lowest Privilege)</SelectItem>
                        <SelectItem value="content_creator">Content Creator</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select name="defaultLanguage" defaultValue="en" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {courses && courses.length > 0 && (
                <div className="flex flex-col space-y-1.5">
                  <Label>Assign Courses (Optional)</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox id={`course-${course.id}`} name="courseIds" value={course.id.toString()} />
                        <Label htmlFor={`course-${course.id}`} className="text-sm font-normal cursor-pointer">
                          {course.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="excelFile">Excel File</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    name="excelFile" 
                    id="excelFile"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className={`p-3 rounded-full ${isDragOver ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <FileSpreadsheet className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-green-600">
                          ✓ File selected: {selectedFile.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">
                          <label htmlFor="excelFile" className="cursor-pointer font-medium text-primary hover:text-primary/80 transition-colors">
                            Click to upload
                          </label>
                          <span className="mx-1">or</span>
                          <span className="font-medium">drag and drop your file here</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Excel (.xlsx, .xls) or CSV file (max 5MB)
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Excel file should have these columns:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>name - Full name of the user</li>
                      <li>email - Email address (used for login)</li>
                      <li>username - Unique username for the account</li>
                      <li>password - (Optional) Password for the account</li>
                    </ul>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsExcelUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}