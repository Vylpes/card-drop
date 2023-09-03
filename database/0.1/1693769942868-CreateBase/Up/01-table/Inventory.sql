CREATE TABLE `inventory` (
  `Id` varchar(255) NOT NULL,
  `WhenCreated` datetime NOT NULL,
  `WhenUpdated` datetime NOT NULL,
  `UserId` varchar(255) NOT NULL,
  `CardNumber` varchar(255) NOT NULL,
  `Quantity` int NOT NULL,
  `ClaimId` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;