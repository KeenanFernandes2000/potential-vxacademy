# Abu Dhabi VX Academy – Technical Documentation

VX Academy is an advanced AI-powered training platform focused on providing personalized, gamified, and interactive learning experiences for Abu Dhabi’s tourism and hospitality professionals.

## 🧩 **Project Architecture**

### Frontend

- **Framework**: React 18, TypeScript
- **Styling/UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: TanStack Query for server state
- **Rich Media & Interactivity**: Video streaming, SCORM packages, interactive quizzes
- **Animation**: Framer Motion

### Backend

- **Framework**: Node.js with Express.js
- **Authentication**: Passport.js (session-based)
- **Database**: PostgreSQL managed with Drizzle ORM
- **Session Management**: PostgreSQL-backed session store
- **File Upload**: Multer (for media, SCORM packages, bulk Excel uploads)
- **PDF Generation**: PDF-lib (for certificates)
- **AI Integration**: OpenAI for tutoring & recommendations

### Database

- PostgreSQL (Neon Serverless)
- Schema managed with Drizzle ORM
- Key entities: Users, Roles, Training Areas, Modules, Courses, Units, Learning Blocks, Assessments, Questions, Media Files, SCORM Packages, Certificates

### Infrastructure & Deployment

- **Development & Hosting**: Replit integrated IDE environment
- **Frontend Build**: Vite
- **Backend Build**: esbuild
- **File Storage**: Organized local file system

## 🔑 **System Components**

### Content Hierarchy

```
Training Areas
 └─ Modules
    └─ Courses
       └─ Units
          └─ Learning Blocks
             └─ Assessments
                └─ Questions
```

### User Management

- Role-based (Admin, Sub-Admin, User)
- Bulk user management (Excel uploads)
- Comprehensive profile & permission system

### Assessment System

- MCQ, open-ended, video questions
- Automated grading, retake policies, timed tests
- Certificates upon successful completion

### Gamification

- XP points, badges, certificates, leaderboards
- Engaging learning paths with milestone recognition

### AI-Powered Features

- Personalized learning recommendations
- Real-time tutoring and content optimization
- Multilingual AI support (OpenAI & Potential.com)

## 🚦 **Security & Compliance**

- GDPR & UAE data law compliance
- Role-based access control
- Secure authentication (bcrypt hashing)
- Protection against SQL injection & XSS
- Secure file upload handling (Multer)

## 📈 **Analytics & Monitoring**

- Real-time dashboards: user activity, course performance, assessments
- Data export capabilities for external analysis

## 🛠️ **Development Workflow**

### Setup Instructions

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Key Scripts

- `npm run dev`: Starts dev server with hot reload
- `npm run build`: Production build
- `npm run db:push`: Push schema to database
- `npm run db:seed`: Seed database with initial data

## 📅 **Future Roadmap**

- Mobile application (iOS, Android)
- Offline content synchronization
- Enhanced analytics with ML insights
- Integration with VR for immersive training experiences

---

These README files address both high-level overview needs for stakeholders and comprehensive technical requirements for development teams. Let me know if any adjustments are needed!
