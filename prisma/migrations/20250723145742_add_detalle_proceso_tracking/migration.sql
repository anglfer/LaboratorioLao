/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `estado` on the `presupuestodetalle` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuestodetalle` ADD COLUMN `fecha_completado` DATETIME(3) NULL,
    ADD COLUMN `fecha_inicio` DATETIME(3) NULL,
    ADD COLUMN `fecha_retirado` DATETIME(3) NULL,
    ADD COLUMN `motivo_retiro` TEXT NULL,
    ADD COLUMN `observaciones` TEXT NULL,
    MODIFY `estado` ENUM('pendiente', 'en_proceso', 'completado', 'retirado', 'cancelado') NULL DEFAULT 'pendiente';

-- CreateIndex
CREATE INDEX `idx_presupuestodetalle_estado` ON `PresupuestoDetalle`(`estado`);
