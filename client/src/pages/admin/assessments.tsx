import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Assessment, InsertAssessment, insertAssessmentSchema, Unit, Question, Course, Module, TrainingArea } from "@shared/schema";
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
import { Loader2, Pencil, Plus, Trash, Timer, Award, List } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";

// Form validation schema with all comprehensive fields
const assessmentFormSchema = z.object({
  assessmentFor: z.enum(["course", "unit"], {
    required_error: "Please select if this assessment is for a course or unit.",
  }),
  trainingAreaId: z.coerce.number().optional(),
  moduleId: z.coerce.number().optional(),
  courseId: z.coerce.number().optional(),
  unitId: z.coerce.number().optional(),
  title: z.string().min(2, {
    message: "Assessment title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  placement: z.enum(["beginning", "end"], {
    required_error: "Please select placement.",
  }).default("end"),
  isGraded: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),
  passingScore: z.coerce.number().min(0).max(100).optional(),
  hasTimeLimit: z.boolean().default(false),
  timeLimit: z.coerce.number().min(0).optional(),
  maxRetakes: z.coerce.number().min(0).default(3),
  hasCertificate: z.boolean().default(false),
  certificateTemplate: z.string().optional(),
  xpPoints: z.coerce.number().min(0).default(50),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

export default function AssessmentsManagement() {
  const { toast } = useToast();
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  
  // Form state (separate from display filters)
  const [selectedTrainingAreaId, setSelectedTrainingAreaId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assessmentFor, setAssessmentFor] = useState<"course" | "unit">("unit");
  
  // Display filter state (independent of form)
  const [displayFilter, setDisplayFilter] = useState<"all" | "unit" | "course">("all");
  const [filterUnitId, setFilterUnitId] = useState<number | null>(null);
  const [filterCourseId, setFilterCourseId] = useState<number | null>(null);
  
  // Fetch training areas
  const { data: trainingAreas, isLoading: trainingAreasLoading } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
  });

  // Fetch modules filtered by training area
  const { data: modules, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
    select: (data) => selectedTrainingAreaId 
      ? data.filter(module => module.trainingAreaId === selectedTrainingAreaId)
      : data,
  });

  // Fetch courses filtered by module
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    select: (data) => selectedModuleId 
      ? data.filter(course => course.moduleId === selectedModuleId)
      : data,
  });
  
  // Fetch units for dropdown with cache invalidation to ensure we get the latest data
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/units");
      return await res.json();
    },
    // Add a short staleTime to ensure we get fresh data when the page loads
    staleTime: 0,
    // Force a refetch when the page is focused to get the latest unit names
    refetchOnWindowFocus: true,
  });
  
  // Fetch all assessments (independent of form state)
  const { data: allAssessments, isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/assessments");
      return await res.json();
    },
  });

  // Filter assessments based on display filters
  const filteredAssessments = allAssessments?.filter(assessment => {
    if (displayFilter === "unit") {
      return assessment.unitId && (!filterUnitId || assessment.unitId === filterUnitId);
    } else if (displayFilter === "course") {
      return assessment.courseId && (!filterCourseId || assessment.courseId === filterCourseId);
    }
    return true; // "all" filter
  }) || [];

  // Form setup  
  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      assessmentFor: "unit" as const,
      trainingAreaId: undefined,
      moduleId: undefined,
      courseId: undefined,
      unitId: undefined,
      title: "",
      description: "",
      placement: "end",
      isGraded: true,
      showCorrectAnswers: false,
      passingScore: 70,
      hasTimeLimit: false,
      timeLimit: 30,
      maxRetakes: 3,
      hasCertificate: false,
      certificateTemplate: "",
      xpPoints: 50,
    },
  });

  // Update form when editing an existing assessment
  useEffect(() => {
    if (editingAssessment) {
      const assessmentFor = editingAssessment.courseId ? "course" : "unit";
      setAssessmentFor(assessmentFor);
      
      form.reset({
        assessmentFor,
        trainingAreaId: assessmentFor === "course" && editingAssessment.trainingAreaId ? editingAssessment.trainingAreaId : undefined,
        moduleId: assessmentFor === "course" && editingAssessment.moduleId ? editingAssessment.moduleId : undefined,
        courseId: assessmentFor === "course" && editingAssessment.courseId ? editingAssessment.courseId : undefined,
        unitId: assessmentFor === "unit" && editingAssessment.unitId ? editingAssessment.unitId : undefined,
        title: editingAssessment.title,
        description: editingAssessment.description || "",
        placement: editingAssessment.placement === "beginning" ? "beginning" : "end",
        isGraded: editingAssessment.isGraded ?? true,
        showCorrectAnswers: editingAssessment.showCorrectAnswers ?? false,
        passingScore: editingAssessment.passingScore || undefined,
        hasTimeLimit: editingAssessment.hasTimeLimit ?? false,
        timeLimit: editingAssessment.timeLimit || undefined,
        maxRetakes: editingAssessment.maxRetakes ?? 3,
        hasCertificate: editingAssessment.hasCertificate ?? false,
        certificateTemplate: editingAssessment.certificateTemplate || "",
        xpPoints: editingAssessment.xpPoints,
      });
      
      // Set state for hierarchical dropdowns
      if (assessmentFor === "course") {
        setSelectedTrainingAreaId(editingAssessment.trainingAreaId || null);
        setSelectedModuleId(editingAssessment.moduleId || null);
        setSelectedCourseId(editingAssessment.courseId || null);
      }
    }
  }, [editingAssessment, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertAssessment) => {
      const res = await apiRequest("POST", "/api/assessments", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment created successfully.",
      });
      form.reset({
        assessmentFor: "unit",
        title: "",
        description: "",
        placement: "end",
        isGraded: true,
        passingScore: 70,
        timeLimit: 30,
        xpPoints: 50,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; assessment: Partial<Assessment> }) => {
      const res = await apiRequest("PATCH", `/api/assessments/${data.id}`, data.assessment);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment updated successfully.",
      });
      setEditingAssessment(null);
      form.reset({
        assessmentFor: "unit",
        title: "",
        description: "",
        placement: "end",
        isGraded: true,
        passingScore: 70,
        timeLimit: 30,
        xpPoints: 50,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/assessments/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: AssessmentFormData) => {
    // Transform form data to match the assessment schema
    const assessmentData: InsertAssessment = {
      title: data.title,
      description: data.description,
      placement: data.placement,
      isGraded: data.isGraded,
      showCorrectAnswers: data.showCorrectAnswers,
      passingScore: data.passingScore,
      hasTimeLimit: data.hasTimeLimit,
      timeLimit: data.timeLimit,
      maxRetakes: data.maxRetakes,
      hasCertificate: data.hasCertificate,
      certificateTemplate: data.certificateTemplate,
      xpPoints: data.xpPoints,
      // Set the appropriate ID based on assessment type
      unitId: data.assessmentFor === "unit" ? data.unitId : undefined,
      courseId: data.assessmentFor === "course" ? data.courseId : undefined,
      trainingAreaId: data.assessmentFor === "course" ? data.trainingAreaId : undefined,
      moduleId: data.assessmentFor === "course" ? data.moduleId : undefined,
    };

    if (editingAssessment) {
      updateMutation.mutate({ id: editingAssessment.id, assessment: assessmentData });
    } else {
      createMutation.mutate(assessmentData);
    }
  };

  // Function to handle editing an assessment
  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
  };

  // Function to handle deleting an assessment
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      deleteMutation.mutate(id);
    }
  };

  // Function to handle canceling edit
  const handleCancelEdit = () => {
    setEditingAssessment(null);
    setAssessmentFor("unit");
    setSelectedTrainingAreaId(null);
    setSelectedModuleId(null);
    setSelectedCourseId(null);
    form.reset({
      assessmentFor: "unit",
      trainingAreaId: undefined,
      moduleId: undefined,
      courseId: undefined,
      unitId: undefined,
      title: "",
      description: "",
      placement: "end",
      isGraded: true,
      showCorrectAnswers: false,
      passingScore: 70,
      hasTimeLimit: false,
      timeLimit: 30,
      maxRetakes: 3,
      hasCertificate: false,
      certificateTemplate: "",
      xpPoints: 50,
    });
  };

  // Function to find unit name by ID
  const getUnitName = (unitId: number) => {
    const unit = units?.find((u) => u.id === unitId);
    return unit ? unit.name : `Unit ${unitId}`;
  };

  // Function to navigate to questions management
  const navigateToQuestions = (assessmentId: number) => {
    window.location.href = `/admin/questions?assessmentId=${assessmentId}`;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Assessments Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assessment Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editingAssessment ? "Edit Assessment" : "Add New Assessment"}</CardTitle>
              <CardDescription>
                {editingAssessment
                  ? "Update assessment information"
                  : "Create assessments for units or courses with graded/non-graded options"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Assessment For */}
                  <FormField
                    control={form.control}
                    name="assessmentFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>This Assessment is for</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setAssessmentFor(value as "course" | "unit");
                            // Reset hierarchical selections
                            setSelectedTrainingAreaId(null);
                            setSelectedModuleId(null);
                            setSelectedCourseId(null);

                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assessment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="course">Course</SelectItem>
                            <SelectItem value="unit">Unit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Course-level fields */}
                  {assessmentFor === "course" && (
                    <>
                      {/* Training Area */}
                      <FormField
                        control={form.control}
                        name="trainingAreaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Area</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const areaId = parseInt(value);
                                field.onChange(areaId);
                                setSelectedTrainingAreaId(areaId);
                                setSelectedModuleId(null);
                                setSelectedCourseId(null);
                              }}
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select training area" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {trainingAreasLoading ? (
                                  <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : (
                                  trainingAreas?.map((area) => (
                                    <SelectItem key={area.id} value={area.id.toString()}>
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

                      {/* Module */}
                      <FormField
                        control={form.control}
                        name="moduleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Module</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const moduleId = parseInt(value);
                                field.onChange(moduleId);
                                setSelectedModuleId(moduleId);
                                setSelectedCourseId(null);
                              }}
                              value={field.value?.toString() || ""}
                              disabled={!selectedTrainingAreaId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select module" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {modulesLoading ? (
                                  <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : (
                                  modules?.map((module) => (
                                    <SelectItem key={module.id} value={module.id.toString()}>
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

                      {/* Course */}
                      <FormField
                        control={form.control}
                        name="courseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const courseId = parseInt(value);
                                field.onChange(courseId);
                                setSelectedCourseId(courseId);
                              }}
                              value={field.value?.toString() || ""}
                              disabled={!selectedModuleId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {coursesLoading ? (
                                  <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : (
                                  courses?.map((course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                      {course.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Unit-level field */}
                  {assessmentFor === "unit" && (
                    <FormField
                      control={form.control}
                      name="unitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));

                            }}
                            value={field.value?.toString() || ""}
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
                                units?.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id.toString()}>
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
                  )}

                  {/* Assessment Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assessment Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Final Quiz: Culture of Abu Dhabi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a brief description of the assessment..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Placement */}
                  <FormField
                    control={form.control}
                    name="placement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select placement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginning">At the beginning</SelectItem>
                            <SelectItem value="end">At the end</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Graded Assessment Toggle */}
                  <FormField
                    control={form.control}
                    name="isGraded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">This is a graded Assessment</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Users must achieve passing score" : "Users see correct answers after completion"}
                          </div>
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

                  {/* Passing Score - only show if graded */}
                  {form.watch("isGraded") && (
                    <FormField
                      control={form.control}
                      name="passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Time Limit Toggle */}
                  <FormField
                    control={form.control}
                    name="hasTimeLimit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Time Limit</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Assessment has time limit" : "Unlimited time"}
                          </div>
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

                  {/* Time Limit - only show if enabled */}
                  {form.watch("hasTimeLimit") && (
                    <FormField
                      control={form.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Retakes */}
                  <FormField
                    control={form.control}
                    name="maxRetakes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retakes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Number of times users can retake the assessment to pass
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Certificate Toggle */}
                  <FormField
                    control={form.control}
                    name="hasCertificate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Certificate</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Award certificate upon completion" : "No certificate"}
                          </div>
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

                  {/* Certificate Template - only show if certificate enabled */}
                  {form.watch("hasCertificate") && (
                    <FormField
                      control={form.control}
                      name="certificateTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Template / PDF Link</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Upload template or add PDF certificate link"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* XP Points */}
                  <FormField
                    control={form.control}
                    name="xpPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>XP Points</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    {editingAssessment && (
                      <Button variant="outline" onClick={handleCancelEdit} type="button">
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingAssessment ? "Update Assessment" : "Create Assessment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Existing Assessments</CardTitle>
              <CardDescription>
                Manage all assessments across units and courses
              </CardDescription>
              
              {/* Display Filter Controls (independent of form) */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Filter by Type</label>
                  <Select value={displayFilter} onValueChange={(value: "all" | "unit" | "course") => setDisplayFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assessments</SelectItem>
                      <SelectItem value="unit">Unit Assessments</SelectItem>
                      <SelectItem value="course">Course Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {displayFilter === "unit" && (
                  <div className="flex-1">
                    <label className="text-sm font-medium">Filter by Unit</label>
                    <Select value={filterUnitId?.toString() || ""} onValueChange={(value) => setFilterUnitId(value ? parseInt(value) : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Units</SelectItem>
                        {units?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {displayFilter === "course" && (
                  <div className="flex-1">
                    <label className="text-sm font-medium">Filter by Course</label>
                    <Select value={filterCourseId?.toString() || ""} onValueChange={(value) => setFilterCourseId(value ? parseInt(value) : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Courses</SelectItem>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : filteredAssessments && filteredAssessments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Passing Score</TableHead>
                      <TableHead>Time Limit</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.title}</TableCell>
                        <TableCell>{assessment.passingScore}%</TableCell>
                        <TableCell>{assessment.timeLimit} min</TableCell>
                        <TableCell>{assessment.xpPoints}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToQuestions(assessment.id)}
                              title="Manage Questions"
                            >
                              <List className="h-4 w-4" />
                              <span className="sr-only">Questions</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(assessment)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(assessment.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-abu-charcoal/60">
                  {displayFilter === "all" 
                    ? "No assessments found. Create your first assessment!"
                    : `No ${displayFilter} assessments found with current filters.`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}