import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, FileSpreadsheet, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { type User, type Course } from "@shared/schema";
import AdminLayout from "@/components/layout/admin-layout";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { BulkUploadDialog } from "@/components/admin/bulk-upload-dialog";
import { BulkAddDialog } from "@/components/admin/bulk-add-dialog";

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
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [editingUser, setEditingUser] = useState<EnhancedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformRoleFilter, setPlatformRoleFilter] = useState("all");
  const [assetsFilter, setAssetsFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [seniorityFilter, setSeniorityFilter] = useState("all");

  // Data fetching
  const { data: users = [], isLoading } = useQuery<EnhancedUser[]>({
    queryKey: ["/api/admin/users/enhanced"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => 
      fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setIsUserFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/enhanced"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) => 
      fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      }).then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Update user error response:", errorText);
          throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
      setIsUserFormOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/enhanced"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkCreateUsersMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create users");
        return res.json();
      }),
    onSuccess: (result: any) => {
      toast({
        title: "Users created",
        description: `Successfully created ${result.count} users`,
      });
      setIsBulkAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/enhanced"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch("/api/admin/users/bulk-upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then(async res => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to upload file");
        }
        return res.json();
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk upload completed",
        description: data.message || `Created ${data.created} users. Failed: ${data.failed}`,
      });
      setIsBulkUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/enhanced"] });
      
      if (data.failedUsers && data.failedUsers.length > 0) {
        console.log("Failed users:", data.failedUsers);
        setTimeout(() => {
          toast({
            title: "Upload Details",
            description: `Check console for detailed failure reasons. Common issues: missing required fields, invalid email format, duplicate emails.`,
            variant: "destructive",
          });
        }, 2000);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/enhanced"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatformRole = platformRoleFilter === "all" || user.role === platformRoleFilter;
    const matchesAssets = assetsFilter === "all" || user.assets === assetsFilter;
    const matchesRoleCategory = roleCategoryFilter === "all" || user.roleCategory === roleCategoryFilter;
    const matchesSeniority = seniorityFilter === "all" || user.seniority === seniorityFilter;

    return matchesSearch && matchesPlatformRole && matchesAssets && matchesRoleCategory && matchesSeniority;
  });

  // Event handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: EnhancedUser) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleViewDetails = (user: EnhancedUser) => {
    setSelectedUser(user);
    setIsViewDetailsOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleUserFormSubmit = (data: any) => {
    if (editingUser) {
      // For updates, the user-form-dialog already includes the ID in the data
      // Extract the id from data and pass it properly to the mutation
      const { id, ...userData } = data;
      updateUserMutation.mutate({ id: id || editingUser.id, userData });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleBulkAddSubmit = (data: any) => {
    bulkCreateUsersMutation.mutate(data);
  };

  const handleBulkUploadSubmit = (formData: FormData) => {
    // FormData is already properly constructed in the dialog
    bulkUploadMutation.mutate(formData);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "sub-admin": return "secondary";
      default: return "outline";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 m-6 p-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions across the platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBulkUploadOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => setIsBulkAddOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Bulk Add Users
            </Button>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and filter users by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Role</label>
                <Select value={platformRoleFilter} onValueChange={setPlatformRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium">Assets</label>
                <Select value={assetsFilter} onValueChange={setAssetsFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="Museum">Museum</SelectItem>
                    <SelectItem value="Culture site">Culture site</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Airports">Airports</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role Category</label>
                <Select value={roleCategoryFilter} onValueChange={setRoleCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Welcome staff">Welcome staff</SelectItem>
                    <SelectItem value="Security personnel">Security personnel</SelectItem>
                    <SelectItem value="Customer service">Customer service</SelectItem>
                    <SelectItem value="Guides">Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Seniority</label>
                <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
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
            <CardDescription>
              Comprehensive user management with detailed profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading users...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assets</TableHead>
                      <TableHead>Role Category</TableHead>
                      <TableHead>Seniority</TableHead>
                      <TableHead>XP Points</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.firstName?.charAt(0) || user.username?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === "sub-admin" ? "Sub-Admin" : user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.assets || "—"}</TableCell>
                        <TableCell>{user.roleCategory || "—"}</TableCell>
                        <TableCell>{user.seniority || "—"}</TableCell>
                        <TableCell>{user.xpPoints || 0}</TableCell>
                        <TableCell>{user.badgesCollected || 0}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <UserFormDialog
          open={isUserFormOpen}
          onOpenChange={setIsUserFormOpen}
          user={editingUser}
          courses={courses}
          onSubmit={handleUserFormSubmit}
          isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        />

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          open={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          onSubmit={handleBulkUploadSubmit}
          isLoading={bulkUploadMutation.isPending}
        />

        {/* Bulk Add Dialog */}
        <BulkAddDialog
          open={isBulkAddOpen}
          onOpenChange={setIsBulkAddOpen}
          courses={courses}
          onSubmit={handleBulkAddSubmit}
          isLoading={bulkCreateUsersMutation.isPending}
        />

        {/* User Details Dialog */}
        {selectedUser && (
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-sm">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-sm">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {selectedUser.role === "sub-admin" ? "Sub-Admin" : selectedUser.role}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Language</label>
                    <p className="text-sm">{selectedUser.language || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <p className="text-sm">{selectedUser.nationality || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Experience</label>
                    <p className="text-sm">{selectedUser.yearsOfExperience || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assets</label>
                    <p className="text-sm">
                      {selectedUser.assets ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedUser.assets}
                        </Badge>
                      ) : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role Category</label>
                    <p className="text-sm">
                      {selectedUser.roleCategory ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {selectedUser.roleCategory}
                        </Badge>
                      ) : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sub Category</label>
                    <p className="text-sm">{selectedUser.subCategory || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Seniority</label>
                    <p className="text-sm">
                      {selectedUser.seniority ? (
                        <Badge variant="outline" className={
                          selectedUser.seniority === "Manager" 
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }>
                          {selectedUser.seniority}
                        </Badge>
                      ) : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Organization</label>
                    <p className="text-sm">{selectedUser.organizationName || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">XP Points</label>
                    <p className="text-sm">{selectedUser.xpPoints || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Badges Collected</label>
                    <p className="text-sm">{selectedUser.badgesCollected || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created By</label>
                    <p className="text-sm">{selectedUser.creatorName || "—"}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}