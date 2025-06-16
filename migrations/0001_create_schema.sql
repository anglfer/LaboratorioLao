-- Script para crear la base de datos y tablas principales para Laboratorio Lao
-- Ejecuta esto en tu servidor MySQL antes de correr tu app

CREATE DATABASE IF NOT EXISTS laboratorio_lao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laboratorio_lao;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos (obra)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    client_id INT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Catálogo de pruebas (test_catalog)
CREATE TABLE IF NOT EXISTS test_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_code VARCHAR(50) NOT NULL UNIQUE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    standard_price DECIMAL(10,2),
    duration INT,
    equipment TEXT,
    standards TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_test_catalog_type ON test_catalog(test_type);
CREATE INDEX idx_test_catalog_active ON test_catalog(is_active);

-- Tabla de presupuestos (budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_code VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    client_contact VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    project_description TEXT NOT NULL,
    project_location TEXT NOT NULL,
    request_date DATE NOT NULL,
    subtotal_amount DECIMAL(10,2) NOT NULL,
    iva_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_request_date ON budgets(request_date);

-- Tabla de items de presupuesto (budget_items)
CREATE TABLE IF NOT EXISTS budget_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    item_number INT NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concept_id INT NOT NULL,
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    FOREIGN KEY (concept_id) REFERENCES test_catalog(id)
);
CREATE INDEX idx_budget_items_budget_service ON budget_items(budget_id, service_type);
CREATE INDEX idx_budget_items_budget_item_number ON budget_items(budget_id, item_number);

-- Tabla de órdenes de servicio (service_orders)
CREATE TABLE IF NOT EXISTS service_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    budget_id INT NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    field_manager VARCHAR(255),
    assigned_technician VARCHAR(255),
    scheduled_date DATE,
    completed_date DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id)
);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_scheduled_date ON service_orders(scheduled_date);
CREATE INDEX idx_service_orders_budget_test ON service_orders(budget_id, test_type);

-- Tabla de muestras (samples)
CREATE TABLE IF NOT EXISTS samples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sample_code VARCHAR(50) NOT NULL UNIQUE,
    service_order_id INT NOT NULL,
    description TEXT NOT NULL,
    collection_date DATE,
    collection_location TEXT,
    collected_by VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'collected',
    test_results JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id)
);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_collection_date ON samples(collection_date);
CREATE INDEX idx_samples_service_order ON samples(service_order_id);

-- Tabla de reportes de campo (field_reports)
CREATE TABLE IF NOT EXISTS field_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_code VARCHAR(50) NOT NULL UNIQUE,
    service_order_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_date DATE NOT NULL,
    technician VARCHAR(255) NOT NULL,
    field_data JSON NOT NULL,
    validations JSON,
    signatures JSON,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id)
);
CREATE INDEX idx_field_reports_status ON field_reports(status);
CREATE INDEX idx_field_reports_report_date ON field_reports(report_date);
CREATE INDEX idx_field_reports_service_order_type ON field_reports(service_order_id, report_type);

-- Listo. Ahora puedes correr este script en tu MySQL para tener la base lista.
