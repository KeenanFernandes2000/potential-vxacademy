import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { hashPassword } from '../scripts/seed';
import { IStorage } from './storage';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path and directory
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

// Configure storage for excel uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(currentDir, '../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'users-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for Excel files only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel or CSV files are allowed.'));
  }
};

// Set up multer upload
export const uploadExcel = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('file');

// Process uploaded Excel file and create users
export async function processExcelUpload(req: Request, res: Response, storage: IStorage) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Remove default values - all data comes from Excel template
    console.log("Processing Excel upload with template as single source of truth");
    
    // Read Excel file using the read method
    const fileBuffer = fs.readFileSync(req.file.path);
    console.log("File read successfully. File size:", fileBuffer.length, "bytes");
    
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    console.log("XLSX parsed successfully. Sheet names:", workbook.SheetNames);
    
    if (workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "Excel file does not contain any sheets" });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    console.log("Using sheet:", sheetName);
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log("Parsed data from sheet. Row count:", data.length);
    
    if (!data || data.length === 0) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "No data found in the uploaded file" });
    }
    
    const createdUsers = [];
    const failedUsers = [];
    
    // Process each row in the Excel file
    for (const rowData of data) {
      try {
        const row = rowData as any;
        
        // Check if required fields exist and consider different column name formats
        const firstName = row.firstName || row.FirstName || row['First Name'] || row['first_name'] || row['First name'] || row['FIRST NAME'];
        const lastName = row.lastName || row.LastName || row['Last Name'] || row['last_name'] || row['Last name'] || row['LAST NAME'];
        const fullName = row.name || row.Name || row['Full Name'] || row['full_name'] || row['FULL NAME'] || row['Employee Name'] || row['User Name'];
        const email = row.email || row.Email || row['Email Address'] || row['E-mail'] || row['EMAIL'] || row['Email ID'] || row['Work Email'];
        const username = row.username || row.Username || row['User Name'] || row['USERNAME'] || row['Login ID'] || row['Employee ID'];
        
        // If we have a full name but no first/last, try to split it
        let finalFirstName = firstName;
        let finalLastName = lastName;
        
        if (!firstName && !lastName && fullName) {
          const nameParts = fullName.trim().split(' ');
          finalFirstName = nameParts[0] || '';
          finalLastName = nameParts.slice(1).join(' ') || '';
        }
        
        console.log("Processing user row:", { originalRow: row, extractedFirstName: finalFirstName, extractedLastName: finalLastName, extractedEmail: email });
        
        if (!finalFirstName || !email) {
          failedUsers.push({
            name: `${finalFirstName} ${finalLastName}`.trim(),
            email: email || '',
            error: `Missing required fields (firstName or email). Found columns: ${Object.keys(row).join(', ')}`
          });
          continue;
        }
        
        // Use username from Excel if provided, otherwise use email
        const finalUsername = username || email;
        
        // Check if username already exists
        console.log(`Checking if user with username ${finalUsername} already exists`);
        
        const existingUser = await storage.getUserByUsername(finalUsername);
        if (existingUser) {
          failedUsers.push({
            name: `${finalFirstName} ${finalLastName}`.trim(),
            email: email,
            error: "Username already exists"
          });
          continue;
        }
        
        // Generate a random password if none provided
        const password = row.password || Math.random().toString(36).slice(2, 10);
        const hashedPassword = await hashPassword(password);
        
        // Extract user data from Excel template columns with more field variations
        const role = row.role || row.Role || row['Platform Role'] || row['USER ROLE'] || row['Role Type'] || 'user';
        const language = row.language || row.Language || row['Preferred Language'] || row['LANGUAGE'] || row['Primary Language'] || 'English';
        const assets = row.assets || row.Assets || row['Asset Category'] || row['ASSETS'] || row['Asset Type'] || row['Asset Group'] || '';
        const roleCategory = row.roleCategory || row['Role Category'] || row['Job Role'] || row['ROLE CATEGORY'] || row['Position'] || row['Job Title'] || '';
        const seniority = row.seniority || row.Seniority || row['Seniority Level'] || row['SENIORITY'] || row['Experience Level'] || row['Level'] || '';
        const organization = row.organization || row.Organization || row['Organization Name'] || row['ORGANIZATION'] || row['Company'] || row['Department'] || '';
        const nationality = row.nationality || row.Nationality || row['NATIONALITY'] || row['Country'] || '';
        const yearsOfExperience = row.yearsOfExperience || row['Years of Experience'] || row['Experience Years'] || row['YEARS OF EXPERIENCE'] || row['Work Experience'] || '';

        // Use username from Excel if provided, otherwise use email
        const finalUsername = username || email;

        // Create the user with all data from Excel template
        const newUser = await storage.createUser({
          username: finalUsername,
          password: hashedPassword,
          firstName: finalFirstName,
          lastName: finalLastName || '',
          email: email,
          role: role.toLowerCase() === 'sub-admin' ? 'sub-admin' : 'user',
          language: language,
          assets: assets,
          roleCategory: roleCategory,
          seniority: seniority,
          organizationName: organization,
          nationality: nationality,
          yearsOfExperience: String(yearsOfExperience || ''),
        });
        
        // Include generated password in response if auto-generated
        createdUsers.push({
          ...newUser,
          generatedPassword: !row.password ? password : undefined // Include the generated password in the response only if it was auto-generated
        });
      } catch (error) {
        console.error("Error creating user from Excel:", error);
        const rowDataAny = rowData as any;
        const errorFirstName = rowDataAny.firstName || rowDataAny.FirstName || rowDataAny['First Name'] || '';
        const errorLastName = rowDataAny.lastName || rowDataAny.LastName || rowDataAny['Last Name'] || '';
        const errorFullName = rowDataAny.name || rowDataAny.Name || rowDataAny['Full Name'] || '';
        
        failedUsers.push({
          name: errorFirstName && errorLastName ? `${errorFirstName} ${errorLastName}` : errorFullName,
          email: rowDataAny.email || rowDataAny.Email || '',
          username: rowDataAny.username || '',
          error: "Failed to create user"
        });
      }
    }
    
    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({ 
      created: createdUsers.length,
      failed: failedUsers.length,
      users: createdUsers,
      failedUsers: failedUsers
    });
  } catch (error) {
    console.error("Error processing Excel upload:", error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Failed to process Excel file" });
  }
}