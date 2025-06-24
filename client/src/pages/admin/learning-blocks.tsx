import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LearningBlock,
  InsertLearningBlock,
  Unit,
  Course,
  Module,
  TrainingArea,
} from "@shared/schema";
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
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Loader2,
  Pencil,
  Plus,
  Trash,
  Video,
  FileText,
  FileCode,
  Package,
  Upload,
  Image as ImageIcon,
  Search,
  Filter,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminLayout from "@/components/layout/admin-layout";

// Form validation schema
const blockFormSchema = z.object({
  title: z.string().min(2, {
    message: "Block title must be at least 2 characters.",
  }),
  trainingAreaId: z.string({
    required_error: "Training Area is required.",
  }).min(1, "Training Area is required."),
  moduleId: z.string({
    required_error: "Module is required.",
  }).min(1, "Module is required."),
  courseId: z.string({
    required_error: "Course is required.",
  }).min(1, "Course is required."),
  unitId: z.coerce.number({
    required_error: "Unit is required.",
  }),
  type: z.string({
    required_error: "Please select a content type.",
  }),
  order: z.coerce.number().min(1).default(1),
  xpPoints: z.coerce.number().min(0).default(10),
  content: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  interactiveData: z.any().optional(),
  scormPackageId: z.coerce.number().optional().nullable(),
});

export default function LearningBlocksManagement() {
  const { toast } = useToast();
  const [editingBlock, setEditingBlock] = useState<LearningBlock | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainingAreaId, setSelectedTrainingAreaId] =
    useState<string>("all");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedFilterUnitId, setSelectedFilterUnitId] =
    useState<string>("all");

  // Form context states (separate from filter states)
  const [formTrainingAreaId, setFormTrainingAreaId] = useState<string>("");
  const [formModuleId, setFormModuleId] = useState<string>("");
  const [formCourseId, setFormCourseId] = useState<string>("");

  // Fetch all data for filters and dropdowns
  const { data: trainingAreas } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
  });

  const { data: modules } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/units");
      return await res.json();
    },
  });

  // Set the first unit as selected by default if none is selected
  useEffect(() => {
    if (units && units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(units[0].id);
    }
  }, [units, selectedUnitId]);

  // Fetch all learning blocks for filtering
  const { data: allBlocks, isLoading: blocksLoading } = useQuery<
    LearningBlock[]
  >({
    queryKey: ["/api/learning-blocks"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/learning-blocks`);
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

  // Filter blocks based on search and filter criteria with live updates
  const filteredBlocks = allBlocks?.filter((block) => {
    // Search filter
    if (
      searchTerm &&
      !block.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Get unit info for this block
    const unit = units?.find((u) => u.id === block.unitId);
    if (!unit) return false;

    // Apply hierarchical filtering based on current selections
    // Unit filter - direct filter on selected unit
    if (selectedFilterUnitId !== "all") {
      if (unit.id.toString() !== selectedFilterUnitId) {
        return false;
      }
    }

    // Get courses that contain this unit
    const unitCourses = courseUnits?.filter((cu: any) => cu.unitId === unit.id).map((cu: any) => cu.courseId as number) || [];

    // If no courses contain this unit, show it in "all" view only
    if (unitCourses.length === 0) {
      return selectedTrainingAreaId === "all" && selectedModuleId === "all" && selectedCourseId === "all";
    }

    // Course filter - direct filter
    if (selectedCourseId !== "all") {
      return unitCourses.includes(parseInt(selectedCourseId));
    }

    // Module filter - check if unit belongs to any course in the selected module
    if (selectedModuleId !== "all") {
      const moduleCourses = courses?.filter(c => c.moduleId.toString() === selectedModuleId).map(c => c.id) || [];
      return unitCourses.some((courseId: number) => moduleCourses.includes(courseId));
    }

    // Training Area filter - check if unit belongs to any course in modules within the training area
    if (selectedTrainingAreaId !== "all") {
      const trainingAreaModules = modules?.filter(m => m.trainingAreaId.toString() === selectedTrainingAreaId).map(m => m.id) || [];
      const trainingAreaCourses = courses?.filter(c => trainingAreaModules.includes(c.moduleId)).map(c => c.id) || [];
      return unitCourses.some((courseId: number) => trainingAreaCourses.includes(courseId));
    }

    // Unit filter - updates display immediately when selected
    if (
      selectedFilterUnitId !== "all" &&
      block.unitId !== parseInt(selectedFilterUnitId)
    ) {
      return false;
    }

      return true;
    }) || [];

  // Filter dependent dropdowns dynamically for Learning Blocks
  const filteredModulesForBlocks = modules?.filter(module => 
    selectedTrainingAreaId === "all" || module.trainingAreaId.toString() === selectedTrainingAreaId
  ) || [];

  const filteredCoursesForBlocks = courses?.filter(course => 
    selectedModuleId === "all" || course.moduleId.toString() === selectedModuleId
  ) || [];

  const filteredUnitsForBlocks = units?.filter(unit => {
    // Filter units based on selected course - updates display immediately
    if (selectedCourseId !== "all") {
      const unitCourses = courseUnits?.filter((cu: any) => cu.unitId === unit.id).map((cu: any) => cu.courseId as number) || [];
      return unitCourses.includes(parseInt(selectedCourseId));
    }
    return true;
  }) || [];

  // Fetch SCORM packages for dropdown selection
  const { data: scormPackages, isLoading: scormPackagesLoading } = useQuery({
    queryKey: ["/api/scorm-packages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/scorm-packages");
      return await res.json();
    },
  });

  // Form setup
  const form = useForm<InsertLearningBlock>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {
      title: "",
      type: "text",
      order: 1,
      xpPoints: 10,
      content: "",
      videoUrl: "",
      imageUrl: "",
      interactiveData: null,
    },
  });

  // Reset form when editing a block
  useEffect(() => {
    if (editingBlock) {
      form.reset({
        title: editingBlock.title,
        unitId: editingBlock.unitId,
        type: editingBlock.type,
        order: editingBlock.order,
        xpPoints: editingBlock.xpPoints,
        content: editingBlock.content,
        videoUrl: editingBlock.videoUrl,
        imageUrl: editingBlock.imageUrl,
        interactiveData: editingBlock.interactiveData as any,
      });
      setSelectedUnitId(editingBlock.unitId);
    }
  }, [editingBlock, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertLearningBlock) => {
      const res = await apiRequest("POST", "/api/learning-blocks", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Learning block created successfully.",
      });
      form.reset({
        title: "",
        type: "text",
        order: 1,
        xpPoints: 10,
        content: "",
        videoUrl: "",
        imageUrl: "",
        interactiveData: null,
      });
      setEditingBlock(null);
      queryClient.invalidateQueries({ queryKey: ["/api/learning-blocks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create learning block. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; block: Partial<LearningBlock> }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/learning-blocks/${data.id}`,
        data.block,
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Learning block updated successfully.",
      });
      setEditingBlock(null);
      form.reset({
        title: "",
        type: "text",
        order: 1,
        xpPoints: 10,
        content: "",
        videoUrl: "",
        imageUrl: "",
        interactiveData: null,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-blocks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update learning block. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/learning-blocks/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Learning block deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-blocks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete learning block. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Removed custom image upload handler - now using standardized ImageUpload component

  // Form submission handler
  const onSubmit = (data: InsertLearningBlock) => {
    // Create a copy of the data to manipulate
    const submissionData = { ...data };

    // Process interactive data if present
    if (data.type === "interactive" && data.interactiveData) {
      try {
        // If interactiveData is a string, parse it into a JSON object
        if (typeof data.interactiveData === "string") {
          submissionData.interactiveData = JSON.parse(data.interactiveData);
        }
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description:
            "The interactive data is not valid JSON. Please check your syntax.",
          variant: "destructive",
        });
        return; // Exit early if invalid JSON
      }
    }

    if (editingBlock) {
      updateMutation.mutate({ id: editingBlock.id, block: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };

  // Function to handle editing a block
  const handleEdit = (block: LearningBlock) => {
    setEditingBlock(block);
  };

  // Function to handle deleting a block
  const handleDelete = (id: number) => {
    if (
      window.confirm("Are you sure you want to delete this learning block?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Function to handle canceling edit - properly reset form to initial empty state
  const handleCancelEdit = () => {
    setEditingBlock(null);
    form.reset({
      title: "",
      type: "text",
      order: 1,
      xpPoints: 10,
      content: "",
      videoUrl: "",
      imageUrl: "",
      interactiveData: null,
    });
  };

  // Function to find unit name by ID
  const getUnitName = (unitId: number) => {
    const unit = units?.find((u) => u.id === unitId);
    return unit ? unit.name : `Unit ${unitId}`;
  };

  // Get icon for block type
  const getBlockTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "interactive":
        return <FileCode className="h-4 w-4" />;
      case "scorm":
        return <Package className="h-4 w-4" />;
      case "text":
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Learning Blocks Management
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Block Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>
                {editingBlock
                  ? "Edit Learning Block"
                  : "Add New Learning Block"}
              </CardTitle>
              <CardDescription>
                {editingBlock
                  ? "Update learning block information"
                  : "Create learning content blocks for units"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Introduction to Abu Dhabi"
                            {...field}
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
                        <FormLabel>Training Area <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("moduleId", "");
                            form.setValue("courseId", "");
                            form.setValue("unitId", "");
                          }}
                          value={field.value}
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
                        <FormLabel>Module <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("courseId", "");
                            form.setValue("unitId", "");
                          }}
                          value={field.value}
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
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("unitId", "");
                          }}
                          value={field.value}
                          disabled={!form.watch("moduleId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses?.filter(c => c.moduleId.toString() === form.watch("moduleId"))?.map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.name}
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
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                          }}
                          value={field.value?.toString() || ""}
                          disabled={!form.watch("courseId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitsLoading ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              units?.filter(unit => {
                                // Filter units based on selected course
                                if (form.watch("courseId")) {
                                  const unitCourses = courseUnits?.filter((cu: any) => cu.unitId === unit.id).map((cu: any) => cu.courseId.toString()) || [];
                                  return unitCourses.includes(form.watch("courseId"));
                                }
                                return false;
                              })?.map((unit) => (
                                <SelectItem
                                  key={unit.id}
                                  value={unit.id.toString()}
                                >
                                  {unit.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="interactive">
                              Interactive
                            </SelectItem>
                            <SelectItem value="scorm">SCORM Package</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
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
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("type") === "text" && (
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the learning content text here..."
                              className="min-h-[150px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "video" && (
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. https://www.youtube.com/watch?v=..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "image" && (
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Upload</FormLabel>
                          <FormControl>
                            <div className="w-full">
                              <ImageUpload
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Upload an image for this learning block"
                              />
                              {field.value && (
                                <div className="mt-2 p-2 border rounded-md bg-gray-50">
                                  <img
                                    src={field.value}
                                    alt="Preview"
                                    className="max-w-full h-32 object-contain rounded"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "interactive" && (
                    <FormField
                      control={form.control}
                      name="interactiveData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Interactive Content JSON Configuration
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='{
  "type": "quiz",
  "title": "Interactive Quiz Example",
  "questions": [
    {
      "question": "What is the capital of the UAE?",
      "options": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
      "correctAnswer": 1
    }
  ]
}'
                              className="min-h-[250px] font-mono text-sm"
                              {...field}
                              value={
                                field.value
                                  ? typeof field.value === "string"
                                    ? field.value
                                    : JSON.stringify(field.value, null, 2)
                                  : ""
                              }
                              onChange={(e) => {
                                try {
                                  // Try to parse as JSON to validate, but keep as string in the form
                                  JSON.parse(e.target.value);
                                  field.onChange(e.target.value);
                                } catch (err) {
                                  // Still update the field even if invalid JSON
                                  field.onChange(e.target.value);
                                }
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground mt-2">
                            <p>
                              Enter valid JSON configuration for the interactive
                              element.
                            </p>
                            <p>
                              The JSON structure will vary based on the type of
                              interactive content (quizzes, flashcards, etc).
                            </p>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "scorm" && (
                    <FormField
                      control={form.control}
                      name="scormPackageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SCORM Package</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value?.toString()}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a SCORM package" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {scormPackagesLoading ? (
                                <div className="flex justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : scormPackages && scormPackages.length > 0 ? (
                                scormPackages.map(
                                  (pkg: { id: number; title: string }) => (
                                    <SelectItem
                                      key={pkg.id}
                                      value={pkg.id.toString()}
                                    >
                                      {pkg.title}
                                    </SelectItem>
                                  ),
                                )
                              ) : (
                                <div className="p-2 text-xs text-muted-foreground">
                                  No SCORM packages available. Upload one first.
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-muted-foreground mt-2">
                            <p>
                              Select a SCORM package to embed in this learning
                              block.
                            </p>
                            <p>
                              If no packages are available, go to the SCORM
                              Management page to upload one first.
                            </p>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    {editingBlock && (
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        type="button"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                    >
                      {(createMutation.isPending ||
                        updateMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingBlock ? "Update Block" : "Create Block"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Learning Blocks List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle>Existing Learning Blocks</CardTitle>
                  <CardDescription>
                    Manage your Existing Learning Blocks
                  </CardDescription>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blocks by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Hierarchical Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Training Area Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Training Area
                    </label>
                    <Select
                      value={selectedTrainingAreaId}
                      onValueChange={setSelectedTrainingAreaId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        {trainingAreas?.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Module
                    </label>
                    <Select
                      value={selectedModuleId}
                      onValueChange={setSelectedModuleId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {modules
                          ?.filter(
                            (module) =>
                              selectedTrainingAreaId === "all" ||
                              module.trainingAreaId ===
                                parseInt(selectedTrainingAreaId),
                          )
                          .map((module) => (
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

                  {/* Course Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Course
                    </label>
                    <Select
                      value={selectedCourseId}
                      onValueChange={setSelectedCourseId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses
                          ?.filter(
                            (course) =>
                              selectedModuleId === "all"                              ||
                              course.moduleId === parseInt(selectedModuleId),
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

                  {/* Unit Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Unit
                    </label>
                    <Select
                      value={selectedFilterUnitId}
                      onValueChange={setSelectedFilterUnitId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        {units?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-gray-600">
                  Showing {filteredBlocks.length} of {allBlocks?.length || 0}{" "}
                  learning blocks
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {blocksLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : filteredBlocks && filteredBlocks.length > 0 ? (
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlocks.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell>{block.order}</TableCell>
                          <TableCell>
                            <div className="font-medium">{block.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {getUnitName(block.unitId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getBlockTypeIcon(block.type)}
                              <span className="capitalize">{block.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{block.xpPoints}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(block)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit learning block</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(block.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete learning block</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  {searchTerm ||
                  selectedTrainingAreaId !== "all" ||
                  selectedModuleId !== "all" ||
                  selectedCourseId !== "all" ||
                  selectedFilterUnitId !== "all"
                    ? "No learning blocks match your current filters. Try adjusting your search criteria."
                    : "No learning blocks found. Create your first block using the form on the left!"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}