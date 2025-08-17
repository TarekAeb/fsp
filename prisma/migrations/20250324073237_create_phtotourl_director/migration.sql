/*
  Warnings:

  - Added the required column `photoUrl` to the `Director` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Director" ADD COLUMN     "photoUrl" TEXT NOT NULL;
