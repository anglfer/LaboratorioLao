/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `brigadista` ADD COLUMN `disponible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `tipo_servicio` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;
