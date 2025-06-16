-- Insertar datos de ejemplo para el sistema LOA
USE laboratorio_lao;

-- Limpiar datos existentes (opcional)
DELETE FROM presupuesto_detalle;
DELETE FROM presupuesto;
DELETE FROM obra;
DELETE FROM concepto;
DELETE FROM subarea;
DELETE FROM area;
DELETE FROM correo;
DELETE FROM telefono;
DELETE FROM cliente;
DELETE FROM contador_obras;

-- Insertar áreas
INSERT INTO area (codigo, nombre) VALUES 
('PCC', 'Control de Calidad'),
('PMS', 'Mecanica de Suelos'), 
('PDP', 'Diseño de Pavimento'),
('PVCC', 'Control de Calidad');

-- Insertar subáreas
INSERT INTO subarea (nombre, area_codigo) VALUES
('Concretos', 'PCC'),
('Suelos', 'PMS'),
('Pavimento', 'PDP'),
('Acero', 'PCC'),
('Compactacion', 'PMS');

-- Insertar conceptos
INSERT INTO concepto (codigo, subarea_id, descripcion, unidad, p_u) VALUES
('CC.002.1', 1, 'Visita para muestreo de concreto en obra incluye elaboracion de especimenes para resistencia a la compresion', 'VISITA', 1213.37),
('CC.002.2', 1, 'Visita para muestreo de concreto en obra con vigas incluye elaboracion de especimenes', 'VISITA', 1307.50),
('CC.002.3', 1, 'Visita para muestreo de mortero hidraulico incluye elaboracion de especimenes', 'VISITA', 941.65),
('CC.002.4', 1, 'Visita para extraccion de especimenes cilindricos de concreto endurecido', 'VISITA', 3768.15),
('MS.001.1', 2, 'Muestreo de suelos en campo para clasificacion', 'MUESTRA', 850.00),
('MS.001.2', 2, 'Ensayo de compactacion Proctor estandar', 'ENSAYO', 1200.00),
('PV.001.1', 3, 'Diseño de mezcla asfaltica en caliente', 'DISEÑO', 2500.00),
('AC.001.1', 4, 'Ensayo de tension en barras de acero', 'ENSAYO', 950.00);

-- Insertar clientes
INSERT INTO cliente (nombre, direccion, fecha_registro, activo) VALUES
('Mineranorte S.A. de C.V.', 'Av. Principal 123, Colonia Centro', NOW(), TRUE),
('Constructora XYZ', 'Calle Secundaria 456, Colonia Industrial', NOW(), TRUE),
('Obras y Proyectos ABC', 'Boulevard Norte 789, Colonia Moderna', NOW(), TRUE);

-- Insertar teléfonos
INSERT INTO telefono (cliente_id, telefono) VALUES
(1, '555-1234'),
(1, '555-5678'), 
(2, '555-9012'),
(2, '555-3456'),
(3, '555-7890');

-- Insertar correos
INSERT INTO correo (cliente_id, correo) VALUES
(1, 'contacto@mineranorte.com'),
(1, 'laboratorio@mineranorte.com'),
(2, 'info@constructoraxyz.com'),
(2, 'proyectos@constructoraxyz.com'),
(3, 'admin@obrasyproyectosabc.com');

-- Insertar obras
INSERT INTO obra (area_codigo, contratista, estado) VALUES
('PCC', 'JUAN ORTIZ CONSTRUCCIONES', 1),
('PCC', 'MARIA GUERRA INGENIEROS', 0),
('PMS', 'JUAN MANUEL ESTUDIOS', 1),
('PDP', 'JOSE GUTIERREZ PAVIMENTOS', 0);

-- Obtener claves de obra generadas automáticamente
SET @obra1 = (SELECT clave FROM obra WHERE contratista = 'JUAN ORTIZ CONSTRUCCIONES' LIMIT 1);
SET @obra2 = (SELECT clave FROM obra WHERE contratista = 'MARIA GUERRA INGENIEROS' LIMIT 1);
SET @obra3 = (SELECT clave FROM obra WHERE contratista = 'JUAN MANUEL ESTUDIOS' LIMIT 1);
SET @obra4 = (SELECT clave FROM obra WHERE contratista = 'JOSE GUTIERREZ PAVIMENTOS' LIMIT 1);

-- Insertar presupuestos
INSERT INTO presupuesto (clave_obra, cliente_id, estado, fecha_solicitud, fecha_inicio) VALUES
(@obra1, 1, 'borrador', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
(@obra2, 2, 'enviado', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY)),
(@obra3, 1, 'aprobado', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY)),
(@obra4, 3, 'borrador', NOW(), DATE_ADD(NOW(), INTERVAL 21 DAY));

-- Insertar detalles de presupuesto
INSERT INTO presupuesto_detalle (presupuesto_id, concepto_codigo, precio_unitario, estado) VALUES
(1, 'CC.002.1', 1213.37, 'en_proceso'),
(1, 'CC.002.2', 1307.50, 'en_proceso'),
(1, 'CC.002.3', 941.65, 'en_proceso'),
(2, 'CC.002.1', 1213.37, 'en_proceso'),
(2, 'CC.002.4', 3768.15, 'hecho'),
(3, 'MS.001.1', 850.00, 'hecho'),
(3, 'MS.001.2', 1200.00, 'hecho'),
(4, 'PV.001.1', 2500.00, 'en_proceso'),
(4, 'AC.001.1', 950.00, 'en_proceso');

-- Verificar los datos insertados
SELECT 'Áreas insertadas:' as Info;
SELECT * FROM area;

SELECT 'Subáreas insertadas:' as Info;
SELECT s.*, a.nombre as area_nombre FROM subarea s LEFT JOIN area a ON s.area_codigo = a.codigo;

SELECT 'Conceptos insertados:' as Info;
SELECT c.*, s.nombre as subarea_nombre FROM concepto c LEFT JOIN subarea s ON c.subarea_id = s.id LIMIT 10;

SELECT 'Clientes insertados:' as Info;
SELECT * FROM cliente;

SELECT 'Obras insertadas:' as Info;
SELECT o.*, a.nombre as area_nombre FROM obra o LEFT JOIN area a ON o.area_codigo = a.codigo;

SELECT 'Presupuestos insertados:' as Info;
SELECT p.*, c.nombre as cliente_nombre, o.contratista FROM presupuesto p 
LEFT JOIN cliente c ON p.cliente_id = c.id 
LEFT JOIN obra o ON p.clave_obra = o.clave;
