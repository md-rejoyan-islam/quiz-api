/*
  Warnings:

  - A unique constraint covering the columns `[user_id,quiz_id]` on the table `quiz_set_ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "quiz_set_ratings_user_id_quiz_id_key" ON "quiz_set_ratings"("user_id", "quiz_id");
