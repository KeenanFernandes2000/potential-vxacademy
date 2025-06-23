import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificateTemplateUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CertificateTemplateUpload({ value, onChange, disabled }: CertificateTemplateUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("mediaFiles", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      // Use the first uploaded file's URL
      if (result.files && result.files.length > 0) {
        onChange(result.files[0].url);
      } else {
        throw new Error("No file uploaded");
      }
    } catch (error) {
      setUploadError("Failed to upload certificate template");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  });

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUrlInput("");
    onChange("");
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Use URL</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Certificate Template</CardTitle>
              <CardDescription>
                Upload an image or PDF file to use as a certificate template. Supported formats: PNG, JPG, PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!value && !uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop the file here" : "Drag & drop a certificate template"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <Button type="button" variant="outline" disabled={disabled || uploading}>
                    {uploading ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <File className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate" title={uploadedFile?.name}>
                        {(uploadedFile?.name?.length || 0) > 30 ? `${uploadedFile?.name?.substring(0, 30)}...` : uploadedFile?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : "Template uploaded"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {uploadError && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificate Template URL</CardTitle>
              <CardDescription>
                Enter a direct URL to an image or PDF file to use as a certificate template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-url">Template URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="template-url"
                    type="url"
                    placeholder="https://example.com/certificate-template.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={disabled || !urlInput.trim()}
                  >
                    Set URL
                  </Button>
                </div>
              </div>

              {value && uploadMethod === "url" && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Certificate template</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{value}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Placeholders Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Placeholders</CardTitle>
          <CardDescription>
            Use these placeholders in your certificate template. They will be automatically replaced when certificates are generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">User's full name</span>
                <span className="font-mono text-sm">{"{{USER_NAME}}"}</span>
              </div>
              <div className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Course title</span>
                <span className="font-mono text-sm">{"{{COURSE_NAME}}"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Completion date</span>
                <span className="font-mono text-sm">{"{{DATE}}"}</span>
              </div>
              <div className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Unique certificate ID</span>
                <span className="font-mono text-sm">{"{{CERTIFICATE_ID}}"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}