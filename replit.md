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
- June 18, 2025: Comprehensive User Management System Overhaul (In Progress)
  - Implementing detailed user profile structure with firstName, lastName, email, username, password
  - Adding comprehensive dropdown fields: Language (9 options), Nationality, Years of Experience (4 tiers)
  - Implementing Assets dropdown (11 categories: Museum, Culture site, Events, etc.)
  - Adding Role Category dropdown (15 categories: Transport staff, Welcome staff, etc.)
  - Including Sub-Category free text field and Seniority (Manager/Staff)
  - Adding Organization Name field and Sub-Admin toggle functionality
  - Creating download template button for Excel/CSV import with proper column structure
  - Updating user hierarchy: Admins > Sub-Admins > Users with proper access controls
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