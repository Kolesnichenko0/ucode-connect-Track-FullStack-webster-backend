-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_preview_file_id_fkey`;

-- DropIndex
DROP INDEX `uq_fk_projects_preview_file_id` ON `projects`;

-- CreateIndex
CREATE INDEX `idx_projects_preview_file_id` ON `projects`(`preview_file_id`);

-- AddForeignKey
-- ALTER TABLE `files` ADD CONSTRAINT `files_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
