CREATE TABLE "ai_tutor_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"messages" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"assessment_id" integer NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" json,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_area_id" integer,
	"module_id" integer,
	"unit_id" integer,
	"course_id" integer,
	"title" text NOT NULL,
	"description" text,
	"placement" text DEFAULT 'end' NOT NULL,
	"is_graded" boolean DEFAULT true NOT NULL,
	"show_correct_answers" boolean DEFAULT false NOT NULL,
	"passing_score" integer,
	"has_time_limit" boolean DEFAULT false NOT NULL,
	"time_limit" integer,
	"max_retakes" integer DEFAULT 3 NOT NULL,
	"has_certificate" boolean DEFAULT false NOT NULL,
	"certificate_template" text,
	"xp_points" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"xp_points" integer DEFAULT 100 NOT NULL,
	"type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "block_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"block_id" integer NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"certificate_number" text NOT NULL,
	"issue_date" timestamp DEFAULT now(),
	"expiry_date" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"enrollment_source" text DEFAULT 'manual',
	CONSTRAINT "course_enrollments_user_id_course_id" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "course_prerequisites" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"prerequisite_course_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_area_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"internal_note" text,
	"course_type" text DEFAULT 'free' NOT NULL,
	"duration" integer NOT NULL,
	"show_duration" boolean DEFAULT true NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"show_level" boolean DEFAULT true NOT NULL,
	"estimated_duration" text,
	"difficulty_level" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"active_users" integer DEFAULT 0 NOT NULL,
	"new_users" integer DEFAULT 0 NOT NULL,
	"new_enrollments" integer DEFAULT 0 NOT NULL,
	"course_completions" integer DEFAULT 0 NOT NULL,
	"assessment_attempts" integer DEFAULT 0 NOT NULL,
	"average_session_duration" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_analytics_date" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "learning_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"video_url" text,
	"image_url" text,
	"interactive_data" json,
	"scorm_package_id" integer,
	"order" integer NOT NULL,
	"xp_points" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"url" text NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_area_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text DEFAULT 'mcq' NOT NULL,
	"options" json,
	"correct_answer" text,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_mandatory_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "role_mandatory_courses_role_id_course_id" UNIQUE("role_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"assets" text NOT NULL,
	"role_category" text NOT NULL,
	"seniority" text NOT NULL,
	"description" text,
	"permissions" json,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "scorm_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"version" text,
	"folder_path" text NOT NULL,
	"entry_point" text NOT NULL,
	"manifest_data" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scorm_tracking_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scorm_package_id" integer NOT NULL,
	"lesson_status" text,
	"location" text,
	"suspend_data" text,
	"score" integer,
	"completion_status" text,
	"total_time" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"internal_note" text,
	"order" integer DEFAULT 1 NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"show_duration" boolean DEFAULT true NOT NULL,
	"xp_points" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"activity" text NOT NULL,
	"metadata" json,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"percent_complete" integer DEFAULT 0 NOT NULL,
	"last_accessed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_by" integer,
	"language" text DEFAULT 'en' NOT NULL,
	"nationality" text,
	"years_of_experience" text,
	"assets" text,
	"role_category" text,
	"sub_category" text,
	"seniority" text,
	"organization_name" text,
	"xp_points" integer DEFAULT 0 NOT NULL,
	"avatar" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_courses_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_mandatory_courses" ADD CONSTRAINT "role_mandatory_courses_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_mandatory_courses" ADD CONSTRAINT "role_mandatory_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;