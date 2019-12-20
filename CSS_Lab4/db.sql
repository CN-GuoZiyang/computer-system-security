DROP DATABASE IF EXISTS lab3;
CREATE DATABASE `lab3` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lab3;

CREATE TABLE `bank`
(
    id int PRIMARY KEY AUTO_INCREMENT,
    username varchar(255) UNIQUE,
    currency int NOT NULL,
    valid tinyint(1) NOT NULL
);

INSERT INTO `bank` VALUES (1, 'ziyang', 100, true);
INSERT INTO `bank` VALUES (2, 'exp', 30, true);

DROP USER if EXISTS 'ziyang'@'localhost';
DROP USER if EXISTS 'exp'@'localhost';

FLUSH PRIVILEGES;

CREATE USER 'ziyang'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ziyang';
CREATE USER 'exp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'exp';

GRANT select(currency), select(username), select(valid) ON lab3.bank TO 'ziyang'@'localhost';
GRANT select(currency), select(username), select(valid) ON lab3.bank TO 'exp'@'localhost';

FLUSH PRIVILEGES;