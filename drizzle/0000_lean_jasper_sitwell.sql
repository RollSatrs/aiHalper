CREATE TYPE "public"."ticket_status" AS ENUM('new', 'in-progress', 'closed_auto', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'operator');--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ticket_id" integer,
	"message" text NOT NULL,
	"reply" text,
	"is_question" boolean DEFAULT true NOT NULL,
	"is_ticket_created" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"message" text NOT NULL,
	"category" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"priority" varchar(50) NOT NULL,
	"is_simple" boolean DEFAULT false NOT NULL,
	"status" "ticket_status" DEFAULT 'new' NOT NULL,
	"auto_solved" boolean DEFAULT false NOT NULL,
	"summary" text,
	"draft_response" text,
	"auto_solution" text,
	"response_time" integer,
	"classification_correct" boolean,
	"routing_error" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;