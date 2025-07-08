-- MySQL setup script for ecommerce application
-- Run this script as MySQL root user

-- Create the development database
CREATE DATABASE IF NOT EXISTS ecommerce_db_dev 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create the production database (optional)
CREATE DATABASE IF NOT EXISTS ecommerce_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create the ecommerce user
CREATE USER IF NOT EXISTS 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';

-- Grant all privileges on the development database
GRANT ALL PRIVILEGES ON ecommerce_db_dev.* TO 'ecommerce_user'@'localhost';

-- Grant all privileges on the production database
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';

-- Grant privileges to create/drop databases for testing
GRANT CREATE, DROP ON *.* TO 'ecommerce_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show the created databases
SHOW DATABASES;

-- Show the created user
SELECT User, Host FROM mysql.user WHERE User = 'ecommerce_user'; 