/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `calle` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `colonia` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `forma_pago` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `tramo` on the `presupuesto` table. All the data in the column will be lost.

*/

-- Primero agregar nuevas columnas
ALTER TABLE `obra` ADD COLUMN `fecha_inicio` TIMESTAMP(0) NULL;

ALTER TABLE `presupuesto` 
ADD COLUMN `alcance` TEXT NULL,
ADD COLUMN `direccion` VARCHAR(500) NULL,
ADD COLUMN `maneja_anticipo` BOOLEAN NULL DEFAULT false,
ADD COLUMN `politicas_pago` TEXT NULL,
ADD COLUMN `porcentaje_anticipo` DECIMAL(5, 2) NULL;

-- Migrar datos existentes - combinar tramo, colonia y calle en direccion
UPDATE `presupuesto` 
SET `direccion` = CONCAT_WS(', ', 
    NULLIF(TRIM(tramo), ''), 
    NULLIF(TRIM(colonia), ''), 
    NULLIF(TRIM(calle), '')
) 
WHERE (tramo IS NOT NULL AND tramo != '') 
   OR (colonia IS NOT NULL AND colonia != '') 
   OR (calle IS NOT NULL AND calle != '');

-- Migrar forma_pago a politicas_pago
UPDATE `presupuesto` 
SET `politicas_pago` = forma_pago 
WHERE forma_pago IS NOT NULL AND forma_pago != '';

-- Migrar fecha_inicio de presupuesto a obra cuando la obra exista
UPDATE `obra` o 
INNER JOIN `presupuesto` p ON o.clave = p.clave_obra 
SET o.fecha_inicio = p.fecha_inicio 
WHERE p.fecha_inicio IS NOT NULL;

-- Ahora eliminar las columnas antiguas
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuesto` 
DROP COLUMN `calle`,
DROP COLUMN `colonia`,
DROP COLUMN `fecha_inicio`,
DROP COLUMN `forma_pago`,
DROP COLUMN `tramo`;
