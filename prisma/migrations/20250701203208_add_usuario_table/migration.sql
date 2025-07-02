/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `rol` ENUM('admin', 'recepcionista', 'jefe_laboratorio', 'brigadista', 'laboratorista') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `brigadista_id` INTEGER NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `idx_usuario_email`(`email`),
    INDEX `idx_usuario_rol`(`rol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_brigadista_id_fkey` FOREIGN KEY (`brigadista_id`) REFERENCES `Brigadista`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
