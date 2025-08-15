/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `alcance` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `contacto_responsable` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion_obra` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_contratista` on the `presupuesto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuesto` DROP COLUMN `alcance`,
    DROP COLUMN `contacto_responsable`,
    DROP COLUMN `descripcion_obra`,
    DROP COLUMN `direccion`,
    DROP COLUMN `nombre_contratista`;
