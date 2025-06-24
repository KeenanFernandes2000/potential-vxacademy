import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Course, InsertCourse, Module, TrainingArea } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// UI Components
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Pencil, Plus, Trash, Copy, Search, Filter, X, Image } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminLayout from "@/components/layout/admin-layout";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiSelect } from "@/components/ui/multi-select";

// Form validation schema
const courseFormSchema = z.object({
  trainingAreaId: z.coerce.number({
    required_error: "Training area is required.",
  }),
  moduleId: z.coerce.number({
    required_error: "Module is required.",
  }),
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  internalNote: z.string().optional(),
  courseType: z.enum(["sequential", "free"], {
    required_error: "Please select a course type.",
  }).default("sequential"),
  duration: z.coerce.number({
    required_error: "Please specify the duration in minutes.",
    invalid_type_error: "Duration must be a number.",
  }),
  showDuration: z.boolean().default(true),
  level: z.string({
    required_error: "Please select a difficulty level.",
  }),
  showLevel: z.boolean().default(true),
});

export default function CourseManagement() {
  const { toast } = useToast();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedTrainingAreaId, setSelectedTrainingAreaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrainingAreaId, setFilterTrainingAreaId] = useState<number | null>(null);
  const [filterModuleId, setFilterModuleId] = useState<number | null>(null);

  // Fetch training areas for dropdown
  const { data: trainingAreas, isLoading: areasLoading } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/training-areas");
      return await res.json();
    },
  });

  // Fetch modules for dropdown (filtered by training area)
  const { data: modules, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules", selectedTrainingAreaId],
    queryFn: async () => {
      const url = selectedTrainingAreaId 
        ? `/api/modules?trainingAreaId=${selectedTrainingAreaId}`
        : "/api/modules";
      const res = await apiRequest("GET", url);
      return await res.json();
    },
  });

  // Fetch existing courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/courses");
      return await res.json();
    },
  });

  // Fetch modules for filtering (filtered by selected training area)
  const { data: filterModulesList } = useQuery<Module[]>({
    queryKey: ["/api/modules", "filter", filterTrainingAreaId],
    queryFn: async () => {
      if (!filterTrainingAreaId) return [];
      const res = await apiRequest("GET", `/api/modules?trainingAreaId=${filterTrainingAreaId}`);
      return await res.json();
    },
    enabled: !!filterTrainingAreaId,
  });

  // Filter courses based on search and filters
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrainingArea = !filterTrainingAreaId || course.trainingAreaId === filterTrainingAreaId;
    const matchesModule = !filterModuleId || course.moduleId === filterModuleId;
    return matchesSearch && matchesTrainingArea && matchesModule;
  });

  // Form setup
  const form = useForm<InsertCourse>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      trainingAreaId: undefined,
      moduleId: undefined,
      name: "",
      description: "",
      imageUrl: "",
      internalNote: "",
      courseType: "sequential",
      duration: 0,
      showDuration: true,
      level: "beginner",
      showLevel: true,
    },
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
      form.reset({
        trainingAreaId: undefined,
        moduleId: undefined,
        name: "",
        description: "",
        imageUrl: "",
        internalNote: "",
        courseType: "sequential",
        duration: 0,
        showDuration: true,
        level: "beginner",
        showLevel: true,
      });
      form.clearErrors();
      setSelectedTrainingAreaId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Course> }) => {
      const res = await apiRequest("PATCH", `/api/courses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
      setEditingCourse(null);
      form.reset({
        trainingAreaId: undefined,
        moduleId: undefined,
        name: "",
        description: "",
        imageUrl: "",
        internalNote: "",
        courseType: "sequential",
        duration: 0,
        showDuration: true,
        level: "beginner",
        showLevel: true,
      });
      form.clearErrors();
      setSelectedTrainingAreaId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(values: InsertCourse) {
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  // Set form values when editing
  function handleEdit(course: Course) {
    setEditingCourse(course);
    setSelectedTrainingAreaId(course.trainingAreaId);
    form.reset({
      trainingAreaId: course.trainingAreaId,
      moduleId: course.moduleId,
      name: course.name,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      internalNote: course.internalNote || "",
      courseType: course.courseType === "free" ? "free" : "sequential",
      duration: course.duration,
      showDuration: course.showDuration ?? true,
      level: course.level,
      showLevel: course.showLevel ?? true,
    });
  }

  function handleCancel() {
    setEditingCourse(null);
    setSelectedTrainingAreaId(null);
    form.reset({
      trainingAreaId: undefined,
      moduleId: undefined,
      name: "",
      description: "",
      imageUrl: "",
      internalNote: "",
      courseType: "sequential",
      duration: 0,
      showDuration: true,
      level: "beginner",
      showLevel: true,
    });
    // Clear any form errors
    form.clearErrors();
  }

  function handleDuplicate(course: Course) {
    setEditingCourse(null);
    setSelectedTrainingAreaId(course.trainingAreaId);
    form.reset({
      trainingAreaId: course.trainingAreaId,
      moduleId: course.moduleId,
      name: `${course.name} (Copy)`,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      internalNote: course.internalNote || "",
      courseType: course.courseType === "free" ? "free" : "sequential",
      duration: course.duration,
      showDuration: course.showDuration ?? true,
      level: course.level,
      showLevel: course.showLevel ?? true,
    });
  }

  const isSubmitting = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isLoading = modulesLoading || coursesLoading;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Course Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editingCourse ? "Edit Course" : "Add New Course"}</CardTitle>
              <CardDescription>
                {editingCourse
                  ? "Update the course information"
                  : "Create a new course for the VX Academy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* 1. Training Area */}
                  <FormField
                    control={form.control}
                    name="trainingAreaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Area <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const id = parseInt(value);
                            field.onChange(id);
                            setSelectedTrainingAreaId(id);
                            form.resetField("moduleId");
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a training area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areasLoading ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                              </div>
                            ) : (
                              trainingAreas?.map((area) => (
                                <SelectItem
                                  key={area.id}
                                  value={area.id.toString()}
                                >
                                  {area.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 2. Module */}
                  <FormField
                    control={form.control}
                    name="moduleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          disabled={!selectedTrainingAreaId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedTrainingAreaId ? "Select a module" : "Select training area first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modulesLoading ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                              </div>
                            ) : (
                              modules?.filter(module => module.trainingAreaId === selectedTrainingAreaId)
                                .map((module) => (
                                <SelectItem
                                  key={module.id}
                                  value={module.id.toString()}
                                >
                                  {module.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 3. Course Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cultural Heritage of Abu Dhabi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 4. Course Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Course description..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 5. Image Upload */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            label="Course Image"
                            placeholder="Upload image or enter URL..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Preview */}
                  {form.watch("imageUrl") && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Image className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 flex-1 truncate">
                          {form.watch("imageUrl").split('/').pop() || 'Image file'}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                          onClick={() => form.setValue("imageUrl", "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 6. Internal Note (admin-only) */}
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

                  {/* 7. Course Type */}
                  <FormField
                    control={form.control}
                    name="courseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Sequential:</strong> Learners must complete units and learning blocks in order (can't access Unit 2 before Unit 1)<br/>
                          <strong>Free:</strong> Learners can access any unit at any time
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 8. Duration (minutes) with visibility toggle */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 60"
                              {...field} 
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Show duration to users</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 9. Difficulty Level with visibility toggle */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="showLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Show difficulty level to users</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    {editingCourse && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingCourse ? "Update Course" : "Create Course"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Course List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle>Existing Courses</CardTitle>
                  <CardDescription>Manage your existing courses</CardDescription>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Training Area Filter */}
                  <Select
                    value={filterTrainingAreaId?.toString() || "all"}
                    onValueChange={(value) => {
                      const areaId = value === "all" ? null : parseInt(value);
                      setFilterTrainingAreaId(areaId);
                      setFilterModuleId(null); // Reset module filter
                    }}
                  >
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by Training Area" />
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

                  {/* Module Filter */}
                  <Select
                    value={filterModuleId?.toString() || "all"}
                    onValueChange={(value) => {
                      const moduleId = value === "all" ? null : parseInt(value);
                      setFilterModuleId(moduleId);
                    }}
                    disabled={!filterTrainingAreaId}
                  >
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {filterModulesList?.map((module) => (
                        <SelectItem key={module.id} value={module.id.toString()}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : filteredCourses && filteredCourses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Training Area</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Internal Note</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => {
                        const trainingArea = trainingAreas?.find(area => area.id === course.trainingAreaId);
                        const module = modules?.find(mod => mod.id === course.moduleId);
                        return (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>{trainingArea?.name || 'N/A'}</TableCell>
                            <TableCell>{module?.name || 'N/A'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                              {course.internalNote || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <div className="flex justify-end space-x-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(course)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Course</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDuplicate(course)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Duplicate Course</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to delete this course?")) {
                                            deleteMutation.mutate(course.id);
                                          }
                                        }}
                                      >
                                        <Trash className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Course</p>
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
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No courses found. Create your first course to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}