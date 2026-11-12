ALTER TABLE `Vehicle`
  ADD CONSTRAINT `Vehicle_positive_rates` CHECK (`dailyPrice` > 0 AND `weeklyPrice` > 0 AND `monthlyPrice` > 0),
  ADD CONSTRAINT `Vehicle_discount_bounds` CHECK ((`weeklyDiscount` IS NULL OR (`weeklyDiscount` >= 0 AND `weeklyDiscount` <= 100)) AND (`monthlyDiscount` IS NULL OR (`monthlyDiscount` >= 0 AND `monthlyDiscount` <= 100))),
  ADD CONSTRAINT `Vehicle_seat_bounds` CHECK (`seats` BETWEEN 1 AND 20);
ALTER TABLE `Reservation`
  ADD CONSTRAINT `Reservation_period` CHECK (`returnAt` > `pickupAt` AND `days` > 0),
  ADD CONSTRAINT `Reservation_total` CHECK (`total` >= 0 AND `currency` = 'MAD');
ALTER TABLE `PricingSettings`
  ADD CONSTRAINT `PricingSettings_singleton` CHECK (`id` = 1),
  ADD CONSTRAINT `PricingSettings_bounds` CHECK (`weeklyDiscount` BETWEEN 0 AND 100 AND `monthlyDiscount` BETWEEN 0 AND 100 AND `pendingExpiryHours` BETWEEN 1 AND 720);
ALTER TABLE `VehicleMaintenance` ADD CONSTRAINT `Maintenance_period` CHECK (`endAt` > `startAt`);
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_valid_amount` CHECK (`amount` > 0 AND `currency` = 'MAD');
