-- AlterTable
ALTER TABLE `payment` ADD COLUMN `kind` VARCHAR(191) NOT NULL DEFAULT 'RENTAL',
    ADD COLUMN `memo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pricingsettings` ADD COLUMN `airportHandoverFee` DECIMAL(12, 2) NULL,
    ADD COLUMN `rentalTerms` TEXT NULL,
    ADD COLUMN `securityDeposit` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `arrivalTime` VARCHAR(191) NULL,
    ADD COLUMN `flightNumber` VARCHAR(191) NULL,
    ADD COLUMN `meetingPoint` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BookingRequest` (
    `id` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `response` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    INDEX `BookingRequest_reservationId_status_idx`(`reservationId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalInspection` (
    `id` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `odometer` INTEGER NOT NULL,
    `fuelPercent` INTEGER NOT NULL,
    `conditionNotes` TEXT NOT NULL,
    `checklist` JSON NOT NULL,
    `photos` JSON NOT NULL,
    `adminName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RentalInspection_reservationId_kind_key`(`reservationId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookingRequest` ADD CONSTRAINT `BookingRequest_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalInspection` ADD CONSTRAINT `RentalInspection_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

