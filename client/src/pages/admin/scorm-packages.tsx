
import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, RefreshCcw, Info, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef } from "react";

interface ScormPackage {
  id: number;
  title: string;
  description: string;
  version: string;
  entryPoint: string;
  createdAt: string;
}

const scormUploadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  scormPackage: z.any()
});

export default function ScormPackagesPage() {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof scormUploadSchema>>({
    resolver: zodResolver(scormUploadSchema),
    defaultValues: {
      title: "",
      description: ""
    },
  });

  const { data: scormPackages, isLoading, refetch } = useQuery<ScormPackage[]>({
    queryKey: ["/api/scorm-packages"],
    queryFn: async () => {
      const response = await fetch("/api/scorm-packages");
      if (!response.ok) {
        throw new Error("Failed to fetch SCORM packages");
      }
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/scorm-packages/upload", data, null, null, true);
    },
    onSuccess: () => {
      toast({
        title: "SCORM Package Uploaded",
        description: "The SCORM package has been successfully uploaded.",
        duration: 3000,
      });
      setIsUploadDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/scorm-packages"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload SCORM package",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isUploadDialogOpen) {
      form.reset();
    }
  }, [isUploadDialogOpen, form]);

  const onSubmit = (values: z.infer<typeof scormUploadSchema>) => {
    const formData = new FormData();

    // Add optional title and description
    if (values.title) {
      formData.append("title", values.title);
    }

    if (values.description) {
      formData.append("description", values.description);
    }

    // Add the file
    if (fileInputRef.current?.files?.[0]) {
      formData.append("scormPackage", fileInputRef.current.files[0]);
      uploadMutation.mutate(formData);
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a SCORM package file (ZIP format) to upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            SCORM Packages
          </h1>
          <p className="text-slate-600">Manage SCORM compliant learning content</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg">
                <Upload className="h-4 w-4 mr-2" />
                Upload SCORM Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-slate-800">Upload SCORM Package</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Upload a SCORM compliant package (.zip file) to add interactive learning content.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Title (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Package title" {...field} className="border-slate-200 focus:border-teal-500" />
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
                        <FormLabel className="text-slate-700">Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description" {...field} className="border-slate-200 focus:border-teal-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="text-slate-700">SCORM Package (ZIP file)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept=".zip" 
                        ref={fileInputRef}
                        className="border-slate-200 focus:border-teal-500"
                        onChange={(e) => {
                          // If the package has a title that's automatically extracted from the zip,
                          // the optional title field will be overridden
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <div className="p-4 bg-amber-50/80 backdrop-blur-sm text-amber-800 rounded-xl border border-amber-200/50 text-sm flex items-start gap-3 mt-4">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Important Notes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>The package must be a valid SCORM 1.2 or 2004 compliant ZIP file</li>
                        <li>The ZIP must contain an 'imsmanifest.xml' file in its root</li>
                        <li>Maximum file size: 50MB</li>
                      </ul>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>Upload Package</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          </div>
        ) : scormPackages && scormPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scormPackages.map((pkg) => (
              <Card key={pkg.id} className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm border-b border-slate-200/50">
                  <CardTitle className="line-clamp-1 text-slate-800">{pkg.title}</CardTitle>
                  <CardDescription className="text-slate-600">Version: {pkg.version}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {pkg.description || "No description available"}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">
                      Entry point: {pkg.entryPoint || "index.html"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    onClick={() => {
                      toast({
                        title: "Preview Feature",
                        description: "SCORM package preview will be available soon.",
                      });
                    }}
                  >
                    Preview Package
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-lg">
                <FileText className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No SCORM packages available</h3>
              <p className="text-slate-600 mb-6 max-w-md">
                Upload SCORM packages to create interactive learning experiences for your courses.
              </p>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-slate-800">Upload SCORM Package</DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Upload a SCORM compliant package (.zip file) to add interactive learning content.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">Title (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Package title" {...field} className="border-slate-200 focus:border-teal-500" />
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
                            <FormLabel className="text-slate-700">Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description" {...field} className="border-slate-200 focus:border-teal-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem>
                        <FormLabel className="text-slate-700">SCORM Package (ZIP file)</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept=".zip" 
                            ref={fileInputRef}
                            className="border-slate-200 focus:border-teal-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>

                      <div className="p-4 bg-amber-50/80 backdrop-blur-sm text-amber-800 rounded-xl border border-amber-200/50 text-sm flex items-start gap-3 mt-4">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Important Notes:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>The package must be a valid SCORM 1.2 or 2004 compliant ZIP file</li>
                            <li>The ZIP must contain an 'imsmanifest.xml' file in its root</li>
                            <li>Maximum file size: 50MB</li>
                          </ul>
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUploadDialogOpen(false)}
                          className="border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
                          disabled={uploadMutation.isPending}
                        >
                          {uploadMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>Upload Package</>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
