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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `resource` varchar(80) DEFAULT NULL,
  `resource_id` varchar(80) DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'CREATE_TRANSFER','transfer','1','{\"date\": \"2025-08-20\", \"item\": \"Rifles\", \"quantity\": 10, \"afterStock\": 40, \"sourceBase\": \"Alpha\", \"beforeStock\": 50, \"sourceBaseId\": \"1\", \"destinationBase\": \"Charley\", \"destinationBaseId\": \"3\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-20 10:20:28','2025-08-20 10:20:28'),(2,1,'CREATE_ASSIGNMENT','assignment','13','{\"item\": \"Ammunition\", \"quantity\": 1, \"personnel\": \"Alpha Squad B\", \"baseLocation\": \"Alpha\", \"dateAssigned\": \"2025-08-20\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-20 10:55:27','2025-08-20 10:55:27'),(3,2,'CREATE','purchase','13','{\"id\": 13, \"date\": \"2025-08-20\", \"item\": \"AK\", \"price\": 20000, \"base_id\": 1, \"location\": \"Alpha\", \"quantity\": 1, \"createdAt\": \"2025-08-20T10:58:26.551Z\", \"updatedAt\": \"2025-08-20T10:58:26.551Z\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-20 10:58:26','2025-08-20 10:58:26'),(4,2,'CREATE','purchase','14','{\"id\": 14, \"date\": \"2025-08-20\", \"item\": \"AK\", \"price\": 20000, \"base_id\": 1, \"location\": \"Alpha\", \"quantity\": 1, \"createdAt\": \"2025-08-20T10:58:55.064Z\", \"updatedAt\": \"2025-08-20T10:58:55.064Z\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-20 10:58:55','2025-08-20 10:58:55'),(5,2,'CREATE_TRANSFER','transfer','2','{\"date\": \"2025-08-20\", \"item\": \"AK\", \"quantity\": 1, \"afterStock\": 1, \"sourceBase\": \"Alpha\", \"beforeStock\": 2, \"sourceBaseId\": \"1\", \"destinationBase\": \"Beta\", \"destinationBaseId\": \"2\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-20 11:58:53','2025-08-20 11:58:53'),(6,1,'CREATE_TRANSFER','transfer','3','{\"date\": \"2025-08-21\", \"item\": \"Ammunition\", \"quantity\": 100, \"afterStock\": 700, \"sourceBase\": \"Beta\", \"beforeStock\": 800, \"sourceBaseId\": \"2\", \"destinationBase\": \"Charley\", \"destinationBaseId\": \"3\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-21 04:47:58','2025-08-21 04:47:58'),(7,1,'CREATE_TRANSFER','transfer','4','{\"date\": \"2025-08-21\", \"item\": \"Night Vision Goggles\", \"quantity\": 1, \"afterStock\": 14, \"sourceBase\": \"Beta\", \"beforeStock\": 15, \"sourceBaseId\": \"2\", \"destinationBase\": \"Charley\", \"destinationBaseId\": \"3\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-21 16:36:22','2025-08-21 16:36:22'),(8,1,'CREATE_TRANSFER','transfer','5','{\"date\": \"2025-08-22\", \"item\": \"Ammunition\", \"quantity\": 100, \"afterStock\": 600, \"sourceBase\": \"Beta\", \"beforeStock\": 700, \"sourceBaseId\": \"2\", \"destinationBase\": \"Charley\", \"destinationBaseId\": \"3\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-22 07:40:28','2025-08-22 07:40:28'),(9,1,'CREATE','purchase','15','{\"id\": 15, \"date\": \"2025-08-22\", \"item\": \"UMP\", \"price\": 4500, \"base_id\": 4, \"location\": \"Delta\", \"quantity\": 25, \"createdAt\": \"2025-08-22T16:52:09.518Z\", \"updatedAt\": \"2025-08-22T16:52:09.518Z\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-22 16:52:09','2025-08-22 16:52:09'),(10,1,'CREATE_TRANSFER','transfer','6','{\"date\": \"2025-08-22\", \"item\": \"UMP\", \"quantity\": 5, \"afterStock\": 20, \"sourceBase\": \"Delta\", \"beforeStock\": 25, \"sourceBaseId\": \"4\", \"destinationBase\": \"Alpha\", \"destinationBaseId\": \"1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-22 16:52:39','2025-08-22 16:52:39'),(11,1,'CREATE_ASSIGNMENT','assignment','14','{\"date\": \"2025-08-21\", \"item\": \"Ammunition\", \"quantity\": 10, \"personnel\": \"Beta Squad B\", \"baseLocation\": \"Beta\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-22 16:53:27','2025-08-22 16:53:27'),(12,1,'CREATE_EXPENDITURE','expenditure','9','{\"date\": \"2025-08-22\", \"item\": \"Rifles\", \"reason\": \"Testing\", \"quantity\": 2, \"baseLocation\": \"Beta\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','2025-08-22 16:53:52','2025-08-22 16:53:52');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
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
