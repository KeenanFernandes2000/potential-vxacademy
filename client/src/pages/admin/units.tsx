import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Course, Unit, TrainingArea, Module } from "@shared/schema";

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
  Loader2,
  Pencil,
  Trash,
  School,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  trainingAreaId: z
    .string({
      required_error: "Training Area is required.",
    })
    .min(1, "Training Area is required."),
  moduleId: z
    .string({
      required_error: "Module is required.",
    })
    .min(1, "Module is required."),
  courseIds: z
    .array(z.string())
    .min(1, "At least one course must be selected."),
  order: z.coerce.number().min(1).default(1),
  duration: z.coerce
    .number({
      required_error: "Duration is required.",
      invalid_type_error: "Duration must be a number.",
    })
    .min(1, {
      message: "Duration must be at least 1 minute.",
    })
    .default(30),
  showDuration: z.boolean().default(true),
  xpPoints: z.coerce.number().min(0).default(100),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

export default function UnitsManagement() {
  const [location, setLocation] = useLocation();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Remove modal state - we'll use inline editing like courses page

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainingAreaId, setSelectedTrainingAreaId] = useState("all");
  const [selectedModuleId, setSelectedModuleId] = useState("all");
  const [selectedFilterCourseId, setSelectedFilterCourseId] = useState("all");

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

  // Fetch ALL modules (no longer filtered by training area server-side)
  const { data: allModules } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/modules");
      return await res.json();
    },
  });

  // Filter modules based on selected training area for filtering display
  const modules = allModules?.filter(
    (module) =>
      selectedTrainingAreaId === "all" ||
      module.trainingAreaId.toString() === selectedTrainingAreaId
  );

  // Fetch ALL courses (no longer filtered by module server-side)
  const { data: allCourses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/courses");
      return await res.json();
    },
  });

  // Filter courses based on selected module for filtering display
  const courses = allCourses?.filter(
    (course) =>
      selectedModuleId === "all" ||
      course.moduleId.toString() === selectedModuleId
  );

  // Fetch all units
  const { data: allUnits, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/units");
      return await res.json();
    },
  });

  // Fetch course-unit relationships for proper filtering
  const { data: courseUnits } = useQuery({
    queryKey: ["/api/course-units"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/course-units");
      return await res.json();
    },
  });

  // Filter units based on search and hierarchical filters
  const filteredUnits =
    allUnits?.filter((unit) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Get courses that contain this unit
      const unitCourses =
        courseUnits
          ?.filter((cu: any) => cu.unitId === unit.id)
          .map((cu: any) => cu.courseId as number) || [];

      // If no courses contain this unit, show it in "all" view only
      if (unitCourses.length === 0) {
        return (
          selectedTrainingAreaId === "all" &&
          selectedModuleId === "all" &&
          selectedFilterCourseId === "all"
        );
      }

      // Course filter - direct filter
      if (selectedFilterCourseId !== "all") {
        return unitCourses.includes(parseInt(selectedFilterCourseId));
      }

      // Module filter - check if unit belongs to any course in the selected module
      if (selectedModuleId !== "all") {
        const moduleCourses =
          allCourses
            ?.filter((c) => c.moduleId.toString() === selectedModuleId)
            .map((c) => c.id) || [];
        return unitCourses.some((courseId: number) =>
          moduleCourses.includes(courseId)
        );
      }

      // Training Area filter - check if unit belongs to any course in modules within the training area
      if (selectedTrainingAreaId !== "all") {
        const trainingAreaModules =
          allModules
            ?.filter(
              (m) => m.trainingAreaId.toString() === selectedTrainingAreaId
            )
            .map((m) => m.id) || [];
        const trainingAreaCourses =
          allCourses
            ?.filter((c) => trainingAreaModules.includes(c.moduleId))
            .map((c) => c.id) || [];
        return unitCourses.some((courseId: number) =>
          trainingAreaCourses.includes(courseId)
        );
      }

      return true;
    }) || [];

  // Units for the selected course (for form dropdown)
  const units = allUnits || [];

  // Calculate next available order
  const getNextOrder = () => {
    if (!allUnits || allUnits.length === 0) return 1;
    const maxOrder = Math.max(...allUnits.map((unit) => unit.order));
    return maxOrder + 1;
  };

  // Enhanced form validation schema with module existence check
  const enhancedUnitFormSchema = unitFormSchema.refine(
    (data) => {
      if (!data.moduleId || !allModules) return true;
      const moduleExists = allModules.some(
        (module) =>
          module.id.toString() === data.moduleId &&
          module.trainingAreaId.toString() === data.trainingAreaId
      );
      return moduleExists;
    },
    {
      message: "Selected module does not exist in the chosen training area",
      path: ["moduleId"],
    }
  );

  // Form setup with enhanced validation
  const form = useForm<UnitFormData>({
    resolver: zodResolver(enhancedUnitFormSchema),
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

  // Update order when units data changes (for new units)
  useEffect(() => {
    if (!editingUnit && allUnits) {
      form.setValue("order", getNextOrder());
    }
  }, [allUnits, editingUnit]);

  // Create unit mutation
  const createMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const res = await apiRequest("POST", "/api/units", unitData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/course-units"] });
      form.reset({
        name: "",
        description: "",
        internalNote: "",
        trainingAreaId: "",
        moduleId: "",
        courseIds: [],
        order: getNextOrder() + 1, // Next order after the one just created
        duration: 30,
        showDuration: true,
        xpPoints: 100,
      });
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
    mutationFn: async ({
      id,
      unit,
      courseIds,
    }: {
      id: number;
      unit: any;
      courseIds?: string[];
    }) => {
      const payload = { ...unit, courseIds };
      const res = await apiRequest("PATCH", `/api/units/${id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/course-units"] });
      setEditingUnit(null);
      form.reset({
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
      });
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
      await apiRequest("DELETE", `/api/units/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/course-units"] });
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

  // Validate unique order on submission
  const validateUniqueOrder = async (order: number) => {
    try {
      const response = await apiRequest("POST", "/api/validate/unit-order", {
        order,
        excludeId: editingUnit?.id,
      });
      const { isUnique } = await response.json();
      return isUnique;
    } catch {
      return true; // Allow if validation fails
    }
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    // Additional validation: Check if module exists and belongs to training area
    if (!allModules) {
      toast({
        title: "Error",
        description: "Modules data not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const selectedModule = allModules.find(
      (module) => module.id.toString() === data.moduleId
    );
    if (!selectedModule) {
      toast({
        title: "Error",
        description: "Selected module does not exist.",
        variant: "destructive",
      });
      return;
    }

    if (selectedModule.trainingAreaId.toString() !== data.trainingAreaId) {
      toast({
        title: "Error",
        description:
          "Selected module does not belong to the chosen training area.",
        variant: "destructive",
      });
      return;
    }

    // Validate unique order
    const isOrderUnique = await validateUniqueOrder(data.order);
    if (!isOrderUnique) {
      form.setError("order", { message: "Order number must be unique." });
      return;
    }

    // Transform form data to proper unit data
    const unitData = {
      name: data.name,
      description: data.description || null,
      internalNote: data.internalNote || null,
      order: data.order,
      duration: data.duration,
      showDuration: data.showDuration,
      xpPoints: data.xpPoints,
    };

    if (editingUnit) {
      updateMutation.mutate({
        id: editingUnit.id,
        unit: unitData,
        courseIds: data.courseIds
          ? data.courseIds.map((id: string) => parseInt(id))
          : [],
      });
    } else {
      createMutation.mutate({
        ...unitData,
        courseIds: data.courseIds
          ? data.courseIds.map((id: string) => parseInt(id))
          : [],
      });
    }
  };

  // Function to handle editing a unit (inline editing like courses page)
  const handleEdit = (unit: Unit) => {
    // Simulate double-click to work around timing issues
    const performEdit = () => {
      setEditingUnit(unit);

      // Get courses associated with this unit
      const unitCourseIds =
        courseUnits
          ?.filter((cu: any) => cu.unitId === unit.id)
          .map((cu: any) => cu.courseId.toString()) || [];

      // Find the training area and module for this unit's courses
      const firstCourse = allCourses?.find((c) =>
        unitCourseIds.includes(c.id.toString())
      );
      const trainingAreaId = firstCourse?.trainingAreaId?.toString() || "";
      const moduleId = firstCourse?.moduleId?.toString() || "";

      // Populate the form with unit data
      form.reset({
        name: unit.name,
        description: unit.description || "",
        internalNote: unit.internalNote || "",
        trainingAreaId: trainingAreaId,
        moduleId: moduleId,
        courseIds: unitCourseIds,
        order: unit.order,
        duration: unit.duration,
        showDuration: unit.showDuration,
        xpPoints: unit.xpPoints,
      });
    };

    // First click
    performEdit();

    // Second click after a small delay to ensure everything loads properly
    setTimeout(() => {
      performEdit();
    }, 100);
  };

  // Function to handle canceling edit
  const handleCancel = () => {
    setEditingUnit(null);
    form.reset({
      name: "",
      description: "",
      duration: 30,
      showDuration: true,
      xpPoints: 100,
      courseIds: [],
    });
    form.clearErrors();
  };

  // Function to handle deleting a unit
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      deleteMutation.mutate(id);
    }
  };

  // Function to find course name by ID
  const getCourseName = (courseId: number) => {
    const course = allCourses?.find((c) => c.id === courseId);
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
                {editingUnit ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Edit Unit
                  </>
                ) : (
                  <>Add New Unit</>
                )}
              </CardTitle>
              <CardDescription>
                {editingUnit
                  ? "Update the unit information and course assignments"
                  : "Create a new unit and assign it to courses"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* 1. Training Area */}
                  <FormField
                    control={form.control}
                    name="trainingAreaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Training Area <span className="text-red-500">*</span>
                        </FormLabel>
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
                              <SelectItem
                                key={area.id}
                                value={area.id.toString()}
                              >
                                {area.name}
                              </SelectItem>
                            ))}
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
                        <FormLabel>
                          Module <span className="text-red-500">*</span>
                        </FormLabel>
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
                            {allModules
                              ?.filter(
                                (m) =>
                                  m.trainingAreaId.toString() ===
                                  form.watch("trainingAreaId")
                              )
                              ?.map((module) => (
                                <SelectItem
                                  key={module.id}
                                  value={module.id.toString()}
                                >
                                  {module.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 3. Courses (Multi-select) */}
                  <FormField
                    control={form.control}
                    name="courseIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Courses <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormDescription>
                          Select one or more courses for this unit
                        </FormDescription>

                        {/* Selected Courses Display */}
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border">
                            {field.value.map((courseId) => {
                              const course = allCourses?.find(
                                (c) => c.id.toString() === courseId
                              );
                              return course ? (
                                <Badge
                                  key={courseId}
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1"
                                >
                                  {course.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentValue = field.value ?? [];
                                      field.onChange(
                                        currentValue.filter(
                                          (id) => id !== courseId
                                        )
                                      );
                                    }}
                                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Available Courses Selection */}
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {allCourses?.filter(
                            (c) =>
                              c.moduleId.toString() === form.watch("moduleId")
                          )?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No courses available for selected module
                            </p>
                          ) : (
                            allCourses
                              ?.filter(
                                (c) =>
                                  c.moduleId.toString() ===
                                  form.watch("moduleId")
                              )
                              ?.map((course) => (
                                <div
                                  key={course.id}
                                  className="flex items-center space-x-2 hover:bg-muted/30 p-2 rounded"
                                >
                                  <Checkbox
                                    id={`course-${course.id}`}
                                    checked={
                                      field.value?.includes(
                                        course.id.toString()
                                      ) ?? false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value ?? [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValue,
                                          course.id.toString(),
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (id) => id !== course.id.toString()
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`course-${course.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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

                  {/* 4. Unit Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Unit Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter unit name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 5. Unit Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Description</FormLabel>
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

                  {/* 6. Internal Note */}
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

                  {/* 7. Display Order */}
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Order..."
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                            readOnly={!editingUnit}
                            className={!editingUnit ? "bg-muted" : ""}
                          />
                        </FormControl>
                        {!editingUnit && (
                          <FormDescription>
                            Auto-assigned next available order
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 8. Duration (minutes) */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Duration (minutes){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration Visibility Toggle */}
                  <FormField
                    control={form.control}
                    name="showDuration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">
                            Show duration to users
                          </FormLabel>
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

                  {/* 9. XP Points */}
                  <FormField
                    control={form.control}
                    name="xpPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          XP Points <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 100"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 100)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    {editingUnit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingUnit ? (
                        updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Unit"
                        )
                      ) : createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Unit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Right Panel - Units List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Existing Units
                </CardTitle>
                <CardDescription>
                  Manage and view all existing units.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Training Area
                    </label>
                    <Select
                      value={selectedTrainingAreaId}
                      onValueChange={(value) => {
                        setSelectedTrainingAreaId(value);
                        setSelectedModuleId("all");
                        setSelectedFilterCourseId("all");
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
                    <label className="text-sm font-medium mb-2 block">
                      Module
                    </label>
                    <Select
                      value={selectedModuleId}
                      onValueChange={(value) => {
                        setSelectedModuleId(value);
                        setSelectedFilterCourseId("all");
                      }}
                      disabled={selectedTrainingAreaId === "all"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {modules?.map((module) => (
                          <SelectItem
                            key={module.id}
                            value={module.id.toString()}
                          >
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Course
                    </label>
                    <Select
                      value={selectedFilterCourseId}
                      onValueChange={(value) => {
                        setSelectedFilterCourseId(value);
                      }}
                      disabled={selectedModuleId === "all"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses
                          ?.filter(
                            (course) =>
                              selectedModuleId === "all" ||
                              course.moduleId.toString() === selectedModuleId
                          )
                          .map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">
                    Search
                  </label>
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

                {/* Results Count and Clear Filters */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredUnits.length} of {allUnits?.length || 0}{" "}
                    units
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTrainingAreaId("all");
                      setSelectedModuleId("all");
                      setSelectedFilterCourseId("all");
                    }}
                    className="text-sm"
                  >
                    Clear All Filters
                  </Button>
                </div>

                {/* Units Table */}
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
                                {unit.description &&
                                  unit.description.substring(0, 60)}
                                {unit.description &&
                                  unit.description.length > 60 &&
                                  "..."}
                              </div>
                            </TableCell>
                            <TableCell>{unit.order}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{unit.duration} min</span>
                                {unit.showDuration ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
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
                      {searchTerm ||
                      selectedTrainingAreaId ||
                      selectedModuleId ||
                      selectedFilterCourseId
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
