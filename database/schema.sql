-- Hospify (Relational Representation)
-- Generated from Mongoose models: Admin, Department, Item, Vendor, Order
-- Rule: ObjectId mapped to INT AUTO_INCREMENT primary keys.

CREATE TABLE Admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE Department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE Item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  quantity INT NOT NULL,
  threshold INT NOT NULL,
  departmentId INT NOT NULL,
  CONSTRAINT fk_item_department
    FOREIGN KEY (departmentId) REFERENCES Department(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_item_department_name UNIQUE (departmentId, name),
  CONSTRAINT chk_item_quantity_nonneg CHECK (quantity >= 0),
  CONSTRAINT chk_item_threshold_nonneg CHECK (threshold >= 0)
);

CREATE TABLE Vendor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  itemId INT NOT NULL,
  CONSTRAINT fk_vendor_item
    FOREIGN KEY (itemId) REFERENCES Item(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_vendor_item_name UNIQUE (itemId, name)
);

CREATE TABLE `Order` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  departmentId INT NOT NULL,
  vendorId INT NOT NULL,
  quantity INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_order_item
    FOREIGN KEY (itemId) REFERENCES Item(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_order_department
    FOREIGN KEY (departmentId) REFERENCES Department(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_order_vendor
    FOREIGN KEY (vendorId) REFERENCES Vendor(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_order_quantity_pos CHECK (quantity >= 1),
  CONSTRAINT chk_order_status CHECK (status IN ('pending','completed'))
);

