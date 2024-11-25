-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quiz_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 5,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("correct_answer", "created_at", "id", "marks", "options", "question", "quiz_id", "updated_at") SELECT "correct_answer", "created_at", "id", "marks", "options", "question", "quiz_id", "updated_at" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE TABLE "new_quizzes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "quizzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_quizzes" ("created_at", "description", "id", "status", "title", "updated_at", "user_id") SELECT "created_at", "description", "id", "status", "title", "updated_at", "user_id" FROM "quizzes";
DROP TABLE "quizzes";
ALTER TABLE "new_quizzes" RENAME TO "quizzes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
