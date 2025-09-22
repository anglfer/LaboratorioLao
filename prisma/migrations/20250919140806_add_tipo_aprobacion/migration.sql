/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuesto` ADD COLUMN `tipo_aprobacion` ENUM('cliente', 'interno') NULL;
