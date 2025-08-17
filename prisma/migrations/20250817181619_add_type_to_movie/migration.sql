/*
  Warnings:

  - Added the required column `type` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MovieType" AS ENUM ('short_movie', 'documentary', 'animation');

-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "type" "public"."MovieType" NOT NULL;

-- CreateTable
CREATE TABLE "public"."VideoQuality" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "quality" VARCHAR(10) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "bitrate" VARCHAR(20),
    "codec" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoSubtitle" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoQuality_movieId_quality_key" ON "public"."VideoQuality"("movieId", "quality");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_movieId_language_key" ON "public"."VideoSubtitle"("movieId", "language");

-- AddForeignKey
ALTER TABLE "public"."VideoQuality" ADD CONSTRAINT "VideoQuality_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
