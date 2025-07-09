import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { hashPassword } from '@shared/auth-utils';
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
    
    console.log("Processing Excel upload with header-based validation");
    
    // Read Excel file
    const fileBuffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    if (workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "Excel file does not contain any sheets" });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse data with headers as first row
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!data || data.length < 2) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File must contain at least a header row and one data row" });
    }
    
    const headers = data[0] as string[];
    const rows = data.slice(1) as any[][];
    
    console.log("Headers found:", headers);
    console.log("Data rows count:", rows.length);
    
    // Required field mappings - now includes variations with asterisks
    const requiredHeaders = {
      'First name': ['First name', 'First name*', 'firstName', 'First Name', 'FIRST NAME'],
      'Last name': ['Last name', 'Last name*', 'lastName', 'Last Name', 'LAST NAME'],
      'Email Address': ['Email Address', 'Email Address*', 'email', 'Email', 'EMAIL'],
      'Language': ['Language', 'Language*', 'language', 'LANGUAGE'],
      'Nationality': ['Nationality', 'Nationality*', 'nationality', 'NATIONALITY'],
      'Years of Experience': ['Years of Experience', 'Years of Experience*', 'yearsOfExperience', 'Experience'],
      'Asset': ['Asset', 'Asset*', 'assets', 'Asset Category'],
      'Role Category': ['Role Category', 'Role Category*', 'roleCategory', 'Job Role'],
      'Seniority': ['Seniority', 'Seniority*', 'seniority', 'Seniority Level'],
      'Organization Name': ['Organization Name', 'Organization Name*', 'organizationName', 'Organization']
    };
    
    // Find header indices with more flexible matching
    const headerIndices: { [key: string]: number } = {};
    
    for (const [requiredField, variations] of Object.entries(requiredHeaders)) {
      const foundIndex = headers.findIndex(header => {
        if (!header) return false;
        const cleanHeader = header.toLowerCase().trim().replace(/\*/g, '');
        return variations.some(variation => {
          const cleanVariation = variation.toLowerCase().trim().replace(/\*/g, '');
          return cleanHeader === cleanVariation;
        });
      });
      if (foundIndex !== -1) {
        headerIndices[requiredField] = foundIndex;
      }
    }
    
    // Check for missing required headers
    const missingHeaders = Object.keys(requiredHeaders).filter(field => 
      headerIndices[field] === undefined
    );
    
    if (missingHeaders.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: `Missing required headers: ${missingHeaders.join(', ')}. Found headers: ${headers.join(', ')}` 
      });
    }
    
    const createdUsers = [];
    const failedUsers = [];
    
    // Validation patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validLanguages = ['Arabic', 'English', 'Urdu', 'Hindi', 'Tagalog', 'Bengali', 'Malayalam', 'Tamil', 'Farsi'];
    const validAssets = ['Museum', 'Culture site', 'Events', 'Mobility operators', 'Airports', 'Cruise terminals', 'Hospitality', 'Malls', 'Tour Guides & operators', 'Visitor information centers', 'Entertainment & Attractions'];
    const validRoleCategories = ['Transport and parking staff', 'Welcome staff', 'Ticketing staff', 'Information desk staff', 'Guides', 'Events staff', 'Security personnel', 'Retail staff', 'F&B staff', 'Housekeeping & janitorial', 'Customer service', 'Emergency & medical services', 'Media and public relations', 'Logistics', 'Recreation and entertainment'];
    const validSeniority = ['Manager', 'Staff'];
    const validExperience = ['Less than 1 year', '1-5 years', '5-10 years', '10+ years'];
    
    // Process each data row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Account for header row and 0-based index
      
      try {
        // Extract required fields using header indices
        const firstName = row[headerIndices['First name']]?.toString().trim();
        const lastName = row[headerIndices['Last name']]?.toString().trim();
        const email = row[headerIndices['Email Address']]?.toString().trim();
        const language = row[headerIndices['Language']]?.toString().trim();
        const nationality = row[headerIndices['Nationality']]?.toString().trim();
        const yearsOfExperience = row[headerIndices['Years of Experience']]?.toString().trim();
        const asset = row[headerIndices['Asset']]?.toString().trim();
        const roleCategory = row[headerIndices['Role Category']]?.toString().trim();
        const seniority = row[headerIndices['Seniority']]?.toString().trim();
        const organizationName = row[headerIndices['Organization Name']]?.toString().trim();
        
        // Handle Sub-Category (optional field) - check for variations with/without asterisk
        let subCategoryIndex = headers.findIndex(header => {
          if (!header) return false;
          const cleanHeader = header.toLowerCase().trim().replace(/\*/g, '');
          return cleanHeader === 'sub-category' || cleanHeader === 'subcategory';
        });
        
        const subCategory = subCategoryIndex !== -1 ? 
          row[subCategoryIndex]?.toString().trim() || '' : '';
        
        // Validation checks
        const validationErrors = [];
        
        if (!firstName) validationErrors.push('First name is required');
        if (!lastName) validationErrors.push('Last name is required');
        if (!email) validationErrors.push('Email Address is required');
        else if (!emailRegex.test(email)) validationErrors.push('Invalid email format');
        if (!language) validationErrors.push('Language is required');
        else if (!validLanguages.includes(language)) validationErrors.push(`Invalid language. Must be one of: ${validLanguages.join(', ')}`);
        if (!nationality) validationErrors.push('Nationality is required');
        if (!yearsOfExperience) validationErrors.push('Years of Experience is required');
        else if (!validExperience.includes(yearsOfExperience)) validationErrors.push(`Invalid experience. Must be one of: ${validExperience.join(', ')}`);
        if (!asset) validationErrors.push('Asset is required');
        else if (!validAssets.includes(asset)) validationErrors.push(`Invalid asset. Must be one of: ${validAssets.join(', ')}`);
        if (!roleCategory) validationErrors.push('Role Category is required');
        else if (!validRoleCategories.includes(roleCategory)) validationErrors.push(`Invalid role category. Must be one of: ${validRoleCategories.join(', ')}`);
        if (!seniority) validationErrors.push('Seniority is required');
        else if (!validSeniority.includes(seniority)) validationErrors.push(`Invalid seniority. Must be one of: ${validSeniority.join(', ')}`);
        if (!organizationName) validationErrors.push('Organization Name is required');
        
        if (validationErrors.length > 0) {
          failedUsers.push({
            row: rowNumber,
            name: `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown',
            email: email || '',
            error: validationErrors.join('; ')
          });
          continue;
        }
        
        // Check for duplicate email
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          failedUsers.push({
            row: rowNumber,
            name: `${firstName} ${lastName}`,
            email: email,
            error: 'Email already exists in system'
          });
          continue;
        }
        
        // Generate username from email (before @ symbol)
        const username = email.split('@')[0];
        
        // Check if username already exists
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          failedUsers.push({
            row: rowNumber,
            name: `${firstName} ${lastName}`,
            email: email,
            error: 'Username already exists in system'
          });
          continue;
        }
        
        // Generate password (use email prefix as default)
        const password = username;
        const hashedPassword = await hashPassword(password);
        
        // Create the user
        const newUser = await storage.createUser({
          username: username,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: 'user', // All bulk uploaded users are regular users
          language: language,
          nationality: nationality,
          yearsOfExperience: yearsOfExperience,
          assets: asset,
          roleCategory: roleCategory,
          subCategory: subCategory || '',
          seniority: seniority,
          organizationName: organizationName,
          isActive: true
        });
        
        createdUsers.push({
          ...newUser,
          generatedPassword: password, // Include for admin reference
          row: rowNumber
        });
        
        console.log(`Successfully created user: ${firstName} ${lastName} (${email})`);
        
      } catch (error) {
        console.error(`Error creating user from row ${rowNumber}:`, error);
        const firstName = row[headerIndices['First name']] || '';
        const lastName = row[headerIndices['Last name']] || '';
        const email = row[headerIndices['Email Address']] || '';
        
        failedUsers.push({
          row: rowNumber,
          name: `${firstName} ${lastName}`.trim() || 'Unknown',
          email: email,
          error: `System error: ${error.message || 'Failed to create user'}`
        });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    // Prepare summary
    const summary = {
      totalRows: rows.length,
      created: createdUsers.length,
      failed: failedUsers.length,
      createdUsers: createdUsers.map(user => ({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        username: user.username,
        generatedPassword: user.generatedPassword,
        row: user.row
      })),
      failedUsers: failedUsers,
      message: `Processed ${rows.length} rows. Successfully created ${createdUsers.length} users. ${failedUsers.length} rows failed validation.`
    };
    
    console.log("Upload summary:", summary);
    
    res.status(201).json(summary);
    
  } catch (error) {
    console.error("Error processing Excel upload:", error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Failed to process Excel file",
      error: error.message 
    });
  }
}