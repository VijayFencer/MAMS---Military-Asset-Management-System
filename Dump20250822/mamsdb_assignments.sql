-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: mamsdb
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `item` varchar(120) NOT NULL,
  `quantity` int unsigned NOT NULL,
  `base_location` varchar(100) NOT NULL,
  `personnel` varchar(150) NOT NULL,
  `date_assigned` date NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'assigned',
  `base_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,'Rifles',10,'Alpha','Alpha Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(2,'Ammunition',200,'Alpha','Alpha Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(3,'Body Armor',5,'Alpha','Alpha Squad B','2024-01-21','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(4,'Rifles',8,'Beta','Beta Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(5,'Ammunition',150,'Beta','Beta Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(6,'Night Vision Goggles',3,'Beta','Beta Squad B','2024-01-22','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(7,'Rifles',12,'Charley','Charley Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(8,'Ammunition',250,'Charley','Charley Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(9,'Communication Equipment',5,'Charley','Charley Squad B','2024-01-23','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(10,'Rifles',9,'Delta','Delta Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(11,'Ammunition',180,'Delta','Delta Squad A','2024-01-20','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(12,'Medical Supplies',8,'Delta','Delta Squad B','2024-01-24','assigned',NULL,'2025-08-20 15:24:05','2025-08-20 15:24:05'),(13,'Ammunition',1,'Alpha','Alpha Squad B','2025-08-20','assigned',NULL,'2025-08-20 10:55:27','2025-08-20 10:55:27'),(14,'Ammunition',10,'Beta','Beta Squad B','2025-08-22','assigned',NULL,'2025-08-22 16:53:27','2025-08-22 16:53:27');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-22 23:01:14
