import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Link2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "Enter image URL...",
  disabled = false 
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        handleImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleImageUpload(file);
    }
    // Reset the input
    event.target.value = '';
  };

  const handleImageUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    
    if (!fileToUpload) {
      toast({
        title: "No image selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("mediaFiles", fileToUpload);

      const response = await apiRequest("POST", "/api/media/upload", formData, null, null, true);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Use the first uploaded file's URL
      if (result.files && result.files.length > 0) {
        onChange(result.files[0].url);
        setSelectedFile(null);
        
        toast({
          title: "Image uploaded",
          description: "The image was uploaded successfully to Media tab.",
        });
      } else {
        throw new Error("No file uploaded");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    setSelectedFile(null);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Image URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {/* Upload Area */}
            <Card
              className={`border-2 border-dashed transition-all duration-200 ${
                dragActive 
                  ? 'border-teal-500 bg-teal-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${(uploading || disabled) ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                {uploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-teal-600 mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Uploading image...</h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait while your image is being uploaded
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className={`h-12 w-12 mb-4 ${dragActive ? 'text-teal-600' : 'text-gray-400'}`} />
                    <h3 className="text-lg font-semibold mb-2">
                      {dragActive ? 'Drop image here!' : 'Drop image here or click to upload'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports JPG, PNG, GIF, and SVG files up to 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />

            {/* Selected file info */}
            {selectedFile && !uploading && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <Input
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}