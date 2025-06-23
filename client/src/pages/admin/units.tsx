import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Course, Unit, InsertUnit, TrainingArea, Module } from "@shared/schema";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Plus, Trash, FileText, School, ChevronRight, Search, Filter, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminLayout from "@/components/layout/admin-layout";

// Form validation schema
const unitFormSchema = z.object({
  name: z.string().min(2, {
    message: "Unit name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  internalNote: z.string().optional(),
  trainingAreaId: z.string().optional(),
  moduleId: z.string().optional(),
  courseIds: z.array(z.string()).default([]),
  order: z.coerce.number().default(1),
  duration: z.coerce.number().min(1).default(30),
  showDuration: z.boolean().default(true),
  xpPoints: z.coerce.number().min(0).default(100),
});

export default function UnitsManagement() {
  const [location, setLocation] = useLocation();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainingAreaId, setSelectedTrainingAreaId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedFilterCourseId, setSelectedFilterCourseId] = useState<number | null>(null);
  
  const { toast } = useToast();

  // Get courseId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("courseId");
    if (courseId) {
      setSelectedCourseId(parseInt(courseId));
    }
  }, []);

  // Fetch training areas
  const { data: trainingAreas } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
  });

  // Fetch modules (filtered by training area if selected)
  const { data: modules } = useQuery<Module[]>({
    queryKey: ["/api/modules", selectedTrainingAreaId],
    queryFn: async () => {
      const url = selectedTrainingAreaId 
        ? `/api/modules?trainingAreaId=${selectedTrainingAreaId}`
        : "/api/modules";
      const res = await apiRequest("GET", url);
      return await res.json();
    },
  });

  // Fetch courses for dropdown and filtering
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", selectedModuleId],
    queryFn: async () => {
      const url = selectedModuleId 
        ? `/api/courses?moduleId=${selectedModuleId}`
        : "/api/courses";
      const res = await apiRequest("GET", url);
      return await res.json();
    },
  });

  // Fetch all units
  const { data: allUnits, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/units");
      return await res.json();
    },
  });

  // Filter units based on search and filters
  const filteredUnits = allUnits?.filter(unit => {
    // Search filter
    const matchesSearch = !searchTerm || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Training area, module, course filtering
    if (selectedFilterCourseId) {
      // For the new schema, we need to check course relationships differently
      // This might need adjustment based on the actual unit-course relationship
      return true; // Placeholder - needs proper implementation
    }

    return matchesSearch;
  }) || [];

  // Units for the selected course (for form dropdown)
  const units = allUnits || [];

  // Form setup
  const form = useForm({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      internalNote: "",
      trainingAreaId: "",
      moduleId: "",
      courseIds: [],
      order: 1,
      duration: 30,
      showDuration: true,
      xpPoints: 100,
    },
  });

  // Create unit mutation
  const createMutation = useMutation({
    mutationFn: async (unit: InsertUnit) => {
      const res = await apiRequest("POST", "/api/units", unit);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      form.reset();
      toast({
        title: "Unit created",
        description: "The unit has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create unit",
        variant: "destructive",
      });
    },
  });

  // Update unit mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, unit }: { id: number; unit: Partial<Unit> }) => {
      const res = await apiRequest("PUT", `/api/units/${id}`, unit);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setEditingUnit(null);
      setIsEditModalOpen(false);
      toast({
        title: "Unit updated",
        description: "The unit has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update unit",
        variant: "destructive",
      });
    },
  });

  // Delete unit mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/units/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Unit deleted",
        description: "The unit has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete unit",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: InsertUnit) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, unit: data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Function to handle editing a unit
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditModalOpen(true);
  };

  // Function to handle deleting a unit
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      deleteMutation.mutate(id);
    }
  };

  // Function to find course name by ID
  const getCourseName = (courseId: number) => {
    const course = courses?.find((c) => c.id === courseId);
    return course ? course.name : `Course ${courseId}`;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Units Management
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Add New Unit Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Unit
              </CardTitle>
              <CardDescription>
                Create a new unit and assign it to courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter unit name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Unit description..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainingAreaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Area</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("moduleId", "");
                            form.setValue("courseIds", []);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select training area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {trainingAreas?.map((area) => (
                              <SelectItem key={area.id} value={area.id.toString()}>
                                {area.name}
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
                    name="moduleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("courseIds", []);
                          }}
                          disabled={!form.watch("trainingAreaId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select module" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modules?.filter(m => m.trainingAreaId.toString() === form.watch("trainingAreaId"))?.map((module) => (
                              <SelectItem key={module.id} value={module.id.toString()}>
                                {module.name}
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
                    name="courseIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Courses</FormLabel>
                        <FormDescription>
                          Select one or more courses for this unit
                        </FormDescription>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {courses?.filter(c => c.moduleId.toString() === form.watch("moduleId"))?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No courses available for selected module</p>
                          ) : (
                            courses?.filter(c => c.moduleId.toString() === form.watch("moduleId"))?.map((course) => (
                              <div key={course.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`course-${course.id}`}
                                  checked={field.value?.includes(course.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), course.id.toString()]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter((id) => id !== course.id.toString()) || []
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`course-${course.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {course.name}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="internalNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Note (Admin Only)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Internal notes for administrators..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Order..."
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="xpPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>XP Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="XP Points..."
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Duration..."
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showDuration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Show Duration</FormLabel>
                            <FormDescription>
                              Display duration to users
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Unit"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Right Panel - Units List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter units by training area, module, or course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Training Area</label>
                    <Select
                      value={selectedTrainingAreaId?.toString() || "all"}
                      onValueChange={(value) => {
                        const id = value === "all" ? null : parseInt(value);
                        setSelectedTrainingAreaId(id);
                        setSelectedModuleId(null);
                        setSelectedFilterCourseId(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Training Areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Training Areas</SelectItem>
                        {trainingAreas?.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Module</label>
                    <Select
                      value={selectedModuleId?.toString() || "all"}
                      onValueChange={(value) => {
                        const id = value === "all" ? null : parseInt(value);
                        setSelectedModuleId(id);
                        setSelectedFilterCourseId(null);
                      }}
                      disabled={!selectedTrainingAreaId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {modules?.map((module) => (
                          <SelectItem key={module.id} value={module.id.toString()}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Course</label>
                    <Select
                      value={selectedFilterCourseId?.toString() || "all"}
                      onValueChange={(value) => {
                        const id = value === "all" ? null : parseInt(value);
                        setSelectedFilterCourseId(id);
                      }}
                      disabled={!selectedModuleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search units by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTrainingAreaId(null);
                      setSelectedModuleId(null);
                      setSelectedFilterCourseId(null);
                    }}
                    className="text-sm"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Units List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Existing Units</CardTitle>
                    <CardDescription>
                      Showing {filteredUnits.length} of {allUnits?.length || 0} units
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {unitsLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                ) : filteredUnits && filteredUnits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>XP Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.map((unit) => {
                        return (
                          <TableRow key={unit.id}>
                            <TableCell>
                              <div className="font-medium">{unit.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {unit.description && unit.description.substring(0, 60)}
                                {unit.description && unit.description.length > 60 && "..."}
                              </div>
                            </TableCell>
                            <TableCell>{unit.order}</TableCell>
                            <TableCell>
                              {unit.showDuration ? `${unit.duration} min` : "Hidden"}
                            </TableCell>
                            <TableCell>{unit.xpPoints}</TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <div className="flex justify-end space-x-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(unit)}
                                        disabled={updateMutation.isPending}
                                      >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Unit</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(unit.id)}
                                        disabled={deleteMutation.isPending}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Unit</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No units found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedTrainingAreaId || selectedModuleId || selectedFilterCourseId
                        ? "No units match your current filters"
                        : "Create your first unit to get started"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}