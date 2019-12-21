DROP DATABASE IF EXISTS lab4;
CREATE DATABASE `lab4` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lab4;

CREATE TABLE `bankuser`
(
    id int PRIMARY KEY,
    username varchar(255) UNIQUE,
    valid tinyint(1) NOT NULL
);

CREATE TABLE `bankcurrency`
(
    id int PRIMARY KEY,
    currency int NOT NULL,
    FOREIGN KEY(id) REFERENCES bankuser(id)
);

CREATE TABLE `bankidentity`
(
    id int PRIMARY KEY,
    isadmin tinyint(1) NOT NULL,
    FOREIGN KEY(id) REFERENCES bankuser(id)
);

INSERT INTO `bankuser` VALUES (1, 'admin', true);
INSERT INTO `bankuser` VALUES (2, 'ziyang', true);
INSERT INTO `bankuser` VALUES (3, 'exp', true);

INSERT INTO `bankcurrency` VALUES (2, 100);
INSERT INTO `bankcurrency` VALUES (3, 40);

INSERT INTO `bankidentity` VALUES (1, 1);
INSERT INTO `bankidentity` VALUES (2, 0);
INSERT INTO `bankidentity` VALUES (3, 0);

DROP USER if EXISTS 'admin'@'localhost';
DROP USER if EXISTS 'ziyang'@'localhost';
DROP USER if EXISTS 'exp'@'localhost';

CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin';
CREATE USER 'ziyang'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ziyang';
CREATE USER 'exp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'exp';

DROP PROCEDURE IF EXISTS queryalluser;
DELIMITER $$
CREATE PROCEDURE queryalluser()
BEGIN
    SELECT lab4.bankuser.id, lab4.bankuser.username, lab4.bankcurrency.currency 
    FROM lab4.bankuser, lab4.bankidentity, lab4.bankcurrency 
    WHERE lab4.bankuser.id = lab4.bankcurrency.id 
    AND lab4.bankuser.id = lab4.bankidentity.id 
    AND lab4.bankidentity.isadmin = 0
    AND lab4.bankuser.valid = true;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS changecurrencybyusername;
DELIMITER $$
CREATE PROCEDURE changecurrencybyusername(IN p_username varchar(255), IN p_currency int)
BEGIN
    DECLARE p_id int;
    SELECT id INTO p_id FROM lab4.bankuser WHERE username=p_username AND valid=true;
    UPDATE lab4.bankcurrency SET currency=p_currency WHERE id=p_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS querysingleusercurrency;
DELIMITER $$
CREATE PROCEDURE querysingleusercurrency(IN p_username varchar(255))
BEGIN
    DECLARE p_id int;
    SELECT id INTO p_id FROM lab4.bankuser WHERE username=p_username AND valid=true;
    SELECT currency FROM lab4.bankcurrency WHERE id=p_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS querysingleuseridentity;
DELIMITER $$
CREATE PROCEDURE querysingleuseridentity(IN p_username varchar(255))
BEGIN
    DECLARE p_id int;
    SELECT id INTO p_id FROM lab4.bankuser WHERE username=p_username AND valid=true;
    SELECT isadmin FROM lab4.bankidentity WHERE id=p_id;
END$$
DELIMITER ;

GRANT select ON lab4.bankuser TO 'admin'@'localhost';
GRANT select(id), select(currency), update(currency) ON lab4.bankcurrency TO 'admin'@'localhost';
GRANT select ON lab4.bankidentity TO 'admin'@'localhost';
GRANT EXECUTE ON PROCEDURE lab4.queryalluser TO 'admin'@'localhost';
GRANT EXECUTE ON PROCEDURE lab4.changecurrencybyusername TO 'admin'@'localhost';
GRANT EXECUTE ON PROCEDURE lab4.querysingleusercurrency TO 'admin'@'localhost';

GRANT select ON lab4.bankuser TO 'ziyang'@'localhost';
GRANT select ON lab4.bankcurrency TO 'ziyang'@'localhost';
GRANT select ON lab4.bankidentity TO 'ziyang'@'localhost';
GRANT EXECUTE ON PROCEDURE lab4.querysingleusercurrency TO 'ziyang'@'localhost';

GRANT select ON lab4.bankuser TO 'exp'@'localhost';
GRANT select ON lab4.bankcurrency TO 'exp'@'localhost';
GRANT select ON lab4.bankidentity TO 'exp'@'localhost';
GRANT EXECUTE ON PROCEDURE lab4.querysingleusercurrency TO 'exp'@'localhost';

FLUSH PRIVILEGES;