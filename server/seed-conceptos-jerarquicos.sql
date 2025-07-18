-- Insertar datos de ejemplo para conceptos jerárquicos
-- Basado en la información proporcionada por el usuario

-- Nivel 1: Categorías principales
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1', 'MECÁNICA DE SUELOS', 1, NULL, NULL, NULL, NULL),
('2', 'CONTROL DE CALIDAD', 1, NULL, NULL, NULL, NULL),
('4', 'SUPERVISIÓN', 1, NULL, NULL, NULL, NULL);

-- Nivel 2: Subcategorías de MECÁNICA DE SUELOS (id=1)
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1.1', 'TRABAJOS DE CAMPO', 2, 1, NULL, NULL, NULL),
('1.2', 'TRABAJOS DE LABORATORIO', 2, 1, NULL, NULL, NULL),
('1.3', 'TRABAJOS DE GABINETE', 2, 1, NULL, NULL, NULL);

-- Nivel 2: Subcategorías de CONTROL DE CALIDAD (id=2)
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.1', 'TERRACERÍAS', 2, 2, NULL, NULL, NULL),
('2.2', 'CONCRETO HIDRÁULICO', 2, 2, NULL, NULL, NULL),
('2.3', 'MEZCLAS ASFÁLTICAS', 2, 2, NULL, NULL, NULL),
('2.4', 'ACEROS', 2, 2, NULL, NULL, NULL),
('2.5', 'MAMPOSTERÍA', 2, 2, NULL, NULL, NULL),
('2.6', 'CONCEPTOS ESPECIALES', 2, 2, NULL, NULL, NULL);

-- Nivel 2: Subcategorías de SUPERVISIÓN (id=3)
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('4.1', 'TRABAJOS DE CAMPO', 2, 3, NULL, NULL, NULL);

-- Nivel 3: Grupos de MECÁNICA DE SUELOS
-- Para 1.1 TRABAJOS DE CAMPO (buscar id por clave)
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1.1.1', 'TRABAJOS DE CAMPO - NIVEL 3', 3, (SELECT id FROM conceptos WHERE clave = '1.1'), NULL, NULL, NULL);

-- Para 1.2 TRABAJOS DE LABORATORIO
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1.2.1', 'TRABAJOS DE LABORATORIO - NIVEL 3', 3, (SELECT id FROM conceptos WHERE clave = '1.2'), NULL, NULL, NULL);

-- Para 1.3 TRABAJOS DE GABINETE
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1.3.1', 'TRABAJOS DE GABINETE - NIVEL 3', 3, (SELECT id FROM conceptos WHERE clave = '1.3'), NULL, NULL, NULL);

-- Nivel 3: Grupos de TERRACERÍAS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.1.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.1'), NULL, NULL, NULL),
('2.1.2', 'TRABAJOS DE LABORATORIO', 3, (SELECT id FROM conceptos WHERE clave = '2.1'), NULL, NULL, NULL);

-- Nivel 3: Grupos de CONCRETO HIDRÁULICO
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.2.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.2'), NULL, NULL, NULL),
('2.2.2', 'TRABAJOS DE LABORATORIO', 3, (SELECT id FROM conceptos WHERE clave = '2.2'), NULL, NULL, NULL);

-- Nivel 3: Grupos de MEZCLAS ASFÁLTICAS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.3.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.3'), NULL, NULL, NULL),
('2.3.2', 'TRABAJOS DE LABORATORIO', 3, (SELECT id FROM conceptos WHERE clave = '2.3'), NULL, NULL, NULL);

-- Nivel 3: Grupos de ACEROS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.4.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.4'), NULL, NULL, NULL),
('2.4.2', 'TRABAJOS DE LABORATORIO', 3, (SELECT id FROM conceptos WHERE clave = '2.4'), NULL, NULL, NULL);

-- Nivel 3: Grupos de MAMPOSTERÍA
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.5.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.5'), NULL, NULL, NULL),
('2.5.2', 'TRABAJOS DE LABORATORIO', 3, (SELECT id FROM conceptos WHERE clave = '2.5'), NULL, NULL, NULL);

-- Nivel 3: Grupos de CONCEPTOS ESPECIALES
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.6.1', 'TRABAJOS DE CAMPO', 3, (SELECT id FROM conceptos WHERE clave = '2.6'), NULL, NULL, NULL);

-- Nivel 4: Conceptos específicos con precios y tipos

-- MECÁNICA DE SUELOS - Conceptos específicos
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('1.1.1.1', 'POZO A CIELO ABIERTO CON MEDIOS MECÁNICOS, PROFUNDIDAD HASTA 1.5 m. INCLUYE: traslado de personal y equipo dentro de la mancha urbana, inspección, ubicación, excavación, muestreo alterado, relleno semicompactado del pozo y reporte de campo. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '1.1.1'), 'POZO', 9.00, 1913.98),

('1.2.1.1', 'DETERMINACIÓN DE LA MASA VOLUMÉTRICA DE SUELO INALTERADO POR EL MÉTODO DE LA PARAFINA. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '1.2.1'), 'PRUEBA', 26.00, 407.15),

('1.3.1.1', 'CÁLCULO DE RELACIÓN DE VACÍOS, POROSIDAD Y GRADO DE SATURACIÓN DE AGUA EN SUELO. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '1.3.1'), 'CÁLCULO', 34.00, 204.91);

-- CONTROL DE CALIDAD - TERRACERÍAS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.1.1.1', 'VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR (CALAS) Y GRADO DE COMPACTACIÓN. INCLUYE: determinación del contenido de agua en laboratorio, análisis y reporte, con un máximo de 5 ensayes (calas) y traslados. No incluye determinación de masa volumétrica seca máxima. Horario diurno de 8:00 a 17:00 h. (Método acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.1.1'), 'VISITA', 3.00, 1231.53),

('2.1.2.1', 'DETERMINACIÓN DEL CONTENIDO DE AGUA. INCLUYE: mano de obra, insumos, equipo. (Método acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.1.2'), 'PRUEBA', 42.00, 178.97);

-- CONTROL DE CALIDAD - CONCRETO HIDRÁULICO
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.2.1.1', 'VISITA PARA MUESTREO DE CONCRETO EN OBRA con permanencia de 1.5 h máximo. INCLUYE: elaboración de 4 especímenes cilíndricos, en horario diurno de 8:00 a 17:00 h. (Método acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.2.1'), 'VISITA', 11.00, 1213.37),

('2.2.2.1', 'DETERMINACIÓN DE LA RESISTENCIA MECÁNICA A LA COMPRESIÓN SIMPLE EN ESPÉCIMEN DE MORTERO HIDRÁULICO (CUBO DE 5 cm X 5 cm X 5 cm), (Método no acreditado) INCLUYE: curado hasta la fecha de ensayo, ensayo con equipo apropiado e informe de resultados', 4, (SELECT id FROM conceptos WHERE clave = '2.2.2'), 'PRUEBA', NULL, 104.01);

-- CONTROL DE CALIDAD - MEZCLAS ASFÁLTICAS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.3.1.1', 'VISITA PARA EXTRACCIÓN DE NÚCLEOS EN CARPETA ASFÁLTICA. INCLUYE: mano de obra, equipo y herramientas, de 1 a 5 núcleos en horario diurno de 8:00 a 17:00 h. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.3.1'), 'VISITA', -8.00, 4010.07),

('2.3.2.1', 'ESTUDIO DE CALIDAD DE MUESTRA DE CONCRETO ASFÁLTICO DETERMINANDO: CONTENIDO DE ASFALTO, ESTABILIDAD, FLUJO, CÁLCULO DE RELACIONES VOLUMÉTRICAS, ANÁLISIS GRANULOMÉTRICO. INCLUYE: Mano de obra, equipo y herramientas. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.3.2'), 'ESTUDIO', 22.00, 3462.06);

-- CONTROL DE CALIDAD - ACEROS
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.4.1.1', 'VISITA DE INSPECCIÓN DE SOLDADURA CON LÍQUIDOS PENETRANTES, horario de lunes a viernes de 8:00 a 17:00 h, sábado 8:00 a 13:00 h. INCLUYE: traslados hasta una distancia de 10 km o 0.50 hora, permanencia en obra o taller hasta 3 h. y regreso (incluidos hasta 20 spots de 1 a 20 cm de longitud), reporte. No incluye maniobras especiales y/o andamios. (Método no acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.4.1'), 'VISITA', 19.00, 4382.16),

('2.4.2.1', 'ENSAYE FÍSICO DE VARILLAS DE ACERO A TENSIÓN. INCLUYE: límite elástico, resistencia máxima, alargamiento, doblado y característica de corrugaciones de 6.4 a 15.9 mm (1/4" a 5/8") (Método acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.4.2'), 'PROBETA', 10.00, 631.75);

-- CONTROL DE CALIDAD - MAMPOSTERÍA
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.5.1.1', 'VISITA PARA MUESTREO de tabique rojo, blocks y/o tabicón, máximo 11 pzas. por muestreo, horario diurno de 8:00 a 17:00 h. INCLUYE: 1 a 3 muestreos, traslado de 30 minutos o 10 km como máximo', 4, (SELECT id FROM conceptos WHERE clave = '2.5.1'), 'VISITA', -12.00, 947.12),

('2.5.2.1', 'DETERMINACIÓN DE LA RESISTENCIA MECÁNICA A LA COMPRESIÓN SIMPLE (5 PZAS), % DE ABSORCIÓN (6 PZAS) DE TABIQUES, TABICONES, BLOQUES, ADOCRETOS CONFORME A NMX-C-441-ONNCCE- (Método acreditado) INCLUYE: dimensionamiento, ensaye a la compresión, % absorción inicial y total e informe de resultados (muestra de 11 especímenes)', 4, (SELECT id FROM conceptos WHERE clave = '2.5.2'), 'MUESTRA', 36.00, 1339.14),

('2.5.2.3', 'DETERMINACIÓN DE DIMENSIONAMIENTO (NMX-C-038-ONNCCE) Y % DE ABSORCIÓN (NMX-C-037-ONNCCE) INCLUYE: mano de obra, equipos y herramienta (muestra de 6 piezas) (Método acreditado)', 4, (SELECT id FROM conceptos WHERE clave = '2.5.2'), 'MUESTRA', NULL, 620.85);

-- CONTROL DE CALIDAD - CONCEPTOS ESPECIALES
INSERT INTO `conceptos` (`clave`, `nombre`, `nivel`, `padre_id`, `tipo`, `porcentaje`, `precio`) VALUES
('2.6.1.1', 'VISITA EN FALSO, para muestreo en obra considerando traslados y permanencia de 1.5 h máximo en horario diurno de 8:00 a 17:00 h.', 4, (SELECT id FROM conceptos WHERE clave = '2.6.1'), 'VISITA', 29.00, 640.63);
