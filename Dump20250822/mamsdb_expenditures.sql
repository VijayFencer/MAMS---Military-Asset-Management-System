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
-- Table structure for table `expenditures`
--

DROP TABLE IF EXISTS `expenditures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenditures` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `item` varchar(120) NOT NULL,
  `quantity` int unsigned NOT NULL,
  `base_location` varchar(100) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `base_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenditures`
--

LOCK TABLES `expenditures` WRITE;
/*!40000 ALTER TABLE `expenditures` DISABLE KEYS */;
INSERT INTO `expenditures` VALUES (1,'Ammunition',50,'Alpha','Training Exercise','2024-01-25',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(2,'Body Armor',2,'Alpha','Damaged in Field','2024-01-26',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(3,'Ammunition',40,'Beta','Training Exercise','2024-01-25',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(4,'Night Vision Goggles',1,'Beta','Equipment Failure','2024-01-27',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(5,'Ammunition',60,'Charley','Training Exercise','2024-01-25',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(6,'Communication Equipment',2,'Charley','Field Damage','2024-01-28',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(7,'Ammunition',45,'Delta','Training Exercise','2024-01-25',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(8,'Medical Supplies',5,'Delta','Emergency Use','2024-01-29',NULL,'2025-08-20 15:24:24','2025-08-20 15:24:24'),(9,'Rifles',2,'Beta','Testing','2025-08-22',NULL,'2025-08-22 16:53:52','2025-08-22 16:53:52');
/*!40000 ALTER TABLE `expenditures` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-22 23:01:15
