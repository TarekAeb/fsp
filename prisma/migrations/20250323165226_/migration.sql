/*
  Warnings:

  - You are about to drop the column `category` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `episodeNumber` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `searchCount` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoSearch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "VideoSearch" DROP CONSTRAINT "VideoSearch_movieId_fkey";

-- DropForeignKey
ALTER TABLE "VideoSearch" DROP CONSTRAINT "VideoSearch_userId_fkey";

-- DropForeignKey
ALTER TABLE "VideoView" DROP CONSTRAINT "VideoView_movieId_fkey";

-- DropForeignKey
ALTER TABLE "VideoView" DROP CONSTRAINT "VideoView_userId_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "category",
DROP COLUMN "episodeNumber",
DROP COLUMN "searchCount",
DROP COLUMN "seriesId",
DROP COLUMN "videoUrl",
DROP COLUMN "viewCount";

-- DropTable
DROP TABLE "Series";

-- DropTable
DROP TABLE "VideoSearch";

-- DropTable
DROP TABLE "VideoView";

-- DropEnum
DROP TYPE "VideoCategory";
