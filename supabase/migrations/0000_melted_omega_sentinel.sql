CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"access_token" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
