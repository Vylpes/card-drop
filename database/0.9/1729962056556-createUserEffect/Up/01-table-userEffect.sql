CREATE TABLE `user_effect` (
    `Id` varchar(255) NOT NULL,
    `WhenCreated` datetime NOT NULL,
    `WhenUpdated` datetime NOT NULL,
    `Name` varchar(255) NOT NULL,
    `UserId` varchar(255) NOT NULL,
    `Unused` int NOT NULL DEFAULT 0,
    `WhenExpires` datetime NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
