/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `brigadista_id` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `usuario` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the `concepto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subarea` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `apellidos` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol_id` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `concepto` DROP FOREIGN KEY `Concepto_subareaId_fkey`;

-- DropForeignKey
ALTER TABLE `presupuestodetalle` DROP FOREIGN KEY `PresupuestoDetalle_conceptoCodigo_fkey`;

-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_concepto_codigo_fkey`;

-- DropForeignKey
ALTER TABLE `subarea` DROP FOREIGN KEY `Subarea_areaCodigo_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_brigadista_id_fkey`;

-- DropIndex
DROP INDEX `Programacion_concepto_codigo_fkey` ON `programacion`;

-- DropIndex
DROP INDEX `Usuario_brigadista_id_fkey` ON `usuario`;

-- DropIndex
DROP INDEX `Usuario_email_key` ON `usuario`;

-- DropIndex
DROP INDEX `idx_usuario_email` ON `usuario`;

-- DropIndex
DROP INDEX `idx_usuario_rol` ON `usuario`;

-- AlterTable
ALTER TABLE `brigadista` ADD COLUMN `disponible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `tipo_servicio` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `brigadista_id`,
    DROP COLUMN `email`,
    DROP COLUMN `rol`,
    ADD COLUMN `apellidos` VARCHAR(100) NOT NULL,
    ADD COLUMN `rol_id` INTEGER NOT NULL,
    ADD COLUMN `ultimo_acceso` DATETIME(3) NULL,
    MODIFY `nombre` VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE `concepto`;

-- DropTable
DROP TABLE `subarea`;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `Role_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `areas_jerarquicas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `nombre` TEXT NOT NULL,
    `padre_id` INTEGER NULL,
    `nivel` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `areas_jerarquicas_codigo_key`(`codigo`),
    INDEX `idx_areas_nivel`(`nivel`),
    INDEX `idx_areas_padre_id`(`padre_id`),
    INDEX `idx_areas_codigo`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conceptos_jerarquicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `unidad` VARCHAR(50) NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `area_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conceptos_jerarquicos_codigo_key`(`codigo`),
    INDEX `idx_conceptos_area_id`(`area_id`),
    INDEX `idx_conceptos_codigo`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_usuario_rol` ON `Usuario`(`rol_id`);

-- AddForeignKey
ALTER TABLE `PresupuestoDetalle` ADD CONSTRAINT `PresupuestoDetalle_conceptoCodigo_fkey` FOREIGN KEY (`conceptoCodigo`) REFERENCES `conceptos_jerarquicos`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_concepto_codigo_fkey` FOREIGN KEY (`concepto_codigo`) REFERENCES `conceptos_jerarquicos`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `areas_jerarquicas` ADD CONSTRAINT `areas_jerarquicas_padre_id_fkey` FOREIGN KEY (`padre_id`) REFERENCES `areas_jerarquicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conceptos_jerarquicos` ADD CONSTRAINT `conceptos_jerarquicos_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas_jerarquicas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
