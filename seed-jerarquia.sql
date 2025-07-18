-- Insertar datos de ejemplo en las nuevas tablas jerárquicas

-- Limpiar datos existentes
DELETE FROM ConceptosJerarquicos;
DELETE FROM AreasJerarquicas;

-- Insertar áreas principales (nivel 1)
INSERT INTO AreasJerarquicas (id, codigo, nombre, nivel, createdAt, updatedAt) VALUES
('area1', '01', 'TRABAJOS PRELIMINARES', 1, NOW(), NOW()),
('area2', '02', 'ALBAÑILERÍA', 1, NOW(), NOW()),
('area3', '03', 'ESTRUCTURAS DE CONCRETO', 1, NOW(), NOW());

-- Insertar sub-áreas (nivel 2)
INSERT INTO AreasJerarquicas (id, codigo, nombre, padreId, nivel, createdAt, updatedAt) VALUES
('area4', '01.01', 'LIMPIEZA Y DESMONTE', 'area1', 2, NOW(), NOW()),
('area5', '01.02', 'EXCAVACIÓN Y MOVIMIENTO DE TIERRAS', 'area1', 2, NOW(), NOW()),
('area6', '02.01', 'MUROS DE PANEL DE YESO', 'area2', 2, NOW(), NOW()),
('area7', '02.02', 'MUROS DE LADRILLO', 'area2', 2, NOW(), NOW()),
('area8', '03.01', 'CIMENTACIÓN', 'area3', 2, NOW(), NOW()),
('area9', '03.02', 'COLUMNAS', 'area3', 2, NOW(), NOW());

-- Insertar conceptos (hojas del árbol)
INSERT INTO ConceptosJerarquicos (id, codigo, descripcion, unidad, precioUnitario, areaId, createdAt, updatedAt) VALUES
-- Conceptos de Limpieza
('concepto1', '01.01.001', 'Desmonte y limpieza manual del terreno', 'M²', 15.50, 'area4', NOW(), NOW()),
('concepto2', '01.01.002', 'Retiro de escombros y maleza', 'M³', 45.00, 'area4', NOW(), NOW()),

-- Conceptos de Excavación
('concepto3', '01.02.001', 'Excavación manual en terreno normal', 'M³', 65.00, 'area5', NOW(), NOW()),
('concepto4', '01.02.002', 'Relleno y compactación con material propio', 'M³', 35.00, 'area5', NOW(), NOW()),

-- Conceptos de Muros Panel Yeso
('concepto5', '02.01.001', 'Muro divisorio de panel de yeso 12.7mm estructura metálica', 'M²', 320.00, 'area6', NOW(), NOW()),
('concepto6', '02.01.002', 'Pasta y lija en uniones de panel de yeso', 'ML', 25.00, 'area6', NOW(), NOW()),

-- Conceptos de Muros Ladrillo
('concepto7', '02.02.001', 'Muro de ladrillo rojo recocido 14x28x7 cm junteado con mortero', 'M²', 280.00, 'area7', NOW(), NOW()),
('concepto8', '02.02.002', 'Repellado de muros con mortero cemento-arena 1:4', 'M²', 85.00, 'area7', NOW(), NOW()),

-- Conceptos de Cimentación
('concepto9', '03.01.001', 'Excavación para zapata corrida', 'M³', 75.00, 'area8', NOW(), NOW()),
('concepto10', '03.01.002', 'Concreto ciclópeo f\'c=150 kg/cm² para cimentación', 'M³', 1250.00, 'area8', NOW(), NOW()),

-- Conceptos de Columnas
('concepto11', '03.02.001', 'Columna de concreto armado 20x20 cm f\'c=210 kg/cm²', 'ML', 450.00, 'area9', NOW(), NOW()),
('concepto12', '03.02.002', 'Acero de refuerzo fy=4200 kg/cm² para columnas', 'KG', 28.00, 'area9', NOW(), NOW());

-- Verificar los datos insertados
SELECT 'Áreas creadas:' as Resultado, COUNT(*) as Total FROM AreasJerarquicas
UNION ALL
SELECT 'Conceptos creados:', COUNT(*) FROM ConceptosJerarquicos;
