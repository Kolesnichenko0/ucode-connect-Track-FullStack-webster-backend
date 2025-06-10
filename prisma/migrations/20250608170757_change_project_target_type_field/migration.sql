-- AlterTable
ALTER TABLE `files` MODIFY `target_type` ENUM('user_avatar', 'project_asset', 'project_preview', 'font_asset', 'project_background', 'project_element') NOT NULL;
