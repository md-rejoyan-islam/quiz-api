-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_reset_expires" DATETIME;
ALTER TABLE "users" ADD COLUMN "password_reset_token" TEXT;
