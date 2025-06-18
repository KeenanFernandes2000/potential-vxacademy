
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Settings, Eye, Edit, Trash2, Users, Filter, MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminLayout from "@/components/layout/admin-layout";
import { type Unit, type Course, type TrainingArea, type Module } from "@shared/schema";

// Form schemas
const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  assets: z.string().min(1, "Asset is required"),
  roleCategory: z.string().min(1, "Role category is required"),
  seniority: z.string().min(1, "Seniority is required"),
});

const unitAssignmentSchema = z.object({
  trainingAreaId: z.string().optional(),
  moduleId: z.string().optional(),
  courseId: z.string().optional(),
  unitIds: z.array(z.number()).min(1, "At least one unit must be selected"),
});

type RoleFormData = z.infer<typeof roleFormSchema>;
type UnitAssignmentData = z.infer<typeof unitAssignmentSchema>;

// Enhanced role interface
interface Role {
  id: number;
  name: string;
  assets: string;
  roleCategory: string;
  seniority: string;
  userCount: number;
  createdAt: string;
}

// Dropdown options
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

export default function RolesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUnitAssignmentOpen, setIsUnitAssignmentOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seniorityFilter, setSeniorityFilter] = useState("all");

  // Filter states for unit assignment
  const [selectedTrainingArea, setSelectedTrainingArea] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  // Forms
  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      assets: "",
      roleCategory: "",
      seniority: "",
    },
  });

  const unitAssignmentForm = useForm<UnitAssignmentData>({
    resolver: zodResolver(unitAssignmentSchema),
    defaultValues: {
      trainingAreaId: "",
      moduleId: "",
      courseId: "",
      unitIds: [],
    },
  });

  // Data fetching
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
    queryFn: () => fetch("/api/admin/roles", { credentials: "include" }).then(res => res.json()),
  });

  const { data: trainingAreas = [] } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
    queryFn: () => fetch("/api/training-areas", { credentials: "include" }).then(res => res.json()),
  });

  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
    queryFn: () => fetch("/api/modules", { credentials: "include" }).then(res => res.json()),
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: () => fetch("/api/courses", { credentials: "include" }).then(res => res.json()),
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    queryFn: () => fetch("/api/units", { credentials: "include" }).then(res => res.json()),
  });

  const { data: courseUnits = [] } = useQuery<any[]>({
    queryKey: ["/api/course-units"],
    queryFn: () => fetch("/api/course-units", { credentials: "include" }).then(res => res.json()),
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (data: RoleFormData) =>
      fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create role");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Role created",
        description: "New role has been created successfully",
      });
      setIsRoleDialogOpen(false);
      roleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleFormData }) =>
      fetch(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update role");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "Role has been updated successfully",
      });
      setIsRoleDialogOpen(false);
      setEditingRole(null);
      roleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) =>
      fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to delete role");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Role deleted",
        description: "Role has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignUnitsMutation = useMutation({
    mutationFn: ({ roleId, unitIds }: { roleId: number; unitIds: number[] }) =>
      fetch(`/api/admin/roles/${roleId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitIds }),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to assign units");
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Units assigned",
        description: "Units have been assigned to the role successfully",
      });
      setIsUnitAssignmentOpen(false);
      setSelectedRole(null);
      unitAssignmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter roles based on search and filters
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = assetFilter === "all" || role.assets === assetFilter;
    const matchesCategory = categoryFilter === "all" || role.roleCategory === categoryFilter;
    const matchesSeniority = seniorityFilter === "all" || role.seniority === seniorityFilter;

    return matchesSearch && matchesAsset && matchesCategory && matchesSeniority;
  });

  // Filter units for assignment based on selected filters
  const filteredUnits = units.filter((unit) => {
    if (selectedCourse && selectedCourse !== "all") {
      const courseId = parseInt(selectedCourse);
      return courseUnits.some(cu => cu.courseId === courseId && cu.unitId === unit.id);
    }
    if (selectedModule && selectedModule !== "all") {
      const moduleCourses = courses.filter(c => c.moduleId === parseInt(selectedModule));
      const moduleCourseIds = moduleCourses.map(c => c.id);
      return courseUnits.some(cu => moduleCourseIds.includes(cu.courseId) && cu.unitId === unit.id);
    }
    if (selectedTrainingArea && selectedTrainingArea !== "all") {
      const areaModules = modules.filter(m => m.trainingAreaId === parseInt(selectedTrainingArea));
      const areaCourses = courses.filter(c => areaModules.some(m => m.id === c.moduleId));
      const areaCourseIds = areaCourses.map(c => c.id);
      return courseUnits.some(cu => areaCourseIds.includes(cu.courseId) && cu.unitId === unit.id);
    }
    return true;
  });

  // Event handlers
  const handleCreateRole = () => {
    setEditingRole(null);
    roleForm.reset();
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.reset({
      name: role.name,
      assets: role.assets,
      roleCategory: role.roleCategory,
      seniority: role.seniority,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleAssignUnits = (role: Role) => {
    setSelectedRole(role);
    unitAssignmentForm.reset();
    setSelectedTrainingArea("all");
    setSelectedModule("all");
    setSelectedCourse("all");
    setIsUnitAssignmentOpen(true);
  };

  const handleRoleFormSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleUnitAssignmentSubmit = (data: UnitAssignmentData) => {
    if (selectedRole) {
      assignUnitsMutation.mutate({ roleId: selectedRole.id, unitIds: data.unitIds });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Create and manage roles with asset, category, and seniority configurations
            </p>
          </div>
          <Button onClick={handleCreateRole} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and filter roles by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <Select value={assetFilter} onValueChange={setAssetFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium">Role Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ROLE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
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

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles ({filteredRoles.length})</CardTitle>
            <CardDescription>
              Comprehensive role management with user assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading roles...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Role Category</TableHead>
                      <TableHead>Seniority</TableHead>
                      <TableHead>Number of Users</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="font-medium">{role.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.assets}</Badge>
                        </TableCell>
                        <TableCell>{role.roleCategory}</TableCell>
                        <TableCell>
                          <Badge variant={role.seniority === "Manager" ? "default" : "secondary"}>
                            {role.seniority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {role.userCount || 0}
                          </div>
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
                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAssignUnits(role)}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Assign Units
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Role
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

        {/* Role Form Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : "Create Role"}
              </DialogTitle>
            </DialogHeader>

            <Form {...roleForm}>
              <form onSubmit={roleForm.handleSubmit(handleRoleFormSubmit)} className="space-y-4">
                <FormField
                  control={roleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={roleForm.control}
                  name="assets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset *</FormLabel>
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
                  control={roleForm.control}
                  name="roleCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={roleForm.control}
                  name="seniority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seniority *</FormLabel>
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

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRoleDialogOpen(false)}
                    disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                  >
                    {createRoleMutation.isPending || updateRoleMutation.isPending 
                      ? "Saving..." 
                      : editingRole ? "Update Role" : "Create Role"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Unit Assignment Dialog */}
        <Dialog open={isUnitAssignmentOpen} onOpenChange={setIsUnitAssignmentOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Assign Units to {selectedRole?.name}
              </DialogTitle>
            </DialogHeader>

            <Form {...unitAssignmentForm}>
              <form onSubmit={unitAssignmentForm.handleSubmit(handleUnitAssignmentSubmit)} className="space-y-6">
                {/* Filters for Unit Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Units</CardTitle>
                    <CardDescription>
                      Filter units by training area, module, and course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Training Area</label>
                        <Select value={selectedTrainingArea} onValueChange={setSelectedTrainingArea}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select training area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Training Areas</SelectItem>
                            {trainingAreas.map((area) => (
                              <SelectItem key={area.id} value={area.id.toString()}>
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Module</label>
                        <Select value={selectedModule} onValueChange={setSelectedModule}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Modules</SelectItem>
                            {modules
                              .filter(m => selectedTrainingArea === "all" || !selectedTrainingArea || m.trainingAreaId === parseInt(selectedTrainingArea))
                              .map((module) => (
                                <SelectItem key={module.id} value={module.id.toString()}>
                                  {module.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course</label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses
                              .filter(c => selectedModule === "all" || !selectedModule || c.moduleId === parseInt(selectedModule))
                              .map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                  {course.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Unit Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Units</CardTitle>
                    <CardDescription>
                      Choose which units to assign to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={unitAssignmentForm.control}
                      name="unitIds"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUnits.map((unit) => (
                              <FormField
                                key={unit.id}
                                control={unitAssignmentForm.control}
                                name="unitIds"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={unit.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(unit.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, unit.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== unit.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {unit.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUnitAssignmentOpen(false)}
                    disabled={assignUnitsMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assignUnitsMutation.isPending}>
                    {assignUnitsMutation.isPending ? "Assigning..." : "Assign Units"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
