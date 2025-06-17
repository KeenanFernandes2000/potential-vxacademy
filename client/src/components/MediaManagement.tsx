import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MediaFile } from "@shared/schema";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  Upload,
  Trash2,
  Copy,
  File,
  Image,
  FileVideo,
  FileAudio,
  Download,
  Eye,
  X,
  Plus,
  RefreshCw,
  Maximize2,
} from "lucide-react";

// Helper function to get file type icon
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get file type badge color
const getFileTypeBadge = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "bg-green-100 text-green-800";
  if (mimeType.startsWith("video/")) return "bg-blue-100 text-blue-800";
  if (mimeType.startsWith("audio/")) return "bg-purple-100 text-purple-800";
  if (mimeType === "application/pdf") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

export default function MediaManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Fetch media files
  const { data: mediaFiles, isLoading, refetch } = useQuery<MediaFile[]>({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const response = await fetch("/api/media");
      if (!response.ok) {
        throw new Error("Failed to fetch media files");
      }
      return response.json();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to upload files";
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (response: any) => {
      const uploadedCount = response.files ? response.files.length : 1;
      toast({
        title: "Upload Successful",
        description: response.message || `Successfully uploaded ${uploadedCount} file(s)`,
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return apiRequest("POST", "/api/media/bulk-delete", { ids });
    },
    onSuccess: (response: any) => {
      const deletedCount = response.deletedCount || selectedFiles.size;
      toast({
        title: "Files Deleted",
        description: `Successfully deleted ${deletedCount} file(s)`,
        duration: 3000,
      });
      setSelectedFiles(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Delete Failed",
        description: error.message || "Failed to delete files",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
    // Reset the input so the same file can be selected again if needed
    event.target.value = '';
  };

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
      const files = Array.from(e.dataTransfer.files);
      
      // Validate file types
      const validFiles = files.filter(file => {
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf',
          'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
          'audio/mpeg', 'audio/wav', 'audio/ogg'
        ];
        return allowedTypes.includes(file.type);
      });

      if (validFiles.length === 0) {
        toast({
          title: "Invalid file type",
          description: "Please upload images, PDFs, videos, or audio files only.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      if (validFiles.length !== files.length) {
        toast({
          title: "Some files skipped",
          description: `${files.length - validFiles.length} file(s) were skipped due to invalid type.`,
          variant: "destructive",
          duration: 5000,
        });
      }

      uploadFiles(validFiles);
    }
  }, [toast]);

  // Upload files function
  const uploadFiles = (files: File[]) => {
    if (files.length === 0) return;

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024); // 50MB
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the 50MB limit and will be skipped.`,
        variant: "destructive",
        duration: 5000,
      });
      files = files.filter(file => file.size <= 50 * 1024 * 1024);
    }

    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("mediaFiles", file);
    });
    
    uploadMutation.mutate(formData);
  };

  // Handle checkbox change
  const handleCheckboxChange = (fileId: number, checked: boolean) => {
    const newSelection = new Set(selectedFiles);
    if (checked) {
      newSelection.add(fileId);
    } else {
      newSelection.delete(fileId);
    }
    setSelectedFiles(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked && mediaFiles) {
      setSelectedFiles(new Set(mediaFiles.map(file => file.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL Copied",
        description: "File URL has been copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedFiles.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedFiles));
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-abu-charcoal">Media Library</h2>
          <p className="text-muted-foreground">Manage your images, videos, PDFs, and other media files</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {selectedFiles.size > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              size="sm"
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedFiles.size})
            </Button>
          )}
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          dragActive 
            ? 'border-teal-500 bg-teal-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {uploadMutation.isPending ? (
            <>
              <RefreshCw className="h-12 w-12 text-teal-600 mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Uploading files...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please wait while your files are being uploaded
              </p>
            </>
          ) : (
            <>
              <Upload className={`h-12 w-12 mb-4 ${dragActive ? 'text-teal-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold mb-2">
                {dragActive ? 'Drop files here!' : 'Drop files here or click to upload'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports images, PDFs, videos, and audio files up to 50MB
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Files Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mediaFiles && mediaFiles.length > 0 ? (
        <>
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedFiles.size === mediaFiles.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select All ({mediaFiles.length} files)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <Card key={file.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(file.id, !!checked)}
                    />
                    <Badge className={`text-xs ${getFileTypeBadge(file.mimeType)}`}>
                      {file.mimeType.split('/')[0]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* File Preview */}
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : file.mimeType === 'application/pdf' ? (
                      <div className="w-full h-full relative">
                        <iframe
                          src={`${file.url}#view=FitH`}
                          title={file.originalName}
                          className="w-full h-full border-0"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity cursor-pointer"
                             onClick={() => window.open(file.url, '_blank')}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        {getFileIcon(file.mimeType)}
                        <span className="text-xs mt-2 text-center px-2">
                          {file.mimeType.split('/')[1].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate" title={file.originalName}>
                      {file.originalName}
                    </h4>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{format(new Date(file.createdAt!), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.url)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy URL
                    </Button>
                    
                    {file.mimeType === 'application/pdf' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewFile(file)}
                        title="Preview PDF"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(file.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media files yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first file to get started
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Files</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedFiles.size} selected file(s)? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Files"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Modal */}
      {previewFile && previewFile.mimeType === 'application/pdf' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{previewFile.originalName}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(previewFile.fileSize)} • PDF Document
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewFile.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`${previewFile.url}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                title={previewFile.originalName}
                className="w-full h-full border border-gray-200 rounded"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}