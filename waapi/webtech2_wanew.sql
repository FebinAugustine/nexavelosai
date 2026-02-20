-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 27, 2024 at 08:47 PM
-- Server version: 5.7.23-23
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webtech2_wanew`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_role_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `activity` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`_id`, `created_at`, `user_id`, `user_role_id`, `vendor_id`, `activity`) VALUES
(1, '2024-11-13 17:29:46', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(2, '2024-11-13 17:30:02', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(3, '2024-11-13 17:30:13', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(4, '2024-11-13 17:31:07', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(5, '2024-11-13 18:07:20', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(6, '2024-11-13 18:07:21', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(7, '2024-11-13 18:10:48', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(8, '2024-11-13 18:10:53', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(9, '2024-11-13 18:10:55', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(10, '2024-11-13 18:10:55', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(11, '2024-11-13 18:10:56', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(12, '2024-11-13 18:11:36', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(13, '2024-11-13 18:16:39', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(14, '2024-11-13 18:22:52', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(15, '2024-11-13 18:25:10', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(16, '2024-11-13 18:26:02', NULL, NULL, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(17, '2024-11-13 18:26:05', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(18, '2024-11-13 19:56:23', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(19, '2024-11-13 20:14:21', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(20, '2024-11-13 20:43:59', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(21, '2024-11-13 20:44:03', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(22, '2024-11-13 20:44:04', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(23, '2024-11-13 20:44:04', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(24, '2024-11-13 20:44:05', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(25, '2024-11-13 21:45:35', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(26, '2024-11-13 22:22:16', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(27, '2024-11-14 01:56:50', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(28, '2024-11-14 02:03:56', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(29, '2024-11-14 04:07:43', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(30, '2024-11-14 04:09:39', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(31, '2024-11-14 04:14:08', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(32, '2024-11-14 04:24:59', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(33, '2024-11-14 04:38:42', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(34, '2024-11-14 04:39:24', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(35, '2024-11-14 05:02:39', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(36, '2024-11-14 05:05:28', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(37, '2024-11-16 16:47:24', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(38, '2024-11-16 16:48:03', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(39, '2024-11-16 16:48:25', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(40, '2024-11-16 16:49:10', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(41, '2024-11-16 16:49:26', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(42, '2024-11-16 16:49:49', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(43, '2024-11-16 16:50:02', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(44, '2024-11-16 16:56:06', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(45, '2024-11-16 16:59:56', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(46, '2024-11-16 17:00:13', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(47, '2024-11-16 17:00:20', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(48, '2024-11-16 17:01:44', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(49, '2024-11-16 17:02:14', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(50, '2024-11-16 17:04:26', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(51, '2024-11-16 17:05:01', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(52, '2024-11-16 17:05:54', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(53, '2024-11-16 17:07:32', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(54, '2024-11-16 17:07:57', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(55, '2024-11-16 17:12:23', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(56, '2024-11-17 10:18:58', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(57, '2024-11-17 10:20:40', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(58, '2024-11-17 10:21:37', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(59, '2024-11-17 10:21:56', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(60, '2024-11-17 10:23:43', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(61, '2024-11-17 11:41:15', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(62, '2024-11-17 11:41:39', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(63, '2024-11-17 11:45:16', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(64, '2024-11-17 14:07:52', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(65, '2024-11-17 14:13:35', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(66, '2024-11-17 14:15:35', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(67, '2024-11-17 16:07:45', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(68, '2024-11-17 16:09:01', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(69, '2024-11-17 17:24:46', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(70, '2024-11-17 17:51:13', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(71, '2024-11-17 21:21:55', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(72, '2024-11-17 21:23:39', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(73, '2024-11-17 21:25:31', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(74, '2024-11-17 21:26:26', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(75, '2024-11-18 15:42:45', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(76, '2024-11-18 15:43:23', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(77, '2024-11-18 16:40:14', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(78, '2024-11-18 16:47:01', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(79, '2024-11-18 17:30:51', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(80, '2024-11-19 03:21:54', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(81, '2024-11-19 16:57:09', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(82, '2024-11-19 19:34:51', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(83, '2024-11-19 19:34:52', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(84, '2024-11-19 19:35:35', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(85, '2024-11-19 19:35:36', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(86, '2024-11-19 19:35:36', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(87, '2024-11-19 19:35:37', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(88, '2024-11-19 19:41:59', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(89, '2024-11-19 19:42:03', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(90, '2024-11-19 19:42:04', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(91, '2024-11-19 19:42:04', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(92, '2024-11-19 19:42:05', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(93, '2024-11-19 21:12:38', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(94, '2024-11-19 21:48:23', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(95, '2024-11-21 15:37:47', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(96, '2024-11-21 15:38:36', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(97, '2024-11-21 15:42:53', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(98, '2024-11-21 15:49:20', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(99, '2024-11-21 15:54:53', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(100, '2024-11-21 15:55:01', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(101, '2024-11-21 16:09:15', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(102, '2024-11-21 16:33:25', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(103, '2024-11-21 16:34:09', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(104, '2024-11-21 16:40:02', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(105, '2024-11-21 16:43:55', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(106, '2024-11-21 16:43:57', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(107, '2024-11-21 16:44:03', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(108, '2024-11-21 16:57:56', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(109, '2024-11-21 19:08:14', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(110, '2024-11-22 11:23:48', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(111, '2024-11-22 15:48:59', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(112, '2024-11-22 15:49:03', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(113, '2024-11-22 15:49:05', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(114, '2024-11-22 15:49:05', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(115, '2024-11-22 15:49:06', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(116, '2024-11-23 10:54:21', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(117, '2024-11-23 10:54:22', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(118, '2024-11-23 10:55:11', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(119, '2024-11-23 10:55:15', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(120, '2024-11-23 10:55:16', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(121, '2024-11-23 10:55:16', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(122, '2024-11-23 10:55:17', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(123, '2024-11-23 10:55:36', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(124, '2024-11-23 10:55:36', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(125, '2024-11-23 10:55:51', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(126, '2024-11-23 10:56:01', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(127, '2024-11-23 11:26:27', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(128, '2024-11-24 18:55:17', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(129, '2024-11-24 19:14:50', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(130, '2024-11-24 19:29:36', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(131, '2024-11-24 19:29:40', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(132, '2024-11-24 19:29:42', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(133, '2024-11-24 19:29:46', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(134, '2024-11-24 19:30:39', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(135, '2024-11-24 19:30:51', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(136, '2024-11-24 19:31:34', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(137, '2024-11-24 19:31:45', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(138, '2024-11-24 19:32:03', 8, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(139, '2024-11-24 20:14:31', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(140, '2024-11-25 03:59:48', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(141, '2024-11-25 04:00:52', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(142, '2024-11-25 04:00:52', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(143, '2024-11-25 04:03:18', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(144, '2024-11-25 04:03:23', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(145, '2024-11-25 04:03:24', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(146, '2024-11-25 04:03:24', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(147, '2024-11-25 04:03:25', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(148, '2024-11-25 04:03:48', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(149, '2024-11-25 05:33:01', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(150, '2024-11-25 06:36:33', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(151, '2024-11-25 06:36:45', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(152, '2024-11-25 06:36:48', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(153, '2024-11-25 06:45:00', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(154, '2024-11-25 06:45:03', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(155, '2024-11-25 09:39:18', 7, 2, 6, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(156, '2024-11-30 21:40:58', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(157, '2024-11-30 21:41:02', 2, 2, 1, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(158, '2024-12-02 05:28:27', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(159, '2024-12-02 05:28:29', 13, 2, 11, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(160, '2024-12-02 05:28:30', 13, 2, 11, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(161, '2024-12-02 05:28:33', 13, 2, 11, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(162, '2024-12-02 05:29:20', 13, 2, 11, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(163, '2024-12-02 09:43:47', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(164, '2024-12-02 09:43:49', 15, 2, 13, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(165, '2024-12-02 09:43:50', 15, 2, 13, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(166, '2024-12-02 09:43:53', 15, 2, 13, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(167, '2024-12-02 09:53:17', 15, 2, 13, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(168, '2024-12-02 09:56:21', 15, 2, 13, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(169, '2024-12-02 10:54:39', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(170, '2024-12-02 10:54:40', 18, 2, 16, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(171, '2024-12-02 10:58:53', 18, 2, 16, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(172, '2024-12-02 10:58:57', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(173, '2024-12-02 10:58:58', 18, 2, 16, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(174, '2024-12-02 10:58:58', 18, 2, 16, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(175, '2024-12-02 10:58:59', 18, 2, 16, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(176, '2024-12-02 11:11:14', NULL, NULL, NULL, '{\"message\":\"vendor settings updated\",\"data\":\"[]\"}'),
(177, '2024-12-06 09:56:47', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(178, '2024-12-06 09:57:21', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(179, '2024-12-06 09:57:35', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(180, '2024-12-06 09:58:08', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(181, '2024-12-27 14:35:07', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(182, '2024-12-27 14:35:47', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(183, '2024-12-27 14:35:54', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(184, '2024-12-27 14:36:02', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(185, '2024-12-27 14:40:21', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(186, '2024-12-27 14:42:21', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(187, '2024-12-27 15:01:39', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(188, '2024-12-27 15:05:04', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(189, '2024-12-27 15:08:41', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(190, '2024-12-27 15:08:49', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}'),
(191, '2024-12-27 15:09:37', 1, 1, NULL, '{\"message\":\"Site configuration settings stored \\/ updated.\",\"data\":\"[]\"}');

-- --------------------------------------------------------

--
-- Table structure for table `bot_flows`
--

CREATE TABLE `bot_flows` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `start_trigger` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bot_replies`
--

CREATE TABLE `bot_replies` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `trigger_type` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'contains,is',
  `reply_trigger` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority_index` tinyint(3) UNSIGNED DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `bot_flows__id` int(10) UNSIGNED DEFAULT NULL,
  `bot_replies__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp_templates__id` int(10) UNSIGNED DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `users__id` int(10) UNSIGNED DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `template_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `template_language` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaign_groups`
--

CREATE TABLE `campaign_groups` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `campaigns__id` int(10) UNSIGNED NOT NULL,
  `contact_groups__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `configurations`
--

CREATE TABLE `configurations` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `data_type` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configurations`
--

INSERT INTO `configurations` (`_id`, `created_at`, `updated_at`, `name`, `value`, `data_type`) VALUES
(1, '2024-11-13 17:29:46', '2024-11-13 17:29:46', 'logo_name', '676ebb1b25320---logo.png', 1),
(2, '2024-11-13 17:30:02', '2024-11-13 17:30:02', 'small_logo_name', '676ebb434af59---64x64-pabbly.png', 1),
(3, '2024-11-13 17:30:13', '2024-11-13 17:30:13', 'favicon_name', '676ebb4a3bee1---double-check.png', 1),
(4, '2024-11-13 17:31:07', '2024-11-13 17:31:07', 'name', 'WiseSender WA Panel', 1),
(5, '2024-11-13 17:31:07', '2024-11-13 17:31:07', 'description', 'Welcome to WiseSender - Your Meta Verified Tech Solution Provider\r\nAt WiseSender Online, we bring you the power of Meta Verified technology through our streamlined user plan. Our standard plan is designed to cater to businesses of all sizes, offering a seamless integration of advanced tools and features to enhance your communication and automation needs.\r\n\r\nWhy Choose WiseSender Online?\r\nMeta Verified Excellence: Trusted and verified solutions for reliable performance.\r\nComprehensive Features: From bulk messaging to personalized outreach, auto-responders, and chatbots, we empower your business with cutting-edge tools.\r\nWhite-Label Solutions: Customize and brand your experience with our white-label offerings.\r\nUser-Friendly Interface: Simplified panel for easy navigation and usage.\r\nExceptional Support: Our team ensures smooth onboarding and continuous assistance.\r\nTransform your business communication today with WiseSender. Take the first step toward automation and growth.', 1),
(6, '2024-11-13 17:31:07', '2024-11-13 17:31:07', 'contact_email', 'support@wisesender.in', 1),
(7, '2024-11-13 17:31:07', '2024-11-13 17:31:07', 'default_language', 'en', 1),
(8, '2024-11-13 17:31:07', '2024-11-13 17:31:07', 'timezone', 'Asia/Kolkata', 1),
(9, '2024-11-13 18:22:52', '2024-11-13 18:22:52', 'broadcast_connection_driver', 'pusher', 1),
(10, '2024-11-13 18:22:52', '2024-11-13 18:22:52', 'pusher_app_id', 'eyJpdiI6IkgyQWpaVzB0dFRzNWQ3NkRva2FpdGc9PSIsInZhbHVlIjoic1lMSkY3aXhTak1kRGw2ME5xcmltUT09IiwibWFjIjoiYjNkZmZhN2ZjZTRjNjFlYmRmZTAyM2NkODE3M2I0MThjNzgyOTBhYThjNmUwNWNmM2ViODg3YTgwYTUzZGFhNyIsInRhZyI6IiJ9', 1),
(11, '2024-11-13 18:22:52', '2024-11-13 18:22:52', 'pusher_app_key', 'eyJpdiI6IjNTRDFpRFVLWWI5aUM4S1FMNzVkblE9PSIsInZhbHVlIjoiWXpHejFZUVk1Z21mL1hITnZ3aHhBTFhYSGRlUWZFYVhmQmhod05KQ2dwcz0iLCJtYWMiOiI5ZDBkMDdjNjg0ZjkxN2UyYTYzZTBiMmFiMWU0ZDgyMjQ5ZGY3MDU3ZTc0Y2VjNWE3YjQxMzNkZjllMTA0ODc1IiwidGFnIjoiIn0=', 1),
(12, '2024-11-13 18:22:52', '2024-11-13 18:22:52', 'pusher_app_secret', 'eyJpdiI6InN6RTl4Y0t5aHowVE9vRzR6Rkt0dWc9PSIsInZhbHVlIjoiZ256bmFaaElqczJIOXBOcXFuSDZDdDlGTll6UkVmYkVsbXVwbklUT2V0UT0iLCJtYWMiOiIzM2QxMTkxMWNlZjkzNTkzNmVmNTdjYmFmNjFjNmNiYzY2Yzk1ZjhiNzVkOWUzNTdmY2JmNzhhOWIyNDcwNTgxIiwidGFnIjoiIn0=', 1),
(13, '2024-11-13 18:22:52', '2024-11-13 18:22:52', 'pusher_app_cluster', 'eyJpdiI6IngvWmwvNmoyMWJKb3ZKR20yK213VGc9PSIsInZhbHVlIjoiRGh5UVVwb3JJT2J3b1FNdnhTc3pBUT09IiwibWFjIjoiNWIwYjM2YWE2NDQ2NGU0NWU4YzUzYjJiNzRhMjIyNDlmNGM0MjYwYjM0MTQ3MDZjZTBkN2UxN2EyNDEyNWMzYyIsInRhZyI6IiJ9', 1),
(14, '2024-11-13 18:25:10', '2024-11-13 18:25:10', 'cron_setup_done_at', '2024-11-13 18:22:53', 1),
(15, '2024-11-13 18:26:02', '2024-11-13 18:26:02', 'cron_setup_using_artisan_at', '2024-11-13 18:26:02', 1),
(16, '2024-11-13 18:30:38', '2024-11-13 18:30:38', 'subscription_plans', '{\"paid\":{\"plan_3\":{\"id\":\"plan_3\",\"enabled\":0,\"popular\":false,\"title\":\"Ultimate\",\"trial_days\":0,\"features\":{\"contacts\":{\"description\":\"Contacts\",\"limit\":\"-1\"},\"campaigns\":{\"limit_duration\":\"monthly\",\"limit_duration_title\":\"Per Month\",\"description\":\"Campaigns\",\"limit\":\"-1\"},\"bot_replies\":{\"description\":\"Bot Replies\",\"limit\":\"-1\"},\"bot_flows\":{\"description\":\"Bot Flows\",\"limit\":\"-1\"},\"contact_custom_fields\":{\"description\":\"Contact Custom Fields\",\"limit\":\"-1\"},\"system_users\":{\"description\":\"Team Members\\/Agents\",\"limit\":\"-1\"},\"ai_chat_bot\":{\"type\":\"switch\",\"description\":\"AI Chat Bot\",\"limit\":\"1\"},\"api_access\":{\"type\":\"switch\",\"description\":\"API and Webhook Access\",\"limit\":\"1\"}},\"charges\":{\"monthly\":{\"title\":\"monthly\",\"enabled\":0,\"price_id\":null,\"charge\":30},\"yearly\":{\"title\":\"yearly\",\"enabled\":0,\"price_id\":null,\"charge\":6000}}},\"plan_1\":{\"id\":\"plan_1\",\"enabled\":\"on\",\"popular\":true,\"title\":\"Standard\",\"trial_days\":0,\"features\":{\"contacts\":{\"description\":\"Contacts\",\"limit\":\"-1\"},\"campaigns\":{\"limit_duration\":\"monthly\",\"limit_duration_title\":\"Per Month\",\"description\":\"Campaigns\",\"limit\":\"-1\"},\"bot_replies\":{\"description\":\"Bot Replies\",\"limit\":\"-1\"},\"bot_flows\":{\"description\":\"Bot Flows\",\"limit\":\"-1\"},\"contact_custom_fields\":{\"description\":\"Contact Custom Fields\",\"limit\":\"-1\"},\"system_users\":{\"description\":\"Team Members\\/Agents\",\"limit\":\"-1\"},\"ai_chat_bot\":{\"type\":\"switch\",\"description\":\"AI Chat Bot\",\"limit\":\"1\"},\"api_access\":{\"type\":\"switch\",\"description\":\"API and Webhook Access\",\"limit\":\"1\"}},\"charges\":{\"monthly\":{\"title\":\"monthly\",\"enabled\":0,\"price_id\":null,\"charge\":10},\"yearly\":{\"title\":\"yearly\",\"enabled\":\"on\",\"price_id\":null,\"charge\":6000}}}},\"free\":{\"id\":\"free\",\"enabled\":\"on\",\"title\":\"Free Plan\",\"trial_days\":0,\"features\":{\"contacts\":{\"description\":\"Contacts\",\"limit\":\"10\"},\"campaigns\":{\"limit_duration\":\"monthly\",\"limit_duration_title\":\"Per Month\",\"description\":\"Campaigns\",\"limit\":\"5\"},\"bot_replies\":{\"description\":\"Bot Replies\",\"limit\":\"10\"},\"bot_flows\":{\"description\":\"Bot Flows\",\"limit\":\"10\"},\"contact_custom_fields\":{\"description\":\"Contact Custom Fields\",\"limit\":\"2\"},\"system_users\":{\"description\":\"Team Members\\/Agents\",\"limit\":\"5\"},\"ai_chat_bot\":{\"type\":\"switch\",\"description\":\"AI Chat Bot\",\"limit\":\"1\"},\"api_access\":{\"type\":\"switch\",\"description\":\"API and Webhook Access\",\"limit\":\"1\"}}}}', 4),
(17, '2024-11-13 19:56:23', '2024-11-13 19:56:23', 'currency', 'INR', 1),
(18, '2024-11-13 19:56:23', '2024-11-13 19:56:23', 'currency_symbol', '&#8377;', 1),
(19, '2024-11-13 19:56:23', '2024-11-13 19:56:23', 'currency_value', 'INR', 1),
(20, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'enable_vendor_registration', '1', 2),
(21, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'message_for_disabled_registration', '', 1),
(22, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'activation_required_for_new_user', '0', 2),
(23, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'send_welcome_email', '0', 2),
(24, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'welcome_email_content', 'Welcome to WiseSender – your trusted platform for seamless WhatsApp marketing! We\'re thrilled to have you on board and can’t wait to help you leverage the power of WhatsApp to boost your business.\r\n\r\nHere’s what you can do next:\r\n\r\n🌟 Explore Your Dashboard\r\nLog in to your account to access powerful tools for bulk messaging, chat automation, and personalized marketing campaigns.\r\n\r\n🌟 Learn the Basics\r\nVisit our Getting Started Guide to understand how to use the platform effectively.\r\n\r\n🌟 Need Assistance?\r\nOur support team is here to help you every step of the way. Feel free to reach out anytime.\r\n\r\n🔒 Keep Your Account Secure\r\nWe prfioritize your privacy and data security. Always safeguard your login credentials.\r\n\r\nOnce again, welcome aboard! Let’s create amazing campaigns together.\r\n\r\nWarm Regards,\r\nTeam WiseSender\r\n📧 Email: support@wisesender.in\r\n🌐 Website: https://wisesender.in', 1),
(25, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'disallow_disposable_emails', '0', 2),
(26, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'user_terms', 'User Terms And Conditions', 1),
(27, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'vendor_terms', 'Vendor Terms And Conditions', 1),
(28, '2024-11-13 20:14:21', '2024-11-13 20:14:21', 'privacy_policy', 'Privacy Policy', 1),
(29, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'use_env_default_email_settings', '0', 2),
(30, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'mail_driver', 'smtp', 1),
(31, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'mail_from_address', 'support@wisesender.in', 1),
(32, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'mail_from_name', 'WiseSender', 1),
(33, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'smtp_mail_port', '465', 3),
(34, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'smtp_mail_host', 'smtp.hostinger.com', 1),
(35, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'smtp_mail_username', 'support@wisesender.in', 1),
(36, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'smtp_mail_encryption', 'ssl', 1),
(37, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'smtp_mail_password_or_apikey', 'AJUsbdy^%$76', 1),
(38, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'sparkpost_mail_password_or_apikey', '', 1),
(39, '2024-11-14 02:03:56', '2024-11-14 02:03:56', 'mailgun_domain', '', 1),
(40, '2024-11-14 04:09:39', '2024-11-14 04:09:39', 'contact_details', 'WiseSender\r\nPh: (M) +91 9354158622\r\nWeb: wisesender.in | Email: support@wisesender.in', 1),
(41, '2024-11-14 04:14:08', '2024-11-14 04:14:08', 'enable_upi_payment', '1', 2),
(42, '2024-11-14 04:14:08', '2024-11-14 04:14:08', 'payment_upi_address', 'bhj@fgf', 1),
(43, '2024-11-14 04:14:08', '2024-11-14 04:14:08', 'payment_upi_customer_notes', '', 1),
(44, '2024-11-14 05:02:39', '2024-11-14 05:02:39', 'current_home_page_view', 'outer-home-2', 1),
(45, '2024-11-14 05:02:39', '2024-11-14 05:02:39', 'other_home_page_url', '', 1),
(46, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'disable_bg_image', '1', 2),
(47, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bg_color', '#f2f4f7', 1),
(48, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_sidebar_bg_color', '#ffffff', 1),
(49, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_sidebar_text_color', '#212528', 1),
(50, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_primary', '#0861f2', 1),
(51, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_default', '#172b4d', 1),
(52, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_secondary', '#6c757d', 1),
(53, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_danger', '#ff1928', 1),
(54, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_light', '#adb5bd', 1),
(55, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_dark', '#212528', 1),
(56, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_warning', '#ffc107', 1),
(57, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_success', '#28a745', 1),
(58, '2024-11-16 16:47:24', '2024-11-16 16:47:24', 'app_bs_color_muted', '#8898aa', 1),
(59, '2024-11-18 16:47:01', '2024-11-18 16:47:01', 'enable_embedded_signup', '0', 2),
(60, '2024-11-18 16:47:01', '2024-11-18 16:47:01', 'embedded_signup_app_id', 'eyJpdiI6IjJnRW9RL205bEhSdFlaTWp2aENOY0E9PSIsInZhbHVlIjoiTkdIaEgzRnA3Z252bmVEZmZxT0FScDRLZ0QrT1EyMmw3cVZJdUxUQ3B2Yz0iLCJtYWMiOiI0NWQ4OTIwMzcxNDM4NjRlYmRjMDY1ZjhlMDBhNDQ3NjJjOWI5ZjU3MTNmMjcxMzA0NDRiNmFjYzk3ZjZjNGRmIiwidGFnIjoiIn0=', 1),
(61, '2024-11-18 16:47:01', '2024-11-18 16:47:01', 'embedded_signup_app_secret', 'eyJpdiI6IlRaZitMbEhhNHF1NlJueWJyOElaNFE9PSIsInZhbHVlIjoiYXdkUTlzNWJqMk9Tdk9aeWdUZ1ZTRVpjbGFKbWczQk5IS3ZKMCs3aUtNaE8rL25rckxhMWlvWFFlYlRNWWNpQSIsIm1hYyI6IjcxOTRiMmI3MTZhMWI2ZDg5NmIwZTZiODM3ZWJhNTMzZDBlMjVmOTc5Zjk2Yzg2ODRlM2I1MDc4ZjlkMjYzYmMiLCJ0YWciOiIifQ==', 1),
(62, '2024-11-21 15:37:47', '2024-11-21 15:37:47', 'embedded_signup_config_id', 'eyJpdiI6IllxOENpQytJb0ZMa1ZTalpqajd3NXc9PSIsInZhbHVlIjoibkZVTFk4RXc1KzlpL3JSWVZDaGN6UlVla2JPR0tVanp6aGZYd1UwOG5qST0iLCJtYWMiOiJhYzU2ZjUxMjcwMjllYjk0Mjk1MzFkMTA2NDhhOWYzZGU1MmZiNWM1MjdmNGYzZWQ5Yjg1MjVhMTEzNjBmMjMwIiwidGFnIjoiIn0=', 1),
(63, '2024-11-21 15:49:20', '2024-11-21 15:49:20', 'enable_whatsapp_manual_signup', '1', 2),
(64, '2024-11-22 11:23:48', '2024-11-22 11:23:48', 'contacts_import_limit_per_request', '10000', 3);

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 DEFAULT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 DEFAULT NULL,
  `countries__id` smallint(5) UNSIGNED DEFAULT NULL,
  `whatsapp_opt_out` tinyint(3) UNSIGNED DEFAULT NULL,
  `phone_verified_at` datetime DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `wa_id` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Its phone number with country code without + or 0 prefix',
  `language_code` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disable_ai_bot` tinyint(3) UNSIGNED DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `assigned_users__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_custom_fields`
--

CREATE TABLE `contact_custom_fields` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `input_name` varchar(255) NOT NULL,
  `input_type` varchar(15) DEFAULT NULL COMMENT 'Text,number,email etc',
  `vendors__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `contact_custom_field_values`
--

CREATE TABLE `contact_custom_field_values` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `contacts__id` int(10) UNSIGNED NOT NULL,
  `contact_custom_fields__id` int(10) UNSIGNED NOT NULL,
  `field_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_groups`
--

CREATE TABLE `contact_groups` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_labels`
--

CREATE TABLE `contact_labels` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `labels__id` int(10) UNSIGNED NOT NULL,
  `contacts__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `_id` smallint(5) UNSIGNED NOT NULL,
  `iso_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_capitalized` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iso3_code` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iso_num_code` smallint(6) DEFAULT NULL,
  `phone_code` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`_id`, `iso_code`, `name_capitalized`, `name`, `iso3_code`, `iso_num_code`, `phone_code`) VALUES
(1, 'AF', 'AFGHANISTAN', 'Afghanistan', 'AFG', 4, 93),
(2, 'AL', 'ALBANIA', 'Albania', 'ALB', 8, 355),
(3, 'DZ', 'ALGERIA', 'Algeria', 'DZA', 12, 213),
(4, 'AS', 'AMERICAN SAMOA', 'American Samoa', 'ASM', 16, 1684),
(5, 'AD', 'ANDORRA', 'Andorra', 'AND', 20, 376),
(6, 'AO', 'ANGOLA', 'Angola', 'AGO', 24, 244),
(7, 'AI', 'ANGUILLA', 'Anguilla', 'AIA', 660, 1264),
(8, 'AQ', 'ANTARCTICA', 'Antarctica', NULL, NULL, 0),
(9, 'AG', 'ANTIGUA AND BARBUDA', 'Antigua and Barbuda', 'ATG', 28, 1268),
(10, 'AR', 'ARGENTINA', 'Argentina', 'ARG', 32, 54),
(11, 'AM', 'ARMENIA', 'Armenia', 'ARM', 51, 374),
(12, 'AW', 'ARUBA', 'Aruba', 'ABW', 533, 297),
(13, 'AU', 'AUSTRALIA', 'Australia', 'AUS', 36, 61),
(14, 'AT', 'AUSTRIA', 'Austria', 'AUT', 40, 43),
(15, 'AZ', 'AZERBAIJAN', 'Azerbaijan', 'AZE', 31, 994),
(16, 'BS', 'BAHAMAS', 'Bahamas', 'BHS', 44, 1242),
(17, 'BH', 'BAHRAIN', 'Bahrain', 'BHR', 48, 973),
(18, 'BD', 'BANGLADESH', 'Bangladesh', 'BGD', 50, 880),
(19, 'BB', 'BARBADOS', 'Barbados', 'BRB', 52, 1246),
(20, 'BY', 'BELARUS', 'Belarus', 'BLR', 112, 375),
(21, 'BE', 'BELGIUM', 'Belgium', 'BEL', 56, 32),
(22, 'BZ', 'BELIZE', 'Belize', 'BLZ', 84, 501),
(23, 'BJ', 'BENIN', 'Benin', 'BEN', 204, 229),
(24, 'BM', 'BERMUDA', 'Bermuda', 'BMU', 60, 1441),
(25, 'BT', 'BHUTAN', 'Bhutan', 'BTN', 64, 975),
(26, 'BO', 'BOLIVIA', 'Bolivia', 'BOL', 68, 591),
(27, 'BA', 'BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina', 'BIH', 70, 387),
(28, 'BW', 'BOTSWANA', 'Botswana', 'BWA', 72, 267),
(29, 'BV', 'BOUVET ISLAND', 'Bouvet Island', NULL, NULL, 0),
(30, 'BR', 'BRAZIL', 'Brazil', 'BRA', 76, 55),
(31, 'IO', 'BRITISH INDIAN OCEAN TERRITORY', 'British Indian Ocean Territory', NULL, NULL, 246),
(32, 'BN', 'BRUNEI DARUSSALAM', 'Brunei Darussalam', 'BRN', 96, 673),
(33, 'BG', 'BULGARIA', 'Bulgaria', 'BGR', 100, 359),
(34, 'BF', 'BURKINA FASO', 'Burkina Faso', 'BFA', 854, 226),
(35, 'BI', 'BURUNDI', 'Burundi', 'BDI', 108, 257),
(36, 'KH', 'CAMBODIA', 'Cambodia', 'KHM', 116, 855),
(37, 'CM', 'CAMEROON', 'Cameroon', 'CMR', 120, 237),
(38, 'CA', 'CANADA', 'Canada', 'CAN', 124, 1),
(39, 'CV', 'CAPE VERDE', 'Cape Verde', 'CPV', 132, 238),
(40, 'KY', 'CAYMAN ISLANDS', 'Cayman Islands', 'CYM', 136, 1345),
(41, 'CF', 'CENTRAL AFRICAN REPUBLIC', 'Central African Republic', 'CAF', 140, 236),
(42, 'TD', 'CHAD', 'Chad', 'TCD', 148, 235),
(43, 'CL', 'CHILE', 'Chile', 'CHL', 152, 56),
(44, 'CN', 'CHINA', 'China', 'CHN', 156, 86),
(45, 'CX', 'CHRISTMAS ISLAND', 'Christmas Island', NULL, NULL, 61),
(46, 'CC', 'COCOS (KEELING) ISLANDS', 'Cocos (Keeling) Islands', NULL, NULL, 672),
(47, 'CO', 'COLOMBIA', 'Colombia', 'COL', 170, 57),
(48, 'KM', 'COMOROS', 'Comoros', 'COM', 174, 269),
(49, 'CG', 'CONGO', 'Congo', 'COG', 178, 242),
(50, 'CD', 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', 'Congo, the Democratic Republic of the', 'COD', 180, 243),
(51, 'CK', 'COOK ISLANDS', 'Cook Islands', 'COK', 184, 682),
(52, 'CR', 'COSTA RICA', 'Costa Rica', 'CRI', 188, 506),
(53, 'CI', 'COTE D\'IVOIRE', 'Cote D\'Ivoire', 'CIV', 384, 225),
(54, 'HR', 'CROATIA', 'Croatia', 'HRV', 191, 385),
(55, 'CU', 'CUBA', 'Cuba', 'CUB', 192, 53),
(56, 'CY', 'CYPRUS', 'Cyprus', 'CYP', 196, 357),
(57, 'CZ', 'CZECH REPUBLIC', 'Czech Republic', 'CZE', 203, 420),
(58, 'DK', 'DENMARK', 'Denmark', 'DNK', 208, 45),
(59, 'DJ', 'DJIBOUTI', 'Djibouti', 'DJI', 262, 253),
(60, 'DM', 'DOMINICA', 'Dominica', 'DMA', 212, 1767),
(61, 'DO', 'DOMINICAN REPUBLIC', 'Dominican Republic', 'DOM', 214, 1809),
(62, 'EC', 'ECUADOR', 'Ecuador', 'ECU', 218, 593),
(63, 'EG', 'EGYPT', 'Egypt', 'EGY', 818, 20),
(64, 'SV', 'EL SALVADOR', 'El Salvador', 'SLV', 222, 503),
(65, 'GQ', 'EQUATORIAL GUINEA', 'Equatorial Guinea', 'GNQ', 226, 240),
(66, 'ER', 'ERITREA', 'Eritrea', 'ERI', 232, 291),
(67, 'EE', 'ESTONIA', 'Estonia', 'EST', 233, 372),
(68, 'ET', 'ETHIOPIA', 'Ethiopia', 'ETH', 231, 251),
(69, 'FK', 'FALKLAND ISLANDS (MALVINAS)', 'Falkland Islands (Malvinas)', 'FLK', 238, 500),
(70, 'FO', 'FAROE ISLANDS', 'Faroe Islands', 'FRO', 234, 298),
(71, 'FJ', 'FIJI', 'Fiji', 'FJI', 242, 679),
(72, 'FI', 'FINLAND', 'Finland', 'FIN', 246, 358),
(73, 'FR', 'FRANCE', 'France', 'FRA', 250, 33),
(74, 'GF', 'FRENCH GUIANA', 'French Guiana', 'GUF', 254, 594),
(75, 'PF', 'FRENCH POLYNESIA', 'French Polynesia', 'PYF', 258, 689),
(76, 'TF', 'FRENCH SOUTHERN TERRITORIES', 'French Southern Territories', NULL, NULL, 0),
(77, 'GA', 'GABON', 'Gabon', 'GAB', 266, 241),
(78, 'GM', 'GAMBIA', 'Gambia', 'GMB', 270, 220),
(79, 'GE', 'GEORGIA', 'Georgia', 'GEO', 268, 995),
(80, 'DE', 'GERMANY', 'Germany', 'DEU', 276, 49),
(81, 'GH', 'GHANA', 'Ghana', 'GHA', 288, 233),
(82, 'GI', 'GIBRALTAR', 'Gibraltar', 'GIB', 292, 350),
(83, 'GR', 'GREECE', 'Greece', 'GRC', 300, 30),
(84, 'GL', 'GREENLAND', 'Greenland', 'GRL', 304, 299),
(85, 'GD', 'GRENADA', 'Grenada', 'GRD', 308, 1473),
(86, 'GP', 'GUADELOUPE', 'Guadeloupe', 'GLP', 312, 590),
(87, 'GU', 'GUAM', 'Guam', 'GUM', 316, 1671),
(88, 'GT', 'GUATEMALA', 'Guatemala', 'GTM', 320, 502),
(89, 'GN', 'GUINEA', 'Guinea', 'GIN', 324, 224),
(90, 'GW', 'GUINEA-BISSAU', 'Guinea-Bissau', 'GNB', 624, 245),
(91, 'GY', 'GUYANA', 'Guyana', 'GUY', 328, 592),
(92, 'HT', 'HAITI', 'Haiti', 'HTI', 332, 509),
(93, 'HM', 'HEARD ISLAND AND MCDONALD ISLANDS', 'Heard Island and Mcdonald Islands', NULL, NULL, 0),
(94, 'VA', 'HOLY SEE (VATICAN CITY STATE)', 'Holy See (Vatican City State)', 'VAT', 336, 39),
(95, 'HN', 'HONDURAS', 'Honduras', 'HND', 340, 504),
(96, 'HK', 'HONG KONG', 'Hong Kong', 'HKG', 344, 852),
(97, 'HU', 'HUNGARY', 'Hungary', 'HUN', 348, 36),
(98, 'IS', 'ICELAND', 'Iceland', 'ISL', 352, 354),
(99, 'IN', 'INDIA', 'India', 'IND', 356, 91),
(100, 'ID', 'INDONESIA', 'Indonesia', 'IDN', 360, 62),
(101, 'IR', 'IRAN, ISLAMIC REPUBLIC OF', 'Iran, Islamic Republic of', 'IRN', 364, 98),
(102, 'IQ', 'IRAQ', 'Iraq', 'IRQ', 368, 964),
(103, 'IE', 'IRELAND', 'Ireland', 'IRL', 372, 353),
(104, 'IL', 'ISRAEL', 'Israel', 'ISR', 376, 972),
(105, 'IT', 'ITALY', 'Italy', 'ITA', 380, 39),
(106, 'JM', 'JAMAICA', 'Jamaica', 'JAM', 388, 1876),
(107, 'JP', 'JAPAN', 'Japan', 'JPN', 392, 81),
(108, 'JO', 'JORDAN', 'Jordan', 'JOR', 400, 962),
(109, 'KZ', 'KAZAKHSTAN', 'Kazakhstan', 'KAZ', 398, 7),
(110, 'KE', 'KENYA', 'Kenya', 'KEN', 404, 254),
(111, 'KI', 'KIRIBATI', 'Kiribati', 'KIR', 296, 686),
(112, 'KP', 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF', 'Korea, Democratic People\'s Republic of', 'PRK', 408, 850),
(113, 'KR', 'KOREA, REPUBLIC OF', 'Korea, Republic of', 'KOR', 410, 82),
(114, 'KW', 'KUWAIT', 'Kuwait', 'KWT', 414, 965),
(115, 'KG', 'KYRGYZSTAN', 'Kyrgyzstan', 'KGZ', 417, 996),
(116, 'LA', 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC', 'Lao People\'s Democratic Republic', 'LAO', 418, 856),
(117, 'LV', 'LATVIA', 'Latvia', 'LVA', 428, 371),
(118, 'LB', 'LEBANON', 'Lebanon', 'LBN', 422, 961),
(119, 'LS', 'LESOTHO', 'Lesotho', 'LSO', 426, 266),
(120, 'LR', 'LIBERIA', 'Liberia', 'LBR', 430, 231),
(121, 'LY', 'LIBYAN ARAB JAMAHIRIYA', 'Libyan Arab Jamahiriya', 'LBY', 434, 218),
(122, 'LI', 'LIECHTENSTEIN', 'Liechtenstein', 'LIE', 438, 423),
(123, 'LT', 'LITHUANIA', 'Lithuania', 'LTU', 440, 370),
(124, 'LU', 'LUXEMBOURG', 'Luxembourg', 'LUX', 442, 352),
(125, 'MO', 'MACAO', 'Macao', 'MAC', 446, 853),
(126, 'MK', 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', 'Macedonia, the Former Yugoslav Republic of', 'MKD', 807, 389),
(127, 'MG', 'MADAGASCAR', 'Madagascar', 'MDG', 450, 261),
(128, 'MW', 'MALAWI', 'Malawi', 'MWI', 454, 265),
(129, 'MY', 'MALAYSIA', 'Malaysia', 'MYS', 458, 60),
(130, 'MV', 'MALDIVES', 'Maldives', 'MDV', 462, 960),
(131, 'ML', 'MALI', 'Mali', 'MLI', 466, 223),
(132, 'MT', 'MALTA', 'Malta', 'MLT', 470, 356),
(133, 'MH', 'MARSHALL ISLANDS', 'Marshall Islands', 'MHL', 584, 692),
(134, 'MQ', 'MARTINIQUE', 'Martinique', 'MTQ', 474, 596),
(135, 'MR', 'MAURITANIA', 'Mauritania', 'MRT', 478, 222),
(136, 'MU', 'MAURITIUS', 'Mauritius', 'MUS', 480, 230),
(137, 'YT', 'MAYOTTE', 'Mayotte', NULL, NULL, 269),
(138, 'MX', 'MEXICO', 'Mexico', 'MEX', 484, 52),
(139, 'FM', 'MICRONESIA, FEDERATED STATES OF', 'Micronesia, Federated States of', 'FSM', 583, 691),
(140, 'MD', 'MOLDOVA, REPUBLIC OF', 'Moldova, Republic of', 'MDA', 498, 373),
(141, 'MC', 'MONACO', 'Monaco', 'MCO', 492, 377),
(142, 'MN', 'MONGOLIA', 'Mongolia', 'MNG', 496, 976),
(143, 'MS', 'MONTSERRAT', 'Montserrat', 'MSR', 500, 1664),
(144, 'MA', 'MOROCCO', 'Morocco', 'MAR', 504, 212),
(145, 'MZ', 'MOZAMBIQUE', 'Mozambique', 'MOZ', 508, 258),
(146, 'MM', 'MYANMAR', 'Myanmar', 'MMR', 104, 95),
(147, 'NA', 'NAMIBIA', 'Namibia', 'NAM', 516, 264),
(148, 'NR', 'NAURU', 'Nauru', 'NRU', 520, 674),
(149, 'NP', 'NEPAL', 'Nepal', 'NPL', 524, 977),
(150, 'NL', 'NETHERLANDS', 'Netherlands', 'NLD', 528, 31),
(151, 'AN', 'NETHERLANDS ANTILLES', 'Netherlands Antilles', 'ANT', 530, 599),
(152, 'NC', 'NEW CALEDONIA', 'New Caledonia', 'NCL', 540, 687),
(153, 'NZ', 'NEW ZEALAND', 'New Zealand', 'NZL', 554, 64),
(154, 'NI', 'NICARAGUA', 'Nicaragua', 'NIC', 558, 505),
(155, 'NE', 'NIGER', 'Niger', 'NER', 562, 227),
(156, 'NG', 'NIGERIA', 'Nigeria', 'NGA', 566, 234),
(157, 'NU', 'NIUE', 'Niue', 'NIU', 570, 683),
(158, 'NF', 'NORFOLK ISLAND', 'Norfolk Island', 'NFK', 574, 672),
(159, 'MP', 'NORTHERN MARIANA ISLANDS', 'Northern Mariana Islands', 'MNP', 580, 1670),
(160, 'NO', 'NORWAY', 'Norway', 'NOR', 578, 47),
(161, 'OM', 'OMAN', 'Oman', 'OMN', 512, 968),
(162, 'PK', 'PAKISTAN', 'Pakistan', 'PAK', 586, 92),
(163, 'PW', 'PALAU', 'Palau', 'PLW', 585, 680),
(164, 'PS', 'PALESTINIAN TERRITORY, OCCUPIED', 'Palestinian Territory, Occupied', NULL, NULL, 970),
(165, 'PA', 'PANAMA', 'Panama', 'PAN', 591, 507),
(166, 'PG', 'PAPUA NEW GUINEA', 'Papua New Guinea', 'PNG', 598, 675),
(167, 'PY', 'PARAGUAY', 'Paraguay', 'PRY', 600, 595),
(168, 'PE', 'PERU', 'Peru', 'PER', 604, 51),
(169, 'PH', 'PHILIPPINES', 'Philippines', 'PHL', 608, 63),
(170, 'PN', 'PITCAIRN', 'Pitcairn', 'PCN', 612, 0),
(171, 'PL', 'POLAND', 'Poland', 'POL', 616, 48),
(172, 'PT', 'PORTUGAL', 'Portugal', 'PRT', 620, 351),
(173, 'PR', 'PUERTO RICO', 'Puerto Rico', 'PRI', 630, 1787),
(174, 'QA', 'QATAR', 'Qatar', 'QAT', 634, 974),
(175, 'RE', 'REUNION', 'Reunion', 'REU', 638, 262),
(176, 'RO', 'ROMANIA', 'Romania', 'ROM', 642, 40),
(177, 'RU', 'RUSSIAN FEDERATION', 'Russian Federation', 'RUS', 643, 7),
(178, 'RW', 'RWANDA', 'Rwanda', 'RWA', 646, 250),
(179, 'SH', 'SAINT HELENA', 'Saint Helena', 'SHN', 654, 290),
(180, 'KN', 'SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis', 'KNA', 659, 1869),
(181, 'LC', 'SAINT LUCIA', 'Saint Lucia', 'LCA', 662, 1758),
(182, 'PM', 'SAINT PIERRE AND MIQUELON', 'Saint Pierre and Miquelon', 'SPM', 666, 508),
(183, 'VC', 'SAINT VINCENT AND THE GRENADINES', 'Saint Vincent and the Grenadines', 'VCT', 670, 1784),
(184, 'WS', 'SAMOA', 'Samoa', 'WSM', 882, 684),
(185, 'SM', 'SAN MARINO', 'San Marino', 'SMR', 674, 378),
(186, 'ST', 'SAO TOME AND PRINCIPE', 'Sao Tome and Principe', 'STP', 678, 239),
(187, 'SA', 'SAUDI ARABIA', 'Saudi Arabia', 'SAU', 682, 966),
(188, 'SN', 'SENEGAL', 'Senegal', 'SEN', 686, 221),
(190, 'SC', 'SEYCHELLES', 'Seychelles', 'SYC', 690, 248),
(191, 'SL', 'SIERRA LEONE', 'Sierra Leone', 'SLE', 694, 232),
(192, 'SG', 'SINGAPORE', 'Singapore', 'SGP', 702, 65),
(193, 'SK', 'SLOVAKIA', 'Slovakia', 'SVK', 703, 421),
(194, 'SI', 'SLOVENIA', 'Slovenia', 'SVN', 705, 386),
(195, 'SB', 'SOLOMON ISLANDS', 'Solomon Islands', 'SLB', 90, 677),
(196, 'SO', 'SOMALIA', 'Somalia', 'SOM', 706, 252),
(197, 'ZA', 'SOUTH AFRICA', 'South Africa', 'ZAF', 710, 27),
(198, 'GS', 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', 'South Georgia and the South Sandwich Islands', NULL, NULL, 0),
(199, 'ES', 'SPAIN', 'Spain', 'ESP', 724, 34),
(200, 'LK', 'SRI LANKA', 'Sri Lanka', 'LKA', 144, 94),
(201, 'SD', 'SUDAN', 'Sudan', 'SDN', 736, 249),
(202, 'SR', 'SURINAME', 'Suriname', 'SUR', 740, 597),
(203, 'SJ', 'SVALBARD AND JAN MAYEN', 'Svalbard and Jan Mayen', 'SJM', 744, 47),
(204, 'SZ', 'SWAZILAND', 'Swaziland', 'SWZ', 748, 268),
(205, 'SE', 'SWEDEN', 'Sweden', 'SWE', 752, 46),
(206, 'CH', 'SWITZERLAND', 'Switzerland', 'CHE', 756, 41),
(207, 'SY', 'SYRIAN ARAB REPUBLIC', 'Syrian Arab Republic', 'SYR', 760, 963),
(208, 'TW', 'TAIWAN, PROVINCE OF CHINA', 'Taiwan, Province of China', 'TWN', 158, 886),
(209, 'TJ', 'TAJIKISTAN', 'Tajikistan', 'TJK', 762, 992),
(210, 'TZ', 'TANZANIA, UNITED REPUBLIC OF', 'Tanzania, United Republic of', 'TZA', 834, 255),
(211, 'TH', 'THAILAND', 'Thailand', 'THA', 764, 66),
(212, 'TL', 'TIMOR-LESTE', 'Timor-Leste', NULL, NULL, 670),
(213, 'TG', 'TOGO', 'Togo', 'TGO', 768, 228),
(214, 'TK', 'TOKELAU', 'Tokelau', 'TKL', 772, 690),
(215, 'TO', 'TONGA', 'Tonga', 'TON', 776, 676),
(216, 'TT', 'TRINIDAD AND TOBAGO', 'Trinidad and Tobago', 'TTO', 780, 1868),
(217, 'TN', 'TUNISIA', 'Tunisia', 'TUN', 788, 216),
(218, 'TR', 'TURKEY', 'Turkey', 'TUR', 792, 90),
(219, 'TM', 'TURKMENISTAN', 'Turkmenistan', 'TKM', 795, 7370),
(220, 'TC', 'TURKS AND CAICOS ISLANDS', 'Turks and Caicos Islands', 'TCA', 796, 1649),
(221, 'TV', 'TUVALU', 'Tuvalu', 'TUV', 798, 688),
(222, 'UG', 'UGANDA', 'Uganda', 'UGA', 800, 256),
(223, 'UA', 'UKRAINE', 'Ukraine', 'UKR', 804, 380),
(224, 'AE', 'UNITED ARAB EMIRATES', 'United Arab Emirates', 'ARE', 784, 971),
(225, 'GB', 'UNITED KINGDOM', 'United Kingdom', 'GBR', 826, 44),
(226, 'US', 'UNITED STATES', 'United States', 'USA', 840, 1),
(227, 'UM', 'UNITED STATES MINOR OUTLYING ISLANDS', 'United States Minor Outlying Islands', NULL, NULL, 1),
(228, 'UY', 'URUGUAY', 'Uruguay', 'URY', 858, 598),
(229, 'UZ', 'UZBEKISTAN', 'Uzbekistan', 'UZB', 860, 998),
(230, 'VU', 'VANUATU', 'Vanuatu', 'VUT', 548, 678),
(231, 'VE', 'VENEZUELA', 'Venezuela', 'VEN', 862, 58),
(232, 'VN', 'VIET NAM', 'Viet Nam', 'VNM', 704, 84),
(233, 'VG', 'VIRGIN ISLANDS, BRITISH', 'Virgin Islands, British', 'VGB', 92, 1284),
(234, 'VI', 'VIRGIN ISLANDS, U.S.', 'Virgin Islands, U.s.', 'VIR', 850, 1340),
(235, 'WF', 'WALLIS AND FUTUNA', 'Wallis and Futuna', 'WLF', 876, 681),
(236, 'EH', 'WESTERN SAHARA', 'Western Sahara', 'ESH', 732, 212),
(237, 'YE', 'YEMEN', 'Yemen', 'YEM', 887, 967),
(238, 'ZM', 'ZAMBIA', 'Zambia', 'ZMB', 894, 260),
(239, 'ZW', 'ZIMBABWE', 'Zimbabwe', 'ZWE', 716, 263),
(240, 'RS', 'SERBIA', 'Serbia', 'SRB', 688, 381),
(241, 'AP', 'ASIA PACIFIC REGION', 'Asia / Pacific Region', '0', 0, 0),
(242, 'ME', 'MONTENEGRO', 'Montenegro', 'MNE', 499, 382),
(243, 'AX', 'ALAND ISLANDS', 'Aland Islands', 'ALA', 248, 358),
(244, 'BQ', 'BONAIRE, SINT EUSTATIUS AND SABA', 'Bonaire, Sint Eustatius and Saba', 'BES', 535, 599),
(245, 'CW', 'CURACAO', 'Curacao', 'CUW', 531, 599),
(246, 'GG', 'GUERNSEY', 'Guernsey', 'GGY', 831, 44),
(247, 'IM', 'ISLE OF MAN', 'Isle of Man', 'IMN', 833, 44),
(248, 'JE', 'JERSEY', 'Jersey', 'JEY', 832, 44),
(249, 'XK', 'KOSOVO', 'Kosovo', '---', 0, 381),
(250, 'BL', 'SAINT BARTHELEMY', 'Saint Barthelemy', 'BLM', 652, 590),
(251, 'MF', 'SAINT MARTIN', 'Saint Martin', 'MAF', 663, 590),
(252, 'SX', 'SINT MAARTEN', 'Sint Maarten', 'SXM', 534, 1),
(253, 'SS', 'SOUTH SUDAN', 'South Sudan', 'SSD', 728, 211);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_contacts`
--

CREATE TABLE `group_contacts` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `contact_groups__id` int(10) UNSIGNED NOT NULL,
  `contacts__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `labels`
--

CREATE TABLE `labels` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `title` varchar(45) CHARACTER SET utf8mb4 NOT NULL,
  `text_color` varchar(10) DEFAULT NULL,
  `bg_color` varchar(10) DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempts` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` tinyint(4) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `ip_address` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`_id`, `created_at`, `updated_at`, `email`, `role`, `user_id`, `ip_address`) VALUES
(1, '2024-11-13 17:28:59', '2024-11-13 17:28:59', 'superadmin@yourdomain.com', 1, 1, '106.210.146.16'),
(2, '2024-11-13 17:52:49', '2024-11-13 17:52:49', 'superadmin@yourdomain.com', 1, 1, '106.210.146.16'),
(3, '2024-11-13 17:56:11', '2024-11-13 17:56:11', 'support@mtechsystems.co.in', 2, 2, '106.210.146.16'),
(4, '2024-11-13 18:35:07', '2024-11-13 18:35:07', 'support@mtechsystems.co.in', 2, 2, '106.210.146.16'),
(5, '2024-11-13 20:32:56', '2024-11-13 20:32:56', 'support@mtechsystems.co.in', 2, 2, '106.210.146.16'),
(6, '2024-11-14 01:48:23', '2024-11-14 01:48:23', 'superadmin@yourdomain.com', 1, 1, '106.210.146.16'),
(7, '2024-11-14 04:44:21', '2024-11-14 04:44:21', 'mkmayukadam@gmail.com', 2, 3, '106.220.161.86'),
(8, '2024-11-14 04:56:49', '2024-11-14 04:56:49', 'admin@mtechsystems.co.in', 1, 1, '106.220.161.86'),
(9, '2024-11-14 05:15:42', '2024-11-14 05:15:42', 'admin@mtechsystems.co.in', 1, 1, '106.220.161.86'),
(10, '2024-11-14 05:26:05', '2024-11-14 05:26:05', 'support@mtechsystems.co.in', 2, 2, '106.220.161.86'),
(11, '2024-11-14 08:19:58', '2024-11-14 08:19:58', 'admin@mtechsystems.co.in', 1, 1, '106.220.161.86'),
(12, '2024-11-14 10:41:52', '2024-11-14 10:41:52', 'admin@mtechsystems.co.in', 1, 1, '106.220.161.86'),
(13, '2024-11-14 10:42:42', '2024-11-14 10:42:42', 'support@mtechsystems.co.in', 2, 2, '106.220.161.86'),
(14, '2024-11-14 14:32:39', '2024-11-14 14:32:39', 'admin@mtechsystems.co.in', 1, 1, '106.210.183.105'),
(15, '2024-11-14 14:41:56', '2024-11-14 14:41:56', 'admin@mtechsystems.co.in', 1, 1, '106.210.183.105'),
(16, '2024-11-14 15:21:13', '2024-11-14 15:21:13', 'support@mtechsystems.co.in', 2, 2, '106.210.183.105'),
(17, '2024-11-14 16:38:57', '2024-11-14 16:38:57', 'admin@mtechsystems.co.in', 1, 1, '106.210.183.105'),
(18, '2024-11-15 06:05:32', '2024-11-15 06:05:32', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.29'),
(19, '2024-11-15 21:10:20', '2024-11-15 21:10:20', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.14'),
(20, '2024-11-16 10:16:51', '2024-11-16 10:16:51', 'admin@mtechsystems.co.in', 1, 1, '106.220.89.206'),
(21, '2024-11-16 13:43:18', '2024-11-16 13:43:18', 'admin@mtechsystems.co.in', 1, 1, '106.210.219.110'),
(22, '2024-11-16 15:53:56', '2024-11-16 15:53:56', 'admin@mtechsystems.co.in', 1, 1, '106.210.219.110'),
(23, '2024-11-16 16:57:04', '2024-11-16 16:57:04', 'admin@mtechsystems.co.in', 1, 1, '106.210.219.110'),
(24, '2024-11-16 17:00:53', '2024-11-16 17:00:53', 'admin@mtechsystems.co.in', 1, 1, '106.210.219.110'),
(25, '2024-11-17 10:11:46', '2024-11-17 10:11:46', 'admin@mtechsystems.co.in', 1, 1, '49.15.234.129'),
(26, '2024-11-17 11:07:51', '2024-11-17 11:07:51', 'admin@mtechsystems.co.in', 1, 1, '49.15.234.129'),
(27, '2024-11-17 11:08:50', '2024-11-17 11:08:50', 'admin@mtechsystems.co.in', 1, 1, '106.221.0.4'),
(28, '2024-11-18 09:11:40', '2024-11-18 09:11:40', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.27'),
(29, '2024-11-18 10:58:10', '2024-11-18 10:58:10', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.27'),
(30, '2024-11-18 12:51:19', '2024-11-18 12:51:19', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.27'),
(31, '2024-11-18 13:01:12', '2024-11-18 13:01:12', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.27'),
(32, '2024-11-18 15:45:52', '2024-11-18 15:45:52', 'shubhammore003@gmail.com', 2, 4, '2401:4900:79d8:eb71:88b8:ff:fec3:bcd8'),
(33, '2024-11-18 16:03:53', '2024-11-18 16:03:53', 'admin@mtechsystems.co.in', 1, 1, '110.227.0.27'),
(34, '2024-11-18 22:02:28', '2024-11-18 22:02:28', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(35, '2024-11-18 22:57:24', '2024-11-18 22:57:24', 'support@mtechsystems.co.in', 2, 2, '106.210.239.196'),
(36, '2024-11-18 23:56:59', '2024-11-18 23:56:59', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(37, '2024-11-18 23:57:35', '2024-11-18 23:57:35', 'support@mtechsystems.co.in', 2, 2, '106.210.239.196'),
(38, '2024-11-19 03:16:56', '2024-11-19 03:16:56', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(39, '2024-11-19 06:11:31', '2024-11-19 06:11:31', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(40, '2024-11-19 13:18:55', '2024-11-19 13:18:55', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(41, '2024-11-19 14:04:42', '2024-11-19 14:04:42', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(42, '2024-11-19 16:53:32', '2024-11-19 16:53:32', 'admin@mtechsystems.co.in', 1, 1, '106.210.239.196'),
(43, '2024-11-19 17:25:30', '2024-11-19 17:25:30', 'admin@mtechsystems.co.in', 1, 1, '106.216.251.144'),
(44, '2024-11-19 18:46:50', '2024-11-19 18:46:50', 'admin@mtechsystems.co.in', 1, 1, '106.216.251.144'),
(45, '2024-11-19 19:05:06', '2024-11-19 19:05:06', 'admin@mtechsystems.co.in', 1, 1, '106.216.251.144'),
(46, '2024-11-19 19:07:40', '2024-11-19 19:07:40', 'admin@mtechsystems.co.in', 1, 1, '2409:4042:2e4d:77e1:1c30:6f96:c9ae:29c9'),
(47, '2024-11-19 19:49:02', '2024-11-19 19:49:02', 'admin@mtechsystems.co.in', 1, 1, '2409:40c2:504c:fbd0:8000::'),
(48, '2024-11-19 20:45:53', '2024-11-19 20:45:53', 'admin@mtechsystems.co.in', 1, 1, '106.193.218.40'),
(49, '2024-11-19 21:13:30', '2024-11-19 21:13:30', 'admin@mtechsystems.co.in', 1, 1, '106.193.218.40'),
(50, '2024-11-19 21:16:59', '2024-11-19 21:16:59', 'superadmin@yourdomain.com', 1, 1, '106.193.218.40'),
(51, '2024-11-19 21:47:07', '2024-11-19 21:47:07', 'superadmin@yourdomain.com', 1, 1, '106.193.218.40'),
(52, '2024-11-20 04:28:58', '2024-11-20 04:28:58', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(53, '2024-11-20 13:35:00', '2024-11-20 13:35:00', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(54, '2024-11-21 15:25:33', '2024-11-21 15:25:33', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(55, '2024-11-21 15:45:22', '2024-11-21 15:45:22', 'pratikadhikari003@gmail.com', 2, 5, '106.220.129.121'),
(56, '2024-11-21 16:00:48', '2024-11-21 16:00:48', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(57, '2024-11-21 17:41:06', '2024-11-21 17:41:06', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(58, '2024-11-21 17:41:49', '2024-11-21 17:41:49', 'superadmin@yourdomain.com', 1, 1, '106.220.129.121'),
(59, '2024-11-21 18:26:45', '2024-11-21 18:26:45', 'superadmin@yourdomain.com', 1, 1, '110.227.0.6'),
(60, '2024-11-21 18:27:06', '2024-11-21 18:27:06', 'superadmin@yourdomain.com', 1, 1, '110.227.0.6'),
(61, '2024-11-22 06:55:17', '2024-11-22 06:55:17', 'superadmin@yourdomain.com', 1, 1, '110.227.0.6'),
(62, '2024-11-22 13:22:01', '2024-11-22 13:22:01', 'superadmin@yourdomain.com', 1, 1, '106.195.10.131'),
(63, '2024-11-22 13:56:29', '2024-11-22 13:56:29', 'superadmin@yourdomain.com', 1, 1, '2409:4081:1c99:4267:549d:6d94:9e7f:695e'),
(64, '2024-11-22 16:32:01', '2024-11-22 16:32:01', 'superadmin@yourdomain.com', 1, 1, '2409:4081:1c99:4267:549d:6d94:9e7f:695e'),
(65, '2024-11-22 20:20:14', '2024-11-22 20:20:14', 'superadmin@yourdomain.com', 1, 1, '110.227.0.29'),
(66, '2024-11-23 04:09:18', '2024-11-23 04:09:18', 'superadmin@yourdomain.com', 1, 1, '110.227.0.29'),
(67, '2024-11-23 05:01:53', '2024-11-23 05:01:53', 'superadmin@yourdomain.com', 1, 1, '110.227.0.29'),
(68, '2024-11-23 06:11:00', '2024-11-23 06:11:00', 'superadmin@yourdomain.com', 1, 1, '2409:4081:1c99:4267:ac67:5c5:b87b:1fc8'),
(69, '2024-11-23 10:21:05', '2024-11-23 10:21:05', 'superadmin@yourdomain.com', 1, 1, '110.227.0.29'),
(70, '2024-11-23 10:50:02', '2024-11-23 10:50:02', 'anjanicreations09@gmail.com', 2, 7, '2409:40d4:116:21a3:fc5e:eb9f:1e43:1209'),
(71, '2024-11-24 16:33:00', '2024-11-24 16:33:00', 'superadmin@yourdomain.com', 1, 1, '106.220.190.14'),
(72, '2024-11-24 16:34:20', '2024-11-24 16:34:20', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(73, '2024-11-24 18:10:31', '2024-11-24 18:10:31', 'yogh84267@gmail.com', 2, 8, '2409:4042:2d92:40c4:4544:8057:bf8b:6a5d'),
(74, '2024-11-24 18:29:20', '2024-11-24 18:29:20', 'yogh84267@gmail.com', 2, 8, '2409:4042:2d92:40c4:4544:8057:bf8b:6a5d'),
(75, '2024-11-24 18:43:09', '2024-11-24 18:43:09', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(76, '2024-11-24 18:43:26', '2024-11-24 18:43:26', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(77, '2024-11-24 18:52:51', '2024-11-24 18:52:51', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(78, '2024-11-24 18:56:42', '2024-11-24 18:56:42', 'yogh84267@gmail.com', 2, 8, '2409:4042:2d92:40c4:4544:8057:bf8b:6a5d'),
(79, '2024-11-24 19:00:19', '2024-11-24 19:00:19', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(80, '2024-11-24 21:03:58', '2024-11-24 21:03:58', 'yogh84267@gmail.com', 1, 8, '2409:4042:2d92:40c4:5c25:1598:f310:bd09'),
(81, '2024-11-24 21:08:15', '2024-11-24 21:08:15', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(82, '2024-11-24 21:18:01', '2024-11-24 21:18:01', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(83, '2024-11-24 21:46:05', '2024-11-24 21:46:05', 'yogh84267@gmail.com', 1, 8, '2409:4042:2d92:40c4:5c25:1598:f310:bd09'),
(84, '2024-11-24 22:13:11', '2024-11-24 22:13:11', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(85, '2024-11-24 23:23:56', '2024-11-24 23:23:56', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(86, '2024-11-24 23:26:13', '2024-11-24 23:26:13', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(87, '2024-11-24 23:28:16', '2024-11-24 23:28:16', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(88, '2024-11-24 23:37:28', '2024-11-24 23:37:28', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(89, '2024-11-24 23:37:39', '2024-11-24 23:37:39', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(90, '2024-11-25 02:21:24', '2024-11-25 02:21:24', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(91, '2024-11-25 03:12:34', '2024-11-25 03:12:34', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(92, '2024-11-25 03:57:57', '2024-11-25 03:57:57', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(93, '2024-11-25 04:17:54', '2024-11-25 04:17:54', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(94, '2024-11-25 04:23:16', '2024-11-25 04:23:16', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(95, '2024-11-25 04:49:18', '2024-11-25 04:49:18', 'yogh84267@gmail.com', 1, 8, '2409:4042:2d92:40c4:5c25:1598:f310:bd09'),
(96, '2024-11-25 05:01:37', '2024-11-25 05:01:37', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(97, '2024-11-25 05:14:37', '2024-11-25 05:14:37', 'shubham@mtechsystems.co.in', 3, 9, '106.220.190.14'),
(98, '2024-11-25 05:18:19', '2024-11-25 05:18:19', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(99, '2024-11-25 06:35:29', '2024-11-25 06:35:29', 'admin@mtechsystems.co.in', 1, 1, '2409:4042:2d92:40c4:7963:403a:5236:df46'),
(100, '2024-11-25 06:44:41', '2024-11-25 06:44:41', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(101, '2024-11-25 06:53:02', '2024-11-25 06:53:02', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(102, '2024-11-25 06:53:40', '2024-11-25 06:53:40', 'test@test.com', 2, 10, '106.220.190.14'),
(103, '2024-11-25 07:29:09', '2024-11-25 07:29:09', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(104, '2024-11-25 07:53:48', '2024-11-25 07:53:48', 'test@test.com', 2, 10, '106.220.190.14'),
(105, '2024-11-25 08:36:46', '2024-11-25 08:36:46', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(106, '2024-11-25 09:47:44', '2024-11-25 09:47:44', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(107, '2024-11-25 09:53:13', '2024-11-25 09:53:13', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(108, '2024-11-25 09:58:26', '2024-11-25 09:58:26', 'admin@mtechsystems.co.in', 1, 1, '2409:40c2:500a:f229:8000::'),
(109, '2024-11-25 09:58:37', '2024-11-25 09:58:37', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(110, '2024-11-25 11:10:44', '2024-11-25 11:10:44', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(111, '2024-11-25 13:30:07', '2024-11-25 13:30:07', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(112, '2024-11-25 13:34:06', '2024-11-25 13:34:06', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(113, '2024-11-25 15:09:43', '2024-11-25 15:09:43', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(114, '2024-11-25 16:22:19', '2024-11-25 16:22:19', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(115, '2024-11-25 16:28:18', '2024-11-25 16:28:18', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(116, '2024-11-25 21:44:20', '2024-11-25 21:44:20', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(117, '2024-11-25 23:36:20', '2024-11-25 23:36:20', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(118, '2024-11-26 02:51:16', '2024-11-26 02:51:16', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(119, '2024-11-26 02:54:22', '2024-11-26 02:54:22', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(120, '2024-11-26 03:19:09', '2024-11-26 03:19:09', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(121, '2024-11-26 10:35:21', '2024-11-26 10:35:21', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(122, '2024-11-26 10:59:18', '2024-11-26 10:59:18', 'admin@mtechsystems.co.in', 1, 1, '2401:4900:79d2:a7cf:b0d7:8887:295:da9a'),
(123, '2024-11-26 11:48:00', '2024-11-26 11:48:00', 'manisaibitspilani@gmail.com', 2, 11, '203.110.83.42'),
(124, '2024-11-26 14:24:16', '2024-11-26 14:24:16', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(125, '2024-11-26 16:40:04', '2024-11-26 16:40:04', 'admin@mtechsystems.co.in', 1, 1, '2401:4900:79d2:a7cf:b0d7:8887:295:da9a'),
(126, '2024-11-26 16:58:05', '2024-11-26 16:58:05', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(127, '2024-11-26 17:38:50', '2024-11-26 17:38:50', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(128, '2024-11-26 18:11:43', '2024-11-26 18:11:43', 'support@mtechsystems.co.in', 2, 2, '2401:4900:1c45:c9f0:f0ea:2194:c66b:6900'),
(129, '2024-11-26 19:02:59', '2024-11-26 19:02:59', 'admin@mtechsystems.co.in', 1, 1, '2409:4081:911:9d0f:7890:3dd2:9616:935d'),
(130, '2024-11-26 19:13:48', '2024-11-26 19:13:48', 'admin@mtechsystems.co.in', 1, 1, '2409:4081:911:9d0f:7890:3dd2:9616:935d'),
(131, '2024-11-26 21:13:18', '2024-11-26 21:13:18', 'pratikadhikari003@gmail.com', 2, 5, '106.220.190.14'),
(132, '2024-11-26 21:24:04', '2024-11-26 21:24:04', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(133, '2024-11-26 21:33:54', '2024-11-26 21:33:54', 'pratikadhikari003@gmail.com', 2, 5, '106.220.190.14'),
(134, '2024-11-26 21:41:50', '2024-11-26 21:41:50', 'support@mtechsystems.co.in', 2, 2, '106.220.190.14'),
(135, '2024-11-27 03:48:26', '2024-11-27 03:48:26', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(136, '2024-11-27 04:05:54', '2024-11-27 04:05:54', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(137, '2024-11-27 05:35:03', '2024-11-27 05:35:03', 'admin@mtechsystems.co.in', 1, 1, '2409:4081:911:9d0f:7890:3dd2:9616:935d'),
(138, '2024-11-27 06:15:50', '2024-11-27 06:15:50', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(139, '2024-11-27 09:56:40', '2024-11-27 09:56:40', 'onlinefungame247@gmail.com', 2, 13, '2405:201:6009:f01f:edee:26bb:f7f:7dfb'),
(140, '2024-11-27 10:45:08', '2024-11-27 10:45:08', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(141, '2024-11-27 11:02:46', '2024-11-27 11:02:46', 'vjha.367@gmail.com', 2, 14, '2401:4900:1c00:3394:bc:9865:ee15:fe2'),
(142, '2024-11-27 14:34:36', '2024-11-27 14:34:36', 'admin@mtechsystems.co.in', 1, 1, '106.220.190.14'),
(143, '2024-11-28 06:11:48', '2024-11-28 06:11:48', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(144, '2024-11-28 08:10:44', '2024-11-28 08:10:44', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(145, '2024-11-28 08:17:46', '2024-11-28 08:17:46', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(146, '2024-11-28 08:32:10', '2024-11-28 08:32:10', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(147, '2024-11-28 08:37:37', '2024-11-28 08:37:37', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(148, '2024-11-28 09:31:46', '2024-11-28 09:31:46', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(149, '2024-11-28 09:35:22', '2024-11-28 09:35:22', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(150, '2024-11-28 09:36:35', '2024-11-28 09:36:35', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(151, '2024-11-28 11:11:35', '2024-11-28 11:11:35', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(152, '2024-11-28 11:14:08', '2024-11-28 11:14:08', 'shital@cellx.in', 2, 15, '123.201.245.34'),
(153, '2024-11-28 17:49:32', '2024-11-28 17:49:32', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(154, '2024-11-28 19:20:17', '2024-11-28 19:20:17', 'support@mtechsystems.co.in', 2, 2, '223.178.144.22'),
(155, '2024-11-28 22:06:47', '2024-11-28 22:06:47', 'admin@mtechsystems.co.in', 1, 1, '223.178.144.22'),
(156, '2024-11-28 22:09:13', '2024-11-28 22:09:13', 'support@mtechsystems.co.in', 2, 2, '223.178.144.22'),
(157, '2024-11-29 05:22:55', '2024-11-29 05:22:55', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(158, '2024-11-29 07:58:44', '2024-11-29 07:58:44', 'shital@cellx.in', 2, 15, '219.91.175.91'),
(159, '2024-11-29 08:14:35', '2024-11-29 08:14:35', 'shital@cellx.in', 2, 15, '219.91.175.91'),
(160, '2024-11-29 08:57:42', '2024-11-29 08:57:42', 'onlinefungame247@gmail.com', 2, 13, '2405:201:6009:f01f:eda1:e19d:bcdc:f5be'),
(161, '2024-11-29 09:41:48', '2024-11-29 09:41:48', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(162, '2024-11-29 09:45:23', '2024-11-29 09:45:23', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(163, '2024-11-29 12:47:24', '2024-11-29 12:47:24', 'onlinefungame247@gmail.com', 2, 13, '2405:201:6009:f01f:eda1:e19d:bcdc:f5be'),
(164, '2024-11-29 13:13:19', '2024-11-29 13:13:19', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(165, '2024-11-29 13:18:16', '2024-11-29 13:18:16', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(166, '2024-11-29 14:52:21', '2024-11-29 14:52:21', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.13'),
(167, '2024-11-29 15:46:01', '2024-11-29 15:46:01', 'support@mtechsystems.co.in', 2, 2, '106.193.80.13'),
(168, '2024-11-29 16:34:14', '2024-11-29 16:34:14', 'onlinefungame247@gmail.com', 2, 13, '2405:201:6019:5854:a9c8:c121:934a:78c5'),
(169, '2024-11-29 19:22:25', '2024-11-29 19:22:25', 'support@mtechsystems.co.in', 2, 2, '49.15.230.81'),
(170, '2024-11-29 23:04:56', '2024-11-29 23:04:56', 'admin@mtechsystems.co.in', 1, 1, '2409:40c2:5059:a6db:8000::'),
(171, '2024-11-30 06:21:51', '2024-11-30 06:21:51', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(172, '2024-11-30 06:22:25', '2024-11-30 06:22:25', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(173, '2024-11-30 07:44:35', '2024-11-30 07:44:35', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(174, '2024-11-30 08:23:13', '2024-11-30 08:23:13', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(175, '2024-11-30 08:53:40', '2024-11-30 08:53:40', 'support@mtechsystems.co.in', 2, 2, '51.158.237.230'),
(176, '2024-11-30 09:04:25', '2024-11-30 09:04:25', 'onlinefungame247@gmail.com', 2, 13, '2401:4900:3149:6f1b:48aa:4ef2:7174:f6d9'),
(177, '2024-11-30 09:07:34', '2024-11-30 09:07:34', 'akshaygraphics789@gmail.com', 2, 16, '2401:4900:1c44:ebc7:2591:38b6:ce07:14e1'),
(178, '2024-11-30 09:09:00', '2024-11-30 09:09:00', 'support@mtechsystems.co.in', 2, 2, '51.158.237.230'),
(179, '2024-11-30 09:18:10', '2024-11-30 09:18:10', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(180, '2024-11-30 09:19:07', '2024-11-30 09:19:07', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(181, '2024-11-30 09:20:04', '2024-11-30 09:20:04', 'support@mtechsystems.co.in', 2, 2, '106.220.85.238'),
(182, '2024-11-30 09:21:47', '2024-11-30 09:21:47', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(183, '2024-11-30 11:38:03', '2024-11-30 11:38:03', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(184, '2024-11-30 11:59:01', '2024-11-30 11:59:01', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(185, '2024-11-30 12:11:24', '2024-11-30 12:11:24', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(186, '2024-11-30 13:33:18', '2024-11-30 13:33:18', 'support@mtechsystems.co.in', 2, 2, '106.220.85.238'),
(187, '2024-11-30 16:21:40', '2024-11-30 16:21:40', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(188, '2024-11-30 16:36:49', '2024-11-30 16:36:49', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(189, '2024-11-30 16:57:31', '2024-11-30 16:57:31', 'admin@mtechsystems.co.in', 1, 1, '2409:4042:2602:f010:f0a5:6fcf:a3b8:fa7c'),
(190, '2024-11-30 17:24:02', '2024-11-30 17:24:02', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(191, '2024-11-30 18:32:27', '2024-11-30 18:32:27', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(192, '2024-11-30 18:36:58', '2024-11-30 18:36:58', 'support@mtechsystems.co.in', 2, 2, '106.220.85.238'),
(193, '2024-11-30 19:50:43', '2024-11-30 19:50:43', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(194, '2024-11-30 19:51:50', '2024-11-30 19:51:50', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(195, '2024-11-30 20:35:01', '2024-11-30 20:35:01', 'support@mtechsystems.co.in', 2, 2, '106.220.85.238'),
(196, '2024-12-01 04:18:27', '2024-12-01 04:18:27', 'admin@mtechsystems.co.in', 1, 1, '2409:4042:2602:f010:157f:ac04:9f18:e94a'),
(197, '2024-12-01 07:27:43', '2024-12-01 07:27:43', 'admin@mtechsystems.co.in', 1, 1, '106.220.85.238'),
(198, '2024-12-01 19:26:57', '2024-12-01 19:26:57', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.15'),
(199, '2024-12-02 03:18:35', '2024-12-02 03:18:35', 'admin@mtechsystems.co.in', 1, 1, '2409:4042:4e49:afcb:d004:627e:8176:f1f9'),
(200, '2024-12-02 05:25:50', '2024-12-02 05:25:50', 'admin@mtechsystems.co.in', 1, 1, '106.193.80.15'),
(201, '2024-12-02 06:18:35', '2024-12-02 06:18:35', 'info@agtsindia.com', 2, 17, '14.194.181.190'),
(202, '2024-12-02 06:34:44', '2024-12-02 06:34:44', 'admin@mtechsystems.co.in', 1, 1, '110.227.16.25'),
(203, '2024-12-02 08:51:22', '2024-12-02 08:51:22', 'shital@cellx.in', 2, 15, '219.91.175.69'),
(204, '2024-12-02 09:34:41', '2024-12-02 09:34:41', 'info@agtsindia.com', 2, 17, '14.194.181.190'),
(205, '2024-12-02 09:40:20', '2024-12-02 09:40:20', 'admin@mtechsystems.co.in', 1, 1, '110.227.16.25'),
(206, '2024-12-02 09:48:54', '2024-12-02 09:48:54', 'admin@mtechsystems.co.in', 1, 1, '110.227.16.25'),
(207, '2024-12-02 11:05:40', '2024-12-02 11:05:40', 'mr.ayansaha@gmail.com', 2, 19, '115.99.186.161'),
(208, '2024-12-06 09:54:44', '2024-12-06 09:54:44', 'admin@mtechsystems.co.in', 1, 1, '106.193.246.238'),
(209, '2024-12-11 06:34:27', '2024-12-11 06:34:27', 'admin@example.in', 1, 1, '106.193.96.26'),
(210, '2024-12-11 06:43:38', '2024-12-11 06:43:38', 'test@test.com', 2, 20, '106.193.96.26'),
(211, '2024-12-27 08:34:47', '2024-12-27 08:34:47', 'admin@example.in', 1, 1, '27.59.71.157'),
(212, '2024-12-27 14:27:21', '2024-12-27 14:27:21', 'admin@example.in', 1, 1, '103.158.91.246'),
(213, '2024-12-27 15:12:54', '2024-12-27 15:12:54', 'admin@example.in', 1, 1, '103.158.91.246');

-- --------------------------------------------------------

--
-- Table structure for table `manual_subscriptions`
--

CREATE TABLE `manual_subscriptions` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `plan_id` varchar(100) DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `charges` decimal(13,4) DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `charges_frequency` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `message_labels`
--

CREATE TABLE `message_labels` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `labels__id` int(10) UNSIGNED NOT NULL,
  `whatsapp_message_logs__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `show_in_menu` tinyint(3) UNSIGNED DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `type` tinyint(3) UNSIGNED NOT NULL,
  `vendors__id` int(10) UNSIGNED DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`_id`, `_uid`, `created_at`, `updated_at`, `status`, `title`, `show_in_menu`, `content`, `type`, `vendors__id`, `slug`, `image_name`) VALUES
(1, '09035dc7-ee9f-40dd-90df-06a986f34584', '2024-11-13 20:23:31', '2024-12-27 14:38:19', 1, 'Privacy Policy', 1, '1. Introduction\r\nAt WiseSender, we are committed to protecting the privacy of our users. This Privacy Policy outlines how we collect, use, and protect personal data when you use our WhatsApp Business API platform.\r\n\r\n2. Data Collection\r\nUser Data: We collect information, including name, contact details, and payment information, during registration and use of the platform.\r\nUsage Data: We may collect technical data such as IP addresses, device types, and browsing patterns to improve platform functionality and ensure security.\r\nEnd-User Data: Users are responsible for obtaining consent from end-users before collecting or processing any personal information through WhatsApp messages.\r\n3. Data Usage\r\nService Provision: We use collected data to provide, support, and improve our WhatsApp Business API services.\r\nCommunication: We may use your contact information to notify you of updates, service changes, or support-related communications.\r\nCompliance: We process data as needed to comply with legal and regulatory requirements, including Meta’s policies.\r\n4. Data Sharing\r\nWe do not sell, rent, or trade user data. However, we may share information with trusted third-party service providers who support our operations, strictly under confidentiality obligations.\r\nWe may disclose data if required by law or to protect our legal rights.\r\n5. Data Security\r\nWe implement security measures to protect against unauthorized access, disclosure, alteration, or destruction of personal data. Users are also responsible for securing their account credentials.\r\n6. Data Retention\r\nWe retain user data only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal obligations.\r\n7. User Rights\r\nUsers may access, modify, or delete their data as permitted by applicable law. For assistance, please contact our support team.\r\n8. Changes to this Privacy Policy\r\nWe may update this Privacy Policy periodically. Users will be notified of significant changes, and continued use of the platform signifies acceptance of the revised policy.\r\n9. Contact Information\r\nFor questions about this Privacy Policy, contact us at:\r\n\r\nEmail: support@wisesender.in', 1, NULL, 'privacy', NULL),
(2, '4917936f-a1bd-4dfb-8ae1-d9f04885bd18', '2024-11-13 20:25:18', '2024-11-13 20:25:51', 1, 'Terms And Conditions', 1, '1. User Responsibilities\r\n- Users must use the Platform only for lawful purposes and follow Meta’s WhatsApp Business policies.\r\n- Fraudulent, deceptive, or misleading marketing practices are prohibited.\r\n\r\n2.  Account Security\r\n- Users are responsible for safeguarding their account credentials and must report unauthorized access immediately.\r\n\r\n3. Payments and Billing\r\n- Users agree to pay all service fees on time. Failure to pay may result in account suspension.\r\n\r\n4. Data Protection\r\n- Users must obtain necessary consent from end-users before sending WhatsApp messages and comply with all data privacy laws.\r\n\r\n5. Compliance with Meta Policies\r\n- Users must adhere to Meta’s guidelines to avoid suspension or termination of access to the WhatsApp Business API.', 1, NULL, 'terms', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(19) UNSIGNED NOT NULL,
  `vendor_model__id` bigint(19) UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_price` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_items`
--

CREATE TABLE `subscription_items` (
  `id` bigint(19) UNSIGNED NOT NULL,
  `stripe_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_product` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_price` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `subscription_id` bigint(19) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `contacts__id` int(10) UNSIGNED NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `subject` varchar(150) CHARACTER SET utf8mb4 DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 DEFAULT NULL,
  `priority` varchar(10) CHARACTER SET utf8 DEFAULT NULL,
  `vendor_users__id` int(10) UNSIGNED DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `assigned_users__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `amount` decimal(13,4) DEFAULT NULL,
  `reference_id` varchar(45) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `vendors__id` int(10) UNSIGNED DEFAULT NULL,
  `subscriptions_id` bigint(19) UNSIGNED DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `manual_subscriptions__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `username` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL,
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Make unique with country phone code',
  `timezone` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registered_via` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Social account',
  `ban_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countries__id` smallint(5) UNSIGNED DEFAULT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `email_verified_at` datetime DEFAULT NULL,
  `user_roles__id` tinyint(3) UNSIGNED NOT NULL,
  `vendors__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`_id`, `_uid`, `created_at`, `updated_at`, `username`, `email`, `password`, `status`, `remember_token`, `first_name`, `last_name`, `mobile_number`, `timezone`, `registered_via`, `ban_reason`, `countries__id`, `two_factor_secret`, `two_factor_recovery_codes`, `email_verified_at`, `user_roles__id`, `vendors__id`) VALUES
(1, '50ee1967-7341-4c3a-b071-f2ea0722b179', '2024-11-13 17:26:47', '2024-12-27 15:11:31', 'superadmin', 'admin@example.in', '$2y$10$MSZxndE0sizE2b9rWU/RI.7BEfm3ioPFigDTL0u2A8GqTFsTzoi6u', 1, 'Ez47xFPAArfuWeFRGW6m5Xf7csEi1Q1D4K1c3hrtNmp8mw4oyDVb8U1JH08z', 'Super', 'Administrator', '9354158622', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL),
(22, '48a53e8e-83b8-48a0-ab87-e184471046e1', '2024-12-27 15:12:30', '2024-12-27 15:12:30', 'test1', 'test1@gmail.com', '$2y$10$8idZYbFTLpWvuXbZSEO/KOlP1ufyJm.aMvC2ykReyLUaSjCP46a4y', 1, 'baded9e9-b5d7-4fba-95e5-ae98aff85fd8', 'test', '1', '9999999999', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 20);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `_id` tinyint(3) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`_id`, `_uid`, `status`, `created_at`, `updated_at`, `title`) VALUES
(1, '15f21c9f-88bb-4fec-bad4-03eb9d9065f8', 1, '2024-11-13 17:26:47', '2024-11-13 17:26:47', 'Super Admin'),
(2, '287133c4-2afc-4f65-ab3c-28b0df8a099a', 1, '2024-11-13 17:26:47', '2024-11-13 17:26:47', 'Vendor Admin'),
(3, '30ee1967-4nfc-4f65-87bb-g2ea0722b178', 1, '2024-11-13 17:26:47', '2024-11-13 17:26:47', 'Vendor User');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `key_name` varchar(45) NOT NULL,
  `value` text,
  `data_type` tinyint(4) DEFAULT NULL,
  `users__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `ban_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Restaurent',
  `stripe_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `pm_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pm_last_four` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`_id`, `_uid`, `status`, `updated_at`, `created_at`, `ban_reason`, `type`, `stripe_id`, `pm_type`, `pm_last_four`, `trial_ends_at`, `title`, `logo_image`, `slug`, `domain`, `favicon`) VALUES
(20, 'd5736f05-e919-4850-97a9-2e6ffce33ea5', 1, '2024-12-27 15:12:30', '2024-12-27 15:12:30', NULL, 1, NULL, NULL, NULL, NULL, 'test1', NULL, 'test1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendor_settings`
--

CREATE TABLE `vendor_settings` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `data_type` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendor_users`
--

CREATE TABLE `vendor_users` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `users__id` int(10) UNSIGNED NOT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_message_logs`
--

CREATE TABLE `whatsapp_message_logs` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `message` text CHARACTER SET utf8mb4,
  `contacts__id` int(10) UNSIGNED DEFAULT NULL,
  `campaigns__id` int(10) UNSIGNED DEFAULT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `contact_wa_id` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wamid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wab_phone_number_id` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_incoming_message` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Incoming,outgoing',
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `messaged_at` datetime DEFAULT NULL,
  `is_forwarded` tinyint(1) DEFAULT NULL,
  `replied_to_whatsapp_message_logs__uid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `messaged_by_users__id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_message_queue`
--

CREATE TABLE `whatsapp_message_queue` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `vendors__id` int(10) UNSIGNED NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `phone_with_country_code` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaigns__id` int(10) UNSIGNED NOT NULL,
  `contacts__id` int(10) UNSIGNED DEFAULT NULL,
  `retries` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_templates`
--

CREATE TABLE `whatsapp_templates` (
  `_id` int(10) UNSIGNED NOT NULL,
  `_uid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_name` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `template_id` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `__data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `vendors__id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `bot_flows`
--
ALTER TABLE `bot_flows`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD KEY `fk_bot_flows_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `bot_replies`
--
ALTER TABLE `bot_replies`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_bot_replies_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_bot_replies_bot_flows1_idx` (`bot_flows__id`),
  ADD KEY `fk_bot_replies_bot_replies1_idx` (`bot_replies__id`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_campaigns_whatsapp_templates1_idx` (`whatsapp_templates__id`),
  ADD KEY `fk_campaigns_users1_idx` (`users__id`),
  ADD KEY `fk_campaigns_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `campaign_groups`
--
ALTER TABLE `campaign_groups`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_campaign_groups_campaigns1_idx` (`campaigns__id`),
  ADD KEY `fk_campaign_groups_contact_groups1_idx` (`contact_groups__id`);

--
-- Indexes for table `configurations`
--
ALTER TABLE `configurations`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_contacts_countries1_idx` (`countries__id`),
  ADD KEY `fk_contacts_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_contacts_users1_idx` (`assigned_users__id`);

--
-- Indexes for table `contact_custom_fields`
--
ALTER TABLE `contact_custom_fields`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_contact_custom_fields_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `contact_custom_field_values`
--
ALTER TABLE `contact_custom_field_values`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_contact_custom_field_values_contacts1_idx` (`contacts__id`),
  ADD KEY `fk_contact_custom_field_values_contact_custom_fields1_idx` (`contact_custom_fields__id`);

--
-- Indexes for table `contact_groups`
--
ALTER TABLE `contact_groups`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_groups_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `contact_labels`
--
ALTER TABLE `contact_labels`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_contact_labels_labels1_idx` (`labels__id`),
  ADD KEY `fk_contact_labels_contacts1_idx` (`contacts__id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `group_contacts`
--
ALTER TABLE `group_contacts`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_group_contacts_contact_groups1_idx` (`contact_groups__id`),
  ADD KEY `fk_group_contacts_contacts1_idx` (`contacts__id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_labels_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `manual_subscriptions`
--
ALTER TABLE `manual_subscriptions`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_manual_subscriptions_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `message_labels`
--
ALTER TABLE `message_labels`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_message_labels_labels1_idx` (`labels__id`),
  ADD KEY `fk_message_labels_whatsapp_message_logs1_idx` (`whatsapp_message_logs__id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `title_UNIQUE` (`title`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_pages_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_user_id_stripe_status_index` (`vendor_model__id`,`stripe_status`),
  ADD KEY `stripe_status` (`stripe_status`),
  ADD KEY `vendor_model__id` (`vendor_model__id`);

--
-- Indexes for table `subscription_items`
--
ALTER TABLE `subscription_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_plan_UNIQUE` (`stripe_price`,`subscription_id`),
  ADD KEY `subscription_items_stripe_id_index` (`stripe_id`),
  ADD KEY `fk_subscription_items_subscriptions1_idx` (`subscription_id`),
  ADD KEY `stripe_id` (`stripe_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_tickets_contacts1_idx` (`contacts__id`),
  ADD KEY `fk_tickets_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_tickets_vendor_users1_idx` (`vendor_users__id`),
  ADD KEY `fk_tickets_users1_idx` (`assigned_users__id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `reference_id_UNIQUE` (`reference_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_transactions_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_transactions_subscriptions1_idx` (`subscriptions_id`),
  ADD KEY `fk_transactions_manual_subscriptions1_idx` (`manual_subscriptions__id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`),
  ADD KEY `fk_users_countries1_idx` (`countries__id`),
  ADD KEY `fk_users_user_roles1_idx` (`user_roles__id`),
  ADD KEY `fk_users_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `name` (`key_name`),
  ADD KEY `fk_user_settings_users1_idx` (`users__id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `stripe_id` (`stripe_id`);

--
-- Indexes for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_vendor_settings_vendors1_idx` (`vendors__id`);

--
-- Indexes for table `vendor_users`
--
ALTER TABLE `vendor_users`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_vendor_users_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_vendor_users_users1_idx` (`users__id`);

--
-- Indexes for table `whatsapp_message_logs`
--
ALTER TABLE `whatsapp_message_logs`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_whatsapp_message_status_logs_contacts1_idx` (`contacts__id`),
  ADD KEY `fk_whatsapp_message_status_logs_campaigns1_idx` (`campaigns__id`),
  ADD KEY `fk_whatsapp_message_status_logs_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_whatsapp_message_logs_users1_idx` (`messaged_by_users__id`);

--
-- Indexes for table `whatsapp_message_queue`
--
ALTER TABLE `whatsapp_message_queue`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_whatsapp_message_queue_vendors1_idx` (`vendors__id`),
  ADD KEY `fk_whatsapp_message_queue_campaigns1_idx` (`campaigns__id`),
  ADD KEY `fk_whatsapp_message_queue_contacts1_idx` (`contacts__id`);

--
-- Indexes for table `whatsapp_templates`
--
ALTER TABLE `whatsapp_templates`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_uid_UNIQUE` (`_uid`),
  ADD UNIQUE KEY `_uid` (`_uid`),
  ADD KEY `fk_whatsapp_templates_vendors1_idx` (`vendors__id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `bot_flows`
--
ALTER TABLE `bot_flows`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bot_replies`
--
ALTER TABLE `bot_replies`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `campaign_groups`
--
ALTER TABLE `campaign_groups`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `configurations`
--
ALTER TABLE `configurations`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `contact_custom_fields`
--
ALTER TABLE `contact_custom_fields`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_custom_field_values`
--
ALTER TABLE `contact_custom_field_values`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `contact_groups`
--
ALTER TABLE `contact_groups`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `contact_labels`
--
ALTER TABLE `contact_labels`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_contacts`
--
ALTER TABLE `group_contacts`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `labels`
--
ALTER TABLE `labels`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=214;

--
-- AUTO_INCREMENT for table `manual_subscriptions`
--
ALTER TABLE `manual_subscriptions`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `message_labels`
--
ALTER TABLE `message_labels`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(19) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_items`
--
ALTER TABLE `subscription_items`
  MODIFY `id` bigint(19) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `vendor_users`
--
ALTER TABLE `vendor_users`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `whatsapp_message_logs`
--
ALTER TABLE `whatsapp_message_logs`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=529;

--
-- AUTO_INCREMENT for table `whatsapp_message_queue`
--
ALTER TABLE `whatsapp_message_queue`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `whatsapp_templates`
--
ALTER TABLE `whatsapp_templates`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bot_flows`
--
ALTER TABLE `bot_flows`
  ADD CONSTRAINT `fk_bot_flows_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `bot_replies`
--
ALTER TABLE `bot_replies`
  ADD CONSTRAINT `fk_bot_replies_bot_flows1` FOREIGN KEY (`bot_flows__id`) REFERENCES `bot_flows` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_bot_replies_bot_replies1` FOREIGN KEY (`bot_replies__id`) REFERENCES `bot_replies` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_bot_replies_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `fk_campaigns_users1` FOREIGN KEY (`users__id`) REFERENCES `users` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_campaigns_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_campaigns_whatsapp_templates1` FOREIGN KEY (`whatsapp_templates__id`) REFERENCES `whatsapp_templates` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `campaign_groups`
--
ALTER TABLE `campaign_groups`
  ADD CONSTRAINT `fk_campaign_groups_campaigns1` FOREIGN KEY (`campaigns__id`) REFERENCES `campaigns` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_campaign_groups_contact_groups1` FOREIGN KEY (`contact_groups__id`) REFERENCES `contact_groups` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_countries1` FOREIGN KEY (`countries__id`) REFERENCES `countries` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contacts_users1` FOREIGN KEY (`assigned_users__id`) REFERENCES `users` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contacts_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contact_custom_fields`
--
ALTER TABLE `contact_custom_fields`
  ADD CONSTRAINT `fk_contact_custom_fields_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contact_custom_field_values`
--
ALTER TABLE `contact_custom_field_values`
  ADD CONSTRAINT `fk_contact_custom_field_values_contact_custom_fields1` FOREIGN KEY (`contact_custom_fields__id`) REFERENCES `contact_custom_fields` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contact_custom_field_values_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contact_groups`
--
ALTER TABLE `contact_groups`
  ADD CONSTRAINT `fk_groups_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contact_labels`
--
ALTER TABLE `contact_labels`
  ADD CONSTRAINT `fk_contact_labels_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contact_labels_labels1` FOREIGN KEY (`labels__id`) REFERENCES `labels` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `group_contacts`
--
ALTER TABLE `group_contacts`
  ADD CONSTRAINT `fk_group_contacts_contact_groups1` FOREIGN KEY (`contact_groups__id`) REFERENCES `contact_groups` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_group_contacts_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `labels`
--
ALTER TABLE `labels`
  ADD CONSTRAINT `fk_labels_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `manual_subscriptions`
--
ALTER TABLE `manual_subscriptions`
  ADD CONSTRAINT `fk_manual_subscriptions_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `message_labels`
--
ALTER TABLE `message_labels`
  ADD CONSTRAINT `fk_message_labels_labels1` FOREIGN KEY (`labels__id`) REFERENCES `labels` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_message_labels_whatsapp_message_logs1` FOREIGN KEY (`whatsapp_message_logs__id`) REFERENCES `whatsapp_message_logs` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `pages`
--
ALTER TABLE `pages`
  ADD CONSTRAINT `fk_pages_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `subscription_items`
--
ALTER TABLE `subscription_items`
  ADD CONSTRAINT `fk_subscription_items_subscriptions1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_tickets_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tickets_users1` FOREIGN KEY (`assigned_users__id`) REFERENCES `users` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tickets_vendor_users1` FOREIGN KEY (`vendor_users__id`) REFERENCES `vendor_users` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tickets_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_manual_subscriptions1` FOREIGN KEY (`manual_subscriptions__id`) REFERENCES `manual_subscriptions` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_transactions_subscriptions1` FOREIGN KEY (`subscriptions_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_transactions_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_countries1` FOREIGN KEY (`countries__id`) REFERENCES `countries` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_users_user_roles1` FOREIGN KEY (`user_roles__id`) REFERENCES `user_roles` (`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_users_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_user_settings_users1` FOREIGN KEY (`users__id`) REFERENCES `users` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  ADD CONSTRAINT `fk_vendor_settings_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `vendor_users`
--
ALTER TABLE `vendor_users`
  ADD CONSTRAINT `fk_vendor_users_users1` FOREIGN KEY (`users__id`) REFERENCES `users` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_vendor_users_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `whatsapp_message_logs`
--
ALTER TABLE `whatsapp_message_logs`
  ADD CONSTRAINT `fk_whatsapp_message_logs_users1` FOREIGN KEY (`messaged_by_users__id`) REFERENCES `users` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_whatsapp_message_status_logs_campaigns1` FOREIGN KEY (`campaigns__id`) REFERENCES `campaigns` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_whatsapp_message_status_logs_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_whatsapp_message_status_logs_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `whatsapp_message_queue`
--
ALTER TABLE `whatsapp_message_queue`
  ADD CONSTRAINT `fk_whatsapp_message_queue_campaigns1` FOREIGN KEY (`campaigns__id`) REFERENCES `campaigns` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_whatsapp_message_queue_contacts1` FOREIGN KEY (`contacts__id`) REFERENCES `contacts` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_whatsapp_message_queue_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `whatsapp_templates`
--
ALTER TABLE `whatsapp_templates`
  ADD CONSTRAINT `fk_whatsapp_templates_vendors1` FOREIGN KEY (`vendors__id`) REFERENCES `vendors` (`_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
