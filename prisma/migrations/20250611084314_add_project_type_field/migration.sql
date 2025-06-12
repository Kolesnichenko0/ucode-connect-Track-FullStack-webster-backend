/*
  Warnings:

  - Added the required column `type` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projects` ADD COLUMN `type` VARCHAR(50) NOT NULL;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_preview_file_id_fkey` FOREIGN KEY (`preview_file_id`) REFERENCES `files`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
