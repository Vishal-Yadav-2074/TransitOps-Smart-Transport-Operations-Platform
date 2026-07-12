-- TransitOps Centralized Fleet Operations Schema

CREATE DATABASE IF NOT EXISTS `transitops_db`;
USE `transitops_db`;

-- 1. Users Table (Authentication and Role categories)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `role` ENUM('Driver', 'Safety Officer', 'Financial Analyst', 'Fleet Manager') NOT NULL DEFAULT 'Driver',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `registration_no` VARCHAR(50) UNIQUE NOT NULL,
  `vehicle_type` ENUM('van', 'truck', 'trailer', 'bike') NOT NULL DEFAULT 'van',
  `max_capacity` DECIMAL(10,2) NOT NULL,
  `odometer` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `acquisition_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `state` ENUM('available', 'on_trip', 'in_shop', 'retired') NOT NULL DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `license_no` VARCHAR(50) UNIQUE NOT NULL,
  `license_category` VARCHAR(50) NOT NULL,
  `license_expiry` DATE NOT NULL,
  `contact_no` VARCHAR(20) DEFAULT NULL,
  `safety_score` DECIMAL(5,2) DEFAULT 100.00,
  `state` ENUM('available', 'on_trip', 'off_duty', 'suspended') NOT NULL DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS `trips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `source` VARCHAR(255) NOT NULL,
  `dest` VARCHAR(255) NOT NULL,
  `vehicle_id` INT NOT NULL,
  `driver_id` INT NOT NULL,
  `cargo_weight` DECIMAL(10,2) NOT NULL,
  `planned_dist` DECIMAL(10,2) NOT NULL,
  `revenue` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `state` ENUM('draft', 'dispatched', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Maintenances Table
CREATE TABLE IF NOT EXISTS `maintenances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `vehicle_id` INT NOT NULL,
  `cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `date` DATE NOT NULL,
  `state` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `vehicle_id` INT NOT NULL,
  `expense_type` ENUM('fuel', 'toll', 'other') NOT NULL DEFAULT 'fuel',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default User Seeds (Password is: password123)
-- Hash: $2a$10$8908f9/YwKqUf3rL93G9Ie4G8F8D69A.WJ0D.yv85/hVpE52m0v9e
INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('manager', '$2a$10$8908f9/YwKqUf3rL93G9Ie4G8F8D69A.WJ0D.yv85/hVpE52m0v9e', 'manager@transitops.com', 'Fleet Manager')
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('driver1', '$2a$10$8908f9/YwKqUf3rL93G9Ie4G8F8D69A.WJ0D.yv85/hVpE52m0v9e', 'driver1@transitops.com', 'Driver')
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('safety', '$2a$10$8908f9/YwKqUf3rL93G9Ie4G8F8D69A.WJ0D.yv85/hVpE52m0v9e', 'safety@transitops.com', 'Safety Officer')
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('analyst', '$2a$10$8908f9/YwKqUf3rL93G9Ie4G8F8D69A.WJ0D.yv85/hVpE52m0v9e', 'analyst@transitops.com', 'Financial Analyst')
ON DUPLICATE KEY UPDATE `username`=`username`;
