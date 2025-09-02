# VX Academy Server Architecture Documentation

This document provides a detailed overview of the server-side architecture for the VX Academy learning management system. The server is built with Node.js, Express, and PostgreSQL, providing a robust backend for the learning platform.

## Table of Contents

1. [Core Server Files](#core-server-files)
2. [Authentication & Security](#authentication--security)
3. [Database & Storage](#database--storage)
4. [File Management](#file-management)
5. [Business Logic Services](#business-logic-services)
6. [Development & Build](#development--build)

---

## Core Server Files

### `index.ts` - Main Server Entry Point

**Purpose**: Primary server initialization and configuration file
**Key Responsibilities**:

- Initializes Express application with middleware
- Sets up request logging and monitoring
- Configures static file serving for uploads
- Implements error handling middleware
- Sets up development vs production environment handling
- Configures server to run on port 5000

**Key Features**:

- Request/response logging with performance metrics
- Automatic environment detection (dev/prod)
- Centralized error handling
- Static file serving for uploaded images

---

## Authentication & Security

### `auth.ts` - Authentication System

**Purpose**: Handles user authentication, session management, and password security
**Key Responsibilities**:

- Implements Passport.js authentication strategies
- Manages user sessions with PostgreSQL storage
- Handles password hashing and verification
- Supports multiple password formats (bcrypt, scrypt legacy)
- Configures session security settings

**Key Features**:

- Local strategy authentication
- Session persistence in PostgreSQL
- Password format compatibility (legacy + modern)
- Secure session configuration with environment variables
- Fallback authentication mechanisms

### `permissions.ts` - Role-Based Access Control

**Purpose**: Implements comprehensive permission system for different user roles
**Key Responsibilities**:

- Defines permission matrix for admin, sub-admin, and user roles
- Provides middleware for route protection
- Implements user management permissions
- Handles role-based access validation

**Key Features**:

- Granular permission system (16+ permission types)
- Middleware functions for route protection
- Role hierarchy (admin > sub-admin > user)
- Permission checking utilities for frontend

---

## Database & Storage

### `db.ts` - Database Connection Management

**Purpose**: Manages PostgreSQL database connections and configuration
**Key Responsibilities**:

- Establishes database connection pool
- Handles connection fallback (remote → local)
- Configures Drizzle ORM with PostgreSQL
- Manages connection lifecycle and error handling

**Key Features**:

- Connection pooling with configurable limits
- Automatic fallback to local database
- Environment-based configuration
- Connection health monitoring
- SSL configuration support

### `storage.ts` - Storage Interface Definition

**Purpose**: Defines the storage abstraction layer interface
**Key Responsibilities**:

- Declares storage interface for all data operations
- Provides type definitions for database operations
- Defines session store interface
- Establishes contract for storage implementations

**Key Features**:

- Comprehensive interface covering all data entities
- Type-safe method signatures
- Session store integration
- Modular design for different storage backends

### `database-storage.ts` - PostgreSQL Implementation

**Purpose**: Implements the storage interface using PostgreSQL and Drizzle ORM
**Key Responsibilities**:

- Provides concrete implementation of storage interface
- Handles all CRUD operations for learning entities
- Manages complex queries and relationships
- Implements session storage with PostgreSQL

**Key Features**:

- Full CRUD operations for all entities
- Complex query support (joins, filters, pagination)
- Session persistence in database
- Transaction support for complex operations
- Performance optimization with connection pooling

---

## File Management

### `scorm-handler.ts` - SCORM Package Management

**Purpose**: Handles SCORM e-learning package uploads, processing, and serving
**Key Responsibilities**:

- Processes ZIP file uploads containing SCORM packages
- Extracts and validates SCORM manifest files
- Serves SCORM content to learners
- Tracks SCORM learning progress and completion

**Key Features**:

- ZIP file processing and validation
- SCORM manifest parsing (XML)
- Entry point detection for SCORM content
- File size limits (50MB)
- Unique file naming with UUIDs
- Progress tracking integration

### `image-handler.ts` - Image File Management

**Purpose**: Manages image uploads for course content and user avatars
**Key Responsibilities**:

- Handles image file uploads with validation
- Generates unique filenames for uploaded images
- Serves uploaded images to clients
- Manages image storage and retrieval

**Key Features**:

- Multiple image format support (JPG, PNG, GIF, SVG)
- File size validation (5MB limit)
- Unique filename generation with UUIDs
- Static file serving
- Error handling and validation

### `media-handler.ts` - General Media File Management

**Purpose**: Comprehensive media file handling for various content types
**Key Responsibilities**:

- Manages uploads of images, PDFs, videos, and audio files
- Handles bulk file uploads (up to 20 files)
- Integrates with database for file metadata
- Provides file serving and management endpoints

**Key Features**:

- Multi-format support (images, PDFs, videos, audio)
- Bulk upload processing
- Database integration for file metadata
- File size limits (50MB per file)
- Unique filename generation
- File deletion and management

### `certificate-handler.ts` - Certificate Template Management

**Purpose**: Handles certificate template uploads for course completion certificates
**Key Responsibilities**:

- Processes certificate template uploads
- Validates template file formats
- Manages template storage and retrieval
- Supports multiple file formats (images, PDFs)

**Key Features**:

- Template format validation
- File size limits (10MB)
- Unique filename generation
- Multiple format support (JPG, PNG, PDF)
- Error handling and validation

---

## Business Logic Services

### `badge-assignment-service.ts` - Achievement System

**Purpose**: Manages automatic badge assignment based on user achievements
**Key Responsibilities**:

- Automatically awards badges for various accomplishments
- Tracks assessment and course completion milestones
- Integrates with notification system
- Manages badge assignment logic

**Key Features**:

- Assessment-based badges (first assessment, perfect score)
- Course completion badges
- Special achievement badges (Abu Dhabi Expert)
- Automatic badge checking and assignment
- Notification integration for badge awards

### `notification-triggers.ts` - Automated Notifications

**Purpose**: Triggers system notifications for various user activities
**Key Responsibilities**:

- Automatically creates notifications for user actions
- Manages different notification types
- Integrates with storage system for persistence
- Provides contextual notification messages

**Key Features**:

- Course assignment notifications
- Badge achievement notifications
- Course completion notifications
- Certificate award notifications
- Leaderboard update notifications
- Welcome notifications for new users

### `excel-upload-handler.ts` - Bulk User Import

**Purpose**: Handles bulk user creation from Excel/CSV files
**Key Responsibilities**:

- Processes Excel and CSV file uploads
- Validates user data from spreadsheets
- Creates multiple users in batch operations
- Handles password generation and role assignment

**Key Features**:

- Excel and CSV file support
- Header-based data validation
- Bulk user creation
- Password hashing and generation
- Error handling for invalid data
- File size limits (5MB)

---

## Development & Build

### `vite.ts` - Development Server Integration

**Purpose**: Integrates Vite development server with Express backend
**Key Responsibilities**:

- Sets up Vite middleware for development
- Handles hot module replacement (HMR)
- Manages static file serving in production
- Provides development vs production environment handling

**Key Features**:

- Vite development server integration
- Hot module replacement support
- Production static file serving
- Environment-based configuration
- Error handling and logging

---

## Architecture Patterns

### Design Principles

1. **Separation of Concerns**: Each file has a single, well-defined responsibility
2. **Interface Segregation**: Storage interface provides clean abstraction
3. **Dependency Injection**: Services receive dependencies through constructor injection
4. **Error Handling**: Comprehensive error handling throughout the system
5. **Type Safety**: Full TypeScript integration with shared schemas

### Security Features

1. **Authentication**: Passport.js with session management
2. **Authorization**: Role-based access control system
3. **Input Validation**: File type and size validation
4. **Session Security**: Secure session configuration
5. **Password Security**: Multiple hashing algorithms with bcrypt

### Performance Optimizations

1. **Connection Pooling**: Database connection management
2. **File Streaming**: Efficient file serving
3. **Caching**: Session storage optimization
4. **Async Operations**: Non-blocking I/O operations
5. **Resource Limits**: File size and upload limits

### Scalability Considerations

1. **Modular Architecture**: Easy to extend and modify
2. **Database Abstraction**: Storage interface allows backend changes
3. **File Storage**: Configurable storage backends
4. **Environment Configuration**: Development vs production handling
5. **Error Recovery**: Fallback mechanisms for critical services

---

## File Dependencies

### Core Dependencies

- `index.ts` → `routes.ts`, `vite.ts`
- `routes.ts` → All handler files, `storage.ts`, `auth.ts`
- `storage.ts` → `db.ts`, shared schemas
- `database-storage.ts` → `storage.ts`, `db.ts`

### External Dependencies

- **Express**: Web framework
- **PostgreSQL**: Database
- **Drizzle ORM**: Database query builder
- **Passport.js**: Authentication
- **Multer**: File upload handling
- **PDF-lib**: PDF generation
- **XLSX**: Excel file processing

---

## Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption secret
- `NODE_ENV`: Environment (development/production)

### File Storage Paths

- Images: `public/uploads/images/`
- Media: `uploads/media/`
- SCORM: `uploads/scorm-packages/`
- Certificates: `public/uploads/images/`

### Server Configuration

- Port: 5000 (fixed for firewall compatibility)
- Host: 0.0.0.0 (all interfaces)
- File size limits: 5-50MB depending on type
- Session timeout: 24 hours

---

This server architecture provides a robust, scalable foundation for the VX Academy learning management system, with comprehensive file handling, secure authentication, and efficient database operations.
