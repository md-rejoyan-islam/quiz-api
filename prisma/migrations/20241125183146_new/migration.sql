-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "refresh_token" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "quizzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quiz_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 5,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "submitted_answers" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "percentage" REAL NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "wrong" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");
