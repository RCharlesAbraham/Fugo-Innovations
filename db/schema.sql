-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 03, 2025 at 06:55 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `data_fugo`
--

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `path`, `alt_text`, `created_at`) VALUES
(1, 'Images/BG1.jpg', 'Background 1', '2025-11-03 05:40:05'),
(2, 'Images/BG2.jpg', 'Background 2', '2025-11-03 05:40:05'),
(3, 'Images/BG3.jpg', 'Background 3', '2025-11-03 05:40:05'),
(4, 'Images/BG4.jpg', 'Background 4', '2025-11-03 05:40:05'),
(5, 'Images/BG5.jpg', 'Background 5', '2025-11-03 05:40:05'),
(6, 'Images/Logo.png', 'Fugo Innovations logo', '2025-11-03 05:40:05');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text,
  `service_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `service_id`, `status`, `created_at`) VALUES
(1, 'Alice Smith', 'alice@example.com', 'I\'m interested in Cloud Hosting for a startup. Can you provide estimated costs for 50 users?', 1, 'new', '2025-11-03 05:40:05'),
(2, 'Bob Johnson', 'bob@example.com', 'We need a web app for our e-commerce store. What is your typical timeline?', 2, 'new', '2025-11-03 05:40:05'),
(3, 'Charlie Lee', 'charlie@example.com', 'Do you offer maintenance packages after launch?', NULL, 'new', '2025-11-03 05:40:05');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `long_desc` text,
  `price` decimal(10,2) DEFAULT '0.00',
  `image` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `short_desc`, `long_desc`, `price`, `image`, `active`, `created_at`) VALUES
(1, 'Cloud Hosting', 'Scalable cloud hosting', 'Managed cloud hosting with auto-scaling, backups and 24/7 support.', 199.00, 'Images/BG1.jpg', 1, '2025-11-03 05:40:05'),
(2, 'Web Development', 'Modern responsive websites', 'Full-stack web development: UI/UX, frontend, backend, and deployment.', 2999.00, 'Images/BG2.jpg', 1, '2025-11-03 05:40:05'),
(3, 'Mobile App', 'iOS & Android apps', 'Native and cross-platform mobile app development with analytics integration.', 4999.00, 'Images/BG3.jpg', 1, '2025-11-03 05:40:05'),
(4, 'Data Analytics', 'Insights & dashboards', 'Data pipeline setup, dashboards, and predictive analytics.', 2499.00, 'Images/BG4.jpg', 1, '2025-11-03 05:40:05'),
(5, 'AI Consulting', 'ML & AI strategy', 'Proof-of-concepts, model training, and MLOps guidance.', 3999.00, 'Images/BG5.jpg', 1, '2025-11-03 05:40:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`, `created_at`) VALUES
(1, 'admin', 'admin123', 'admin', 'admin@example.com', '2025-11-03 05:40:05'),
(2, 'alice', 'alicepass', 'user', 'alice@example.com', '2025-11-03 05:40:05'),
(3, 'bob', 'bobpass', 'user', 'bob@example.com', '2025-11-03 05:40:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inquiry_service` (`service_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `fk_inquiry_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
