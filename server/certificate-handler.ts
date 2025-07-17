import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";

// ESM module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory for storing certificate templates
const certificatesDir = path.join(__dirname, "../public/uploads/images");
fs.ensureDirSync(certificatesDir);

// Setup multer for certificate template uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure the upload directory exists
      fs.ensureDirSync(certificatesDir);
      cb(null, certificatesDir);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename with timestamp
      const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `cert-template-${uniqueId}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept image files and PDFs
    const allowedTypes = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG) and PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for certificate templates
  },
});

// Handler for certificate template uploads
export const uploadCertificateTemplate = upload.single("certificateTemplate");

export async function handleCertificateTemplateUpload(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the URL of the uploaded file
    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Certificate template upload error:", error);
    res.status(500).json({ message: "Failed to upload certificate template" });
  }
}
