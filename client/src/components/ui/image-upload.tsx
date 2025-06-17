import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Upload, Loader2 } from "lucide-react";
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
  placeholder = "Image URL (will be set automatically after upload)",
  disabled = false 
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
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
      formData.append("imageFile", fileInputRef.current.files[0]);

      const response = await apiRequest("POST", "/api/images/upload", formData, null, null, true);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Set the image URL
      onChange(result.imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "The image was uploaded successfully.",
      });
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

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                // Clear previous image URL when selecting a new file
                if (e.target.files && e.target.files.length > 0) {
                  onChange("");
                }
              }}
              disabled={disabled || uploading}
            />
            <Button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              size="sm"
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </>
              )}
            </Button>
            {fileInputRef.current?.files?.[0] && (
              <Button 
                type="button" 
                onClick={handleImageUpload}
                disabled={disabled || uploading}
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
          
          <Input
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          
          {value && (
            <div className="mt-2">
              <img 
                src={value} 
                alt="Preview" 
                className="max-w-xs max-h-32 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}