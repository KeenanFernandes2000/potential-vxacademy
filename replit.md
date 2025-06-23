# VX Academy - Training Platform

## Overview

The VX Academy is an AI-powered training platform designed for hospitality and tourism professionals. The platform provides personalized learning experiences with comprehensive content management, gamification elements, and advanced assessment capabilities. The system follows a hierarchical content structure: Training Areas > Modules > Courses > Units > Learning Blocks > Assessments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with Shadcn UI component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Authentication**: Passport.js with session-based authentication
- **File Uploads**: Multer for handling SCORM packages, images, and Excel files
- **API Design**: RESTful API with comprehensive CRUD operations

### Database Architecture
- **Database**: PostgreSQL for robust relational data management
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Content Management Hierarchy
1. **Training Areas**: Top-level categorization (e.g., Customer Service, Healthcare)
2. **Modules**: Subject groupings within training areas
3. **Courses**: Individual learning programs with completion tracking
4. **Units**: Course subdivisions for organized learning
5. **Learning Blocks**: Granular content units (video, text, interactive, SCORM)
6. **Assessments**: Quizzes and evaluations with scoring

### User Management System
- **Role-based Access Control**: Admin, Instructor, Frontliner roles
- **Bulk User Management**: Excel upload functionality for user creation
- **Mandatory Course Assignment**: Automatic course assignment based on user roles
- **Progress Tracking**: Comprehensive learning analytics per user

### Gamification Engine
- **XP Points System**: Experience points for learning activities
- **Badge System**: Achievement recognition with custom badge creation
- **Leaderboards**: Competitive elements to drive engagement
- **Certificates**: Completion certificates for course achievements

### AI Integration
- **Embedded AI Tutor**: Potential.com chatbot integration for learning support
- **Personalized Recommendations**: AI-driven learning path suggestions
- **Smart Content Delivery**: Adaptive learning based on user performance

## Data Flow

### Authentication Flow
1. User login via email/password credentials
2. Passport.js validates credentials against database
3. Session creation and management via PostgreSQL session store
4. Role-based route protection and UI adaptation

### Learning Content Flow
1. Content creation through admin interface (hierarchical structure)
2. SCORM package upload and parsing for interactive content
3. Content delivery based on user progress and role assignments
4. Progress tracking and completion status updates

### Assessment Flow
1. Question bank management with multiple question types
2. Assessment creation linking to specific learning blocks
3. User attempt tracking with scoring and feedback
4. Badge and XP award triggers based on performance

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **passport**: Authentication middleware
- **multer**: File upload handling
- **drizzle-orm**: Type-safe database operations

### File Processing
- **extract-zip**: SCORM package extraction
- **xml2js**: SCORM manifest parsing
- **xlsx**: Excel file processing for bulk operations
- **fs-extra**: Enhanced file system operations

### UI Enhancement
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **recharts**: Data visualization for analytics

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL with automatic provisioning

### Production Deployment
- **Build Process**: Vite for frontend, esbuild for backend compilation
- **Static Assets**: Express static file serving for uploads and images
- **Session Management**: PostgreSQL-backed session store for scalability
- **Environment Variables**: Database URL, session secrets, and API keys

### File Storage
- **Upload Directory Structure**: Organized by content type (images, SCORM packages)
- **SCORM Package Management**: Extracted and served as static content
- **Image Handling**: UUID-based naming with multiple format support

## Recent Changes
- June 23, 2025: Units Page CRUD Functionality and UI Enhancement Complete
  - Implemented inline editing functionality following courses page pattern (no popup modal)
  - Fixed broken edit functionality - form now properly populates with selected unit data
  - Enhanced delete operations with proper UI updates and cache invalidation
  - Fixed create form submission with correct data transformation for course assignments
  - Replaced Show Duration checkbox with modern toggle switch component
  - Improved course selection UI with badge display for selected courses and easy removal
  - Added dynamic form title ("Edit Unit" vs "Add New Unit") and submit button text
  - Implemented cancel functionality for editing mode with proper form reset
  - Enhanced backend API to handle course-unit many-to-many relationships correctly
  - Fixed all TypeScript compilation errors and removed deprecated modal code
  - Course selection now shows selected courses as removable badges with hover effects
- June 19, 2025: Application Crash Resolution and Stability Fixes
  - Fixed critical server startup crash caused by missing import path in excel-upload-handler.ts
  - Removed invalid isSubAdmin field reference from seed script that was causing database errors
  - Updated excel upload handler to use new firstName/lastName user schema structure
  - Fixed TypeScript compilation errors in routes.ts with proper error handling
  - Replaced deprecated material-icons with Lucide React icons in certificate component
  - Updated certificate component type definitions to match actual API response structure
  - Resolved all TypeScript errors preventing hot module reload functionality
  - Server now starts successfully and serves application on port 5000
- June 19, 2025: Critical Permission System Overhaul and Error Fixes
  - Fixed major permission issues preventing sub-admins from accessing core content endpoints
  - Removed overly restrictive permissions from courses, modules, and training areas GET endpoints
  - Changed content API endpoints to allow all authenticated users (not just admins) to view content
  - Added missing /api/auth/check endpoint to resolve API routing issues with Vite development server
  - Fixed deprecated 'name' property references in leaderboard component (now uses firstName/lastName)
  - Resolved "Cannot read properties of undefined (reading 'charAt')" error in leaderboard
  - Maintained proper authentication checks while enabling role-based content access
  - All content viewing endpoints now accessible to sub-admins and regular users as intended
- June 19, 2025: Dashboard, Leaderboard, and Role-Based Access Updates
  - Updated leaderboard API to filter out admin and sub-admin users, showing only regular users
  - Implemented role-based admin dashboard access - sub-admins now see Dashboard, User Management, Role Management, Analytics, and Courses
  - Fixed user name display throughout interface to use firstName/lastName fields correctly
  - Enhanced admin sidebar navigation with role-specific filtering
  - Updated role labels to properly display "Sub Administrator" for sub-admin users
  - Fixed authentication system password encryption mismatch between bcrypt and scrypt
  - Resolved user creation/login issues for admin-created accounts
  - Enabled sub-admin access to courses API and admin section navigation
  - Added Admin section to main sidebar for both admin and sub-admin users
  - Fixed route protection to allow sub-admin access to /admin routes
- June 18, 2025: Comprehensive Role-Based Access Control Implementation
  - Implemented three-tier user hierarchy (Admin, Sub-Admin, User) with proper permissions
  - Created comprehensive permission system with 17 different access controls
  - Added Sub-Admin restrictions: can only create Users, not other Sub-Admins
  - Implemented user filtering so Sub-Admins only see users they created (createdBy field)
  - Updated admin navigation to conditionally render based on user permissions
  - Created usePermissions hook for frontend permission management
  - Added role-based API route protection with requirePermission middleware
  - Enhanced user creation with role validation and createdBy tracking
  - Sub-Admins restricted from accessing courses, training areas, modules, assessments, etc.
  - Only User Management and Role Management accessible to Sub-Admins
  - Created comprehensive UserFormModal with role selection restrictions
  - Updated admin layout to hide unauthorized navigation items
- June 18, 2025: Complete Certificate Generation and Management System
  - Added Role Management to admin sidebar navigation with Shield icon for easy access
  - Implemented comprehensive CertificateTemplateUpload component with drag and drop functionality
  - Created tabbed interface supporting both file upload and URL input methods for certificate templates
  - Added template placeholder information showing {{USER_NAME}}, {{COURSE_NAME}}, {{DATE}}, {{CERTIFICATE_ID}}
  - Integrated upload component into assessments form replacing basic input field
  - Added dedicated certificate-handler.ts with PDF and image file support (10MB limit)
  - Implemented automatic certificate generation for completed assessments with certificates enabled
  - Added certificate notification system triggering when users earn certificates
  - Enhanced role management page with proper spacing (p-6) for better visual layout
  - Fixed backend certificate template upload with proper multer configuration
  - Integrated certificate visibility in achievements page under "My Certificates" section
  - Added certificate-earned notification type to notification system
- June 18, 2025: Updated User Schema to firstName/lastName Structure
  - Fixed runtime error by replacing deprecated user.name references throughout application
  - Updated registration page with separate firstName and lastName fields while maintaining aesthetic
  - Modified authentication system to handle new user profile structure
  - Updated leaderboard, admin layout, profile components, and all user interfaces
  - Completed comprehensive firstName/lastName field implementation across all components
- June 18, 2025: Fixed Authentication System and Database Integration
  - Resolved password hashing method mismatch between bcrypt and scrypt
  - Created properly authenticated admin account (admin@vx-academy.ae / admin123)
  - Cleared and reseeded database with correct user profile structure
  - Verified login functionality and session management working correctly
  - All comprehensive user management features now fully accessible
- June 18, 2025: Comprehensive User Management System Overhaul
  - Implemented hierarchical user system: Admin, Sub-Admin, and User roles with proper permissions
  - Enhanced database schema with comprehensive user profile fields (firstName, lastName, nationality, etc.)
  - Added 11 asset categories (Museum, Culture site, Events, Airports, Hospitality, etc.)
  - Implemented 15 role categories (Transport staff, Welcome staff, Guides, Security, etc.)
  - Added years of experience, seniority levels (Manager/Staff), and organization name fields
  - Created 9 language options (Arabic, English, Urdu, Hindi, Tagalog, Bengali, etc.)
  - Implemented worldwide nationality dropdown with 100+ countries
  - Added Admin hierarchy: Sub-Admins can create Users, Admins can create Sub-Admins and Users
  - Enhanced user table with XP points, badges collected, and mandatory course progress tracking
  - Created comprehensive user profile modal with detailed view functionality
  - Added role-based filtering system for Assets, Role Category, Seniority, and Platform Role
  - Implemented user creation tracking (createdBy field) for Admin oversight
  - Fixed form validation and TypeScript integration for all new profile fields
- June 18, 2025: Assessment page independent filtering implementation
  - Separated assessment display filters from form state to match other admin pages design pattern
  - Added independent filter controls (All/Unit/Course assessments) with proper dropdown handling
  - Created /api/assessments GET endpoint for fetching all assessments across the platform
  - Updated assessment table to use filteredAssessments instead of form-dependent selectedUnitId
  - Fixed Select component errors by replacing empty string values with "all" for proper React Select handling
  - Removed all selectedUnitId dependencies from display logic for true independence
  - Enhanced empty state messages to reflect current filter selections
- June 17, 2025: Comprehensive Learning Block page overhaul with advanced filtering
  - Fixed database schema issue by adding missing scorm_package_id column to learning_blocks table
  - Implemented comprehensive search functionality with real-time title-based filtering
  - Added hierarchical filter system: Training Areas → Modules → Courses → Units with dependent filtering
  - Enhanced table design with Unit column showing block ownership and improved visual layout
  - Added hover tooltips for all action buttons ("Edit learning block", "Delete learning block")
  - Updated page title to "Existing Learning Blocks" with descriptive subtitle and results summary
  - Improved empty states with context-aware messages based on active filters
  - Fixed form reset functionality and implemented proper cache invalidation
  - Added new /api/learning-blocks endpoint for fetching all learning blocks across units
  - Resolved Learning Block creation failures and enhanced user experience significantly
- June 17, 2025: Enhanced Unit duration visibility and action icon tooltips
  - Added duration visibility toggle (showDuration) to Unit create/edit modals with checkbox control
  - Implemented hover tooltips for all action icons across admin pages (Units, Training Areas, Modules, Courses)
  - Used TooltipProvider and Tooltip components from shadcn/ui for consistent hover feedback
  - Action buttons now show descriptive tooltips: "Edit", "Delete", "Duplicate", "Manage Blocks", etc.
  - Improved user experience with clear visual feedback for admin interface actions
- June 17, 2025: Comprehensive form field updates and reorganization
  - Updated database schema for courses, units, and assessments with new fields
  - Reorganized course form with hierarchical dropdowns (Training Area > Module > Course)
  - Added internal notes, course types, and improved field ordering across all forms
  - Enhanced assessment forms with placement options, grading toggles, and certificate management
  - Implemented dynamic filtering for dependent dropdowns (training areas filter modules)
  - Updated all form validation schemas and database relations
- June 17, 2025: Enhanced image upload functionality
  - Created advanced ImageUpload component with drag and drop functionality
  - Added tabbed interface for choosing between file upload or URL input
  - Implemented image preview with remove functionality
  - Integrated enhanced upload component into Training Areas and Modules pages
  - Added automatic file upload on selection/drop with progress indicators
  - Styled component to match media page design with visual feedback
- June 17, 2025: Completed PostgreSQL database integration
  - Successfully configured Neon serverless PostgreSQL connection
  - Migrated from in-memory MemStorage to DatabaseStorage implementation
  - Updated database configuration to use Neon serverless driver
  - Pushed complete database schema with 21 tables to PostgreSQL
  - Verified database connection and table creation
  - All learning platform data now persists in PostgreSQL database
- June 13, 2025: Completed VX Academy rebrand and fixes
  - Successfully rebranded from EHC Academy to VX Academy across entire platform
  - Updated header, sidebar, and landing page with hospitality and tourism focus
  - Implemented enhanced analytics dashboard with 5 specific graphs:
    * User Activity Over Time
    * User Growth  
    * Course Enrollment
    * Daily Active Users
    * Assessment Completion
  - Added image export functionality for analytics dashboard using html2canvas
  - Fixed password change functionality by replacing require() with proper ES module imports
  - Fixed landing page "Learn More" button styling and navigation
  - Replaced broken material-icons with proper SVG social media icons in footer
  - Updated leaderboard filters with working Abu Dhabi locations and hospitality departments
  - Implemented role-based access control for admin features
- June 13, 2025: Added PostgreSQL database integration
  - Configured Neon PostgreSQL database connection
  - Added comprehensive database relations using Drizzle ORM
  - Migrated from in-memory storage to DatabaseStorage implementation
  - Successfully pushed database schema and verified connection
- June 13, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.