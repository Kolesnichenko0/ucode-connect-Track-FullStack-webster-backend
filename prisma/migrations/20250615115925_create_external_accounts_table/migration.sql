-- CreateTable
CREATE TABLE `external_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('google') NOT NULL,
    `account_id` VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `refresh_token` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_external_accounts_user_id`(`user_id`),
    UNIQUE INDEX `uq_external_accounts_account_id_provider`(`account_id`, `provider`),
    UNIQUE INDEX `uq_external_accounts_user_id_provider`(`user_id`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `external_accounts` ADD CONSTRAINT `external_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
