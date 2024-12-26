/*
  Warnings:

  - You are about to drop the column `tit` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "tit",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
