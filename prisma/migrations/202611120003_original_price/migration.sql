ALTER TABLE `Reservation` ADD COLUMN `originalPricingSnapshot` JSON NULL;
UPDATE `Reservation` r SET `originalPricingSnapshot` = COALESCE((SELECT JSON_EXTRACT(h.`after`, '$.pricingSnapshot') FROM `ReservationHistory` h WHERE h.`reservationId` = r.`id` AND h.`action` = 'CREATED' ORDER BY h.`createdAt` ASC LIMIT 1), r.`pricingSnapshot`);
ALTER TABLE `Reservation` MODIFY `originalPricingSnapshot` JSON NOT NULL;
