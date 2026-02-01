/*
  Warnings:

  - Made the column `expiresAt` on table `Enrollment` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "preTestCompleted" BOOLEAN NOT NULL DEFAULT false,
    "videosCompleted" BOOLEAN NOT NULL DEFAULT false,
    "postTestCompleted" BOOLEAN NOT NULL DEFAULT false,
    "skipPrePostTest" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("courseId", "enrolledAt", "expiresAt", "hasPaid", "id", "postTestCompleted", "preTestCompleted", "skipPrePostTest", "userId", "videosCompleted") SELECT "courseId", "enrolledAt", "expiresAt", "hasPaid", "id", "postTestCompleted", "preTestCompleted", "skipPrePostTest", "userId", "videosCompleted" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
