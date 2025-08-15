/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[email]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fecha_actualizacion` to the `Obra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Obra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Presupuesto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `obra` ADD COLUMN `actualizado_por` VARCHAR(255) NULL,
    ADD COLUMN `alcance` TEXT NULL,
    ADD COLUMN `cliente_id` INTEGER NULL,
    ADD COLUMN `contacto` VARCHAR(255) NULL,
    ADD COLUMN `creado_por` VARCHAR(255) NULL,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `direccion` VARCHAR(500) NULL,
    ADD COLUMN `fecha_actualizacion` DATETIME(3) NOT NULL,
    ADD COLUMN `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fecha_fin` TIMESTAMP(0) NULL,
    ADD COLUMN `fecha_fin_prevista` TIMESTAMP(0) NULL,
    ADD COLUMN `nombre` VARCHAR(255) NOT NULL,
    ADD COLUMN `notas` TEXT NULL,
    ADD COLUMN `objetivos` TEXT NULL,
    ADD COLUMN `presupuesto_estimado` DECIMAL(12, 2) NULL,
    ADD COLUMN `presupuesto_total` DECIMAL(12, 2) NULL,
    ADD COLUMN `razon_cancelacion` TEXT NULL,
    ADD COLUMN `responsable` VARCHAR(255) NULL,
    MODIFY `contratista` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `presupuesto` ADD COLUMN `ultimo_usuario_id` INTEGER NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `usuarioId` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `email` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_obra_cliente_id` ON `Obra`(`cliente_id`);

-- CreateIndex
CREATE INDEX `idx_presupuestos_usuario_id` ON `Presupuesto`(`usuarioId`);

-- CreateIndex
CREATE INDEX `idx_presupuestos_ultimo_usuario_id` ON `Presupuesto`(`ultimo_usuario_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_email_key` ON `Usuario`(`email`);

-- CreateIndex
CREATE INDEX `idx_usuario_email` ON `Usuario`(`email`);

-- AddForeignKey
ALTER TABLE `Obra` ADD CONSTRAINT `Obra_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_ultimo_usuario_id_fkey` FOREIGN KEY (`ultimo_usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
