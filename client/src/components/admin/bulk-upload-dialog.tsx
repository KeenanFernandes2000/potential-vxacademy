import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Simplified form schema for bulk upload - only file upload needed
const bulkUploadSchema = z.object({
  file: z.any().refine((file) => file && file.length > 0, "Please select an Excel file to upload"),
});

type BulkUploadFormData = z.infer<typeof bulkUploadSchema>;

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<BulkUploadFormData>({
    resolver: zodResolver(bulkUploadSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        form.setError("file", { 
          type: "manual", 
          message: "Please select a valid Excel file (.xlsx or .xls)" 
        });
        return;
      }
      
      setSelectedFile(file);
      form.setValue("file", event.target.files);
      form.clearErrors("file");
    }
  };

  const handleSubmit = (data: BulkUploadFormData) => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      onSubmit(formData);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a download link for the Excel template
    const link = document.createElement('a');
    link.href = '/assets/VX Academy Import Format.xlsx';
    link.download = 'VX_Academy_Import_Format.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Users
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Step 1: Download Template</CardTitle>
              <CardDescription>
                Download the VX Academy Import Format template and fill in your user data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Step 2: Upload Completed File</CardTitle>
              <CardDescription>
                Upload your completed Excel file with user data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excel File</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedFile || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Users
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div><strong>Excel Format Requirements:</strong></div>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Row 1 must contain headers that map to user fields</li>
                <li>• Required fields: First Name, Email</li>
                <li>• Optional fields: Last Name, Username, Password, Role, Language, Assets, etc.</li>
                <li>• If no password is provided, email will be used as the password</li>
                <li>• Invalid rows will be skipped with detailed error reporting</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}