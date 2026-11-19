-- AlterTable
ALTER TABLE `pricingsettings` ADD COLUMN `partnerMarkup` DECIMAL(5, 2) NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `agencyId` VARCHAR(191) NULL,
    ADD COLUMN `commissionRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `platformMarkup` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `supplierSubtotal` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `agencyId` VARCHAR(191) NULL,
    ADD COLUMN `listingStatus` VARCHAR(191) NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE `Agency` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `commissionOverride` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Agency_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgencySession` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `agencyId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AgencySession_tokenHash_key`(`tokenHash`),
    INDEX `AgencySession_agencyId_expiresAt_idx`(`agencyId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_agencyId_fkey` FOREIGN KEY (`agencyId`) REFERENCES `Agency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_agencyId_fkey` FOREIGN KEY (`agencyId`) REFERENCES `Agency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgencySession` ADD CONSTRAINT `AgencySession_agencyId_fkey` FOREIGN KEY (`agencyId`) REFERENCES `Agency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

