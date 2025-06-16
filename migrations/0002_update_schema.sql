-- Add new columns to budgets table
ALTER TABLE budgets
ADD COLUMN contractor_name VARCHAR(255),
ADD COLUMN contractor_contact VARCHAR(255),
ADD COLUMN contractor_phone VARCHAR(20),
ADD COLUMN contractor_email VARCHAR(255),
ADD COLUMN project_name VARCHAR(255) NOT NULL,
ADD COLUMN project_description TEXT NOT NULL,
ADD COLUMN project_start_date DATE,
ADD COLUMN project_section VARCHAR(255),
ADD COLUMN project_neighborhood VARCHAR(255),
ADD COLUMN project_street VARCHAR(255),
ADD COLUMN project_responsible VARCHAR(255),
ADD COLUMN payment_method VARCHAR(50);

-- Create test concepts table
CREATE TABLE IF NOT EXISTS test_concepts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concept_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    subarea VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_concepts_service_type ON test_concepts(service_type);
CREATE INDEX idx_test_concepts_subarea ON test_concepts(subarea);
CREATE INDEX idx_test_concepts_active ON test_concepts(is_active);

-- Update budget items table
ALTER TABLE budget_items
ADD COLUMN concept_id INT NOT NULL,
ADD FOREIGN KEY (concept_id) REFERENCES test_concepts(id),
DROP COLUMN test_type,
DROP COLUMN description,
DROP COLUMN unit,
DROP COLUMN service_type;

-- Create index for budget items concept
CREATE INDEX idx_budget_items_concept ON budget_items(budget_id, concept_id);

-- Insert initial test concepts data
INSERT INTO test_concepts (concept_code, name, description, unit, base_price, service_type, subarea) VALUES
-- Control de Calidad (PCC)
('PCC-CONC-001', 'Prueba de resistencia a la compresión', 'Ensayo de resistencia a la compresión de cilindros de concreto', 'pieza', 250.00, 'PCC', 'CONCRETO'),
('PCC-CONC-002', 'Prueba de revenimiento', 'Determinación del revenimiento del concreto fresco', 'prueba', 150.00, 'PCC', 'CONCRETO'),
('PCC-ACER-001', 'Prueba de tensión en varilla', 'Ensayo de tensión en varillas de acero de refuerzo', 'pieza', 350.00, 'PCC', 'ACERO'),
('PCC-SOLD-001', 'Inspección de soldadura', 'Inspección visual y pruebas no destructivas en soldaduras', 'metro', 450.00, 'PCC', 'SOLDADURA'),

-- Mecánica de Suelos (PMS)
('PMS-CLAS-001', 'Análisis granulométrico', 'Determinación de la distribución del tamaño de partículas del suelo', 'prueba', 550.00, 'PMS', 'CLASIFICACION'),
('PMS-COMP-001', 'Prueba Proctor estándar', 'Determinación de la relación densidad-humedad', 'prueba', 650.00, 'PMS', 'COMPACTACION'),
('PMS-CBR-001', 'Prueba CBR', 'Determinación del valor de soporte California', 'prueba', 850.00, 'PMS', 'CBR'),

-- Diseño de Pavimentos (PDP)
('PDP-ASF-001', 'Contenido de asfalto', 'Determinación del contenido de asfalto en mezclas', 'prueba', 750.00, 'PDP', 'ASFALTO'),
('PDP-BASE-001', 'Análisis de bases', 'Caracterización de material para base', 'prueba', 450.00, 'PDP', 'BASES'),
('PDP-SUB-001', 'Análisis de subbases', 'Caracterización de material para subbase', 'prueba', 450.00, 'PDP', 'SUBBASES'); 