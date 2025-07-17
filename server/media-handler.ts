import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { InsertMediaFile } from "@shared/schema";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads", "media");
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and videos
    const allowedMimeTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // PDFs
      "application/pdf",
      // Videos
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      // Audio (bonus)
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${file.mimetype} not allowed. Supported types: images, PDFs, videos`
        )
      );
    }
  },
});

export const uploadMedia = upload.array("mediaFiles", 20); // Allow up to 20 files at once

export async function handleMediaUpload(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const finalPath = path.join(uploadsDir, uniqueFilename);

        // Move file to final location
        await fs.move(file.path, finalPath);

        // Create media file record
        const mediaFileData: InsertMediaFile = {
          filename: uniqueFilename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          filePath: finalPath,
          url: `/api/media/files/${uniqueFilename}`,
          uploadedBy: req.user?.id || 1, // Default to admin if no user
        };

        const savedFile = await storage.createMediaFile(mediaFileData);
        uploadedFiles.push(savedFile);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Clean up the temporary file if it still exists
        if (await fs.pathExists(file.path)) {
          await fs.unlink(file.path);
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ error: "Failed to process any files" });
    }

    return res.status(201).json({
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error handling media upload:", error);
    return res.status(500).json({ error: "Failed to upload media files" });
  }
}

export async function getMediaFiles(req: Request, res: Response) {
  try {
    const files = await storage.getMediaFiles();
    return res.json(files);
  } catch (error) {
    console.error("Error fetching media files:", error);
    return res.status(500).json({ error: "Failed to fetch media files" });
  }
}

export async function deleteMediaFile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get file info before deleting
    const file = await storage.getMediaFile(parseInt(id));
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from database
    const deleted = await storage.deleteMediaFile(parseInt(id));

    if (deleted) {
      // Delete physical file
      try {
        if (await fs.pathExists(file.filePath)) {
          await fs.unlink(file.filePath);
        }
      } catch (error) {
        console.error("Error deleting physical file:", error);
        // Continue even if physical file deletion fails
      }

      return res.json({ message: "File deleted successfully" });
    } else {
      return res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error deleting media file:", error);
    return res.status(500).json({ error: "Failed to delete media file" });
  }
}

export async function bulkDeleteMediaFiles(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing file IDs" });
    }

    // Get file info before deleting
    const files = await Promise.all(
      ids.map((id) => storage.getMediaFile(parseInt(id)))
    );

    // Delete from database
    const deletedCount = await storage.deleteMultipleMediaFiles(
      ids.map((id) => parseInt(id))
    );

    // Delete physical files
    for (const file of files) {
      if (file) {
        try {
          if (await fs.pathExists(file.filePath)) {
            await fs.unlink(file.filePath);
          }
        } catch (error) {
          console.error(
            `Error deleting physical file ${file.filename}:`,
            error
          );
          // Continue even if physical file deletion fails
        }
      }
    }

    return res.json({
      message: `Successfully deleted ${deletedCount} file(s)`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting media files:", error);
    return res.status(500).json({ error: "Failed to delete media files" });
  }
}

export function serveMediaFile(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Serve the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving media file:", error);
    return res.status(500).json({ error: "Failed to serve media file" });
  }
}
