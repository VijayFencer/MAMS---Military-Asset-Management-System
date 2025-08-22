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
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `item` varchar(120) NOT NULL,
  `quantity` int unsigned NOT NULL,
  `price` float unsigned NOT NULL,
  `location` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `base_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,'Rifles',50,1200,'Alpha','2024-01-15',1,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(2,'Ammunition',1000,2.5,'Alpha','2024-01-16',1,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(3,'Body Armor',25,800,'Alpha','2024-01-17',1,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(4,'Rifles',30,1200,'Beta','2024-01-15',2,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(5,'Ammunition',800,2.5,'Beta','2024-01-16',2,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(6,'Night Vision Goggles',15,1500,'Beta','2024-01-18',2,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(7,'Rifles',40,1200,'Charley','2024-01-15',3,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(8,'Ammunition',1200,2.5,'Charley','2024-01-16',3,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(9,'Communication Equipment',20,500,'Charley','2024-01-19',3,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(10,'Rifles',35,1200,'Delta','2024-01-15',4,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(11,'Ammunition',900,2.5,'Delta','2024-01-16',4,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(12,'Medical Supplies',30,300,'Delta','2024-01-20',4,'2025-08-20 15:23:20','2025-08-20 15:23:20'),(13,'AK',1,20000,'Alpha','2025-08-20',1,'2025-08-20 10:58:26','2025-08-20 10:58:26'),(14,'AK',1,20000,'Alpha','2025-08-20',1,'2025-08-20 10:58:55','2025-08-20 10:58:55'),(15,'UMP',25,4500,'Delta','2025-08-22',4,'2025-08-22 16:52:09','2025-08-22 16:52:09');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
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
