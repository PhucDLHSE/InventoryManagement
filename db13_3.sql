-- DROP DATABASE IF EXISTS InventoryManagement;
-- CREATE DATABASE InventoryManagement;
USE InventoryManagement;

CREATE TABLE Role (
    role_id VARCHAR(255) NOT NULL PRIMARY KEY,
    role_type VARCHAR(255),
    role_name VARCHAR(255) NOT NULL
);

INSERT INTO Role (role_id, role_type, role_name) VALUES
('AD', 'ADMIN', 'Admin'),
('MA', 'MANAGER', 'Warehouse Manager'),
('ST', 'STAFF', 'Staff');

CREATE TABLE Category (
    category_id VARCHAR(255) NOT NULL PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(255) NOT NULL
);

CREATE TABLE Warehouse (
    warehouse_id VARCHAR(255) NOT NULL PRIMARY KEY,
    warehouse_code VARCHAR(6) NOT NULL UNIQUE,
    warehouse_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE User (
    user_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_code VARCHAR(6) NOT NULL UNIQUE,
    role_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    warehouse_code VARCHAR(6),
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(role_id),
    FOREIGN KEY (warehouse_code) REFERENCES Warehouse(warehouse_code)
);

CREATE TABLE ProductType (
    productType_id VARCHAR(255) NOT NULL PRIMARY KEY,
    productType_code VARCHAR(50) NOT NULL UNIQUE,
    productType_name VARCHAR(255) NOT NULL,
    price DOUBLE NULL,
    category_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (category_code) REFERENCES Category(category_code)
);

CREATE TABLE Product (
    product_id VARCHAR(255) NOT NULL PRIMARY KEY,
    product_code VARCHAR(6) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,  
    status ENUM('instock', 'outofstock') DEFAULT 'instock',
    productType_code VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (productType_code) REFERENCES ProductType(productType_code),
    UNIQUE (product_code) 
);

-- Phiếu nhập xuất kho
CREATE TABLE ExchangeNote (
    exchangeNote_id VARCHAR(255) NOT NULL PRIMARY KEY,
    warehouse_code VARCHAR(6) NOT NULL,  
    transactionType ENUM('IMPORT', 'EXPORT') NOT NULL,
    status ENUM('pending', 'accepted', 'finished', 'rejected') DEFAULT 'pending',
    source_warehouse_id VARCHAR(6) NULL, -- Kho xuất
    destination_warehouse_id VARCHAR(6) NULL, -- Kho nhận (có thể null nếu xuất ra ngoài)
    created_by VARCHAR(6) NOT NULL,  
    approved_by VARCHAR(6) NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_warehouse_id) REFERENCES Warehouse(warehouse_code),
    FOREIGN KEY (destination_warehouse_id) REFERENCES Warehouse(warehouse_code),
    FOREIGN KEY (created_by) REFERENCES User(user_code),
    FOREIGN KEY (approved_by) REFERENCES User(user_code)
);

-- Thông tin sản phẩm của Phiếu nhập xuất kho
CREATE TABLE NoteItem (
    noteItem_id VARCHAR(255) NOT NULL PRIMARY KEY,
    noteItem_code VARCHAR(6) NOT NULL UNIQUE,
    product_code VARCHAR(6) NOT NULL,
    exchangeNote_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (product_code) REFERENCES Product(product_code),
    FOREIGN KEY (exchangeNote_id) REFERENCES ExchangeNote(exchangeNote_id)
);

-- Kiểm kê
CREATE TABLE StockCheckNote (
    stockCheckNote_id VARCHAR(255) NOT NULL PRIMARY KEY,
    date DATE NOT NULL,
    warehouse_code VARCHAR(6) NOT NULL,
    checker VARCHAR(6) NOT NULL,
    description VARCHAR(255) NULL,
    stockCheck_status ENUM('pending','accepted', 'finished', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (warehouse_code) REFERENCES Warehouse(warehouse_code),
    FOREIGN KEY (checker) REFERENCES User(user_code)
);

CREATE TABLE StockCheckProduct (
    stockCheckProduct_id VARCHAR(255) NOT NULL PRIMARY KEY,
    stockCheckNote_id VARCHAR(255) NOT NULL,
    product_code VARCHAR(6) NOT NULL,
    last_quantity INT NOT NULL,
    total_export_quantity INT NOT NULL,
    total_import_quantity INT NOT NULL,
    actual_quantity INT NOT NULL,
    expected_quantity INT NOT NULL,
    difference INT GENERATED ALWAYS AS (actual_quantity - expected_quantity) STORED,
    FOREIGN KEY (stockCheckNote_id) REFERENCES StockCheckNote(stockCheckNote_id),
    FOREIGN KEY (product_code) REFERENCES Product(product_code)
);

ALTER TABLE ExchangeNote
MODIFY warehouse_code VARCHAR(6) NULL;


