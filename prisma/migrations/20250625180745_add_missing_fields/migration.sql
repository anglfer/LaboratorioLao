/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuesto` ADD COLUMN `razon_rechazo` TEXT NULL;

-- CreateTable
CREATE TABLE `Brigadista` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Vehiculo_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Programacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave_obra` VARCHAR(20) NOT NULL,
    `fecha_programada` DATE NOT NULL,
    `hora_programada` VARCHAR(10) NOT NULL,
    `tipo_programacion` ENUM('obra_por_visita', 'obra_por_estancia') NOT NULL,
    `nombre_residente` VARCHAR(255) NULL,
    `telefono_residente` VARCHAR(255) NULL,
    `concepto_codigo` VARCHAR(50) NOT NULL,
    `cantidad_muestras` INTEGER NOT NULL,
    `tipo_recoleccion` ENUM('metros_cuadrados', 'metros_cubicos', 'metros_lineales', 'sondeo', 'piezas', 'condensacion') NOT NULL,
    `brigadista_id` INTEGER NOT NULL,
    `brigadista_apoyo_id` INTEGER NULL,
    `vehiculo_id` INTEGER NOT NULL,
    `clave_equipo` VARCHAR(50) NULL,
    `observaciones` TEXT NULL,
    `instrucciones` TEXT NULL,
    `condiciones_especiales` TEXT NULL,
    `estado` ENUM('programada', 'en_proceso', 'completada', 'cancelada', 'reprogramada') NOT NULL DEFAULT 'programada',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `motivo_cancelacion` TEXT NULL,
    `muestras_obtenidas` INTEGER NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_completado` DATETIME(3) NULL,

    INDEX `idx_programacion_clave_obra`(`clave_obra`),
    INDEX `idx_programacion_fecha`(`fecha_programada`),
    INDEX `idx_programacion_brigadista`(`brigadista_id`),
    INDEX `idx_programacion_estado`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_clave_obra_fkey` FOREIGN KEY (`clave_obra`) REFERENCES `Obra`(`clave`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_concepto_codigo_fkey` FOREIGN KEY (`concepto_codigo`) REFERENCES `Concepto`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_brigadista_id_fkey` FOREIGN KEY (`brigadista_id`) REFERENCES `Brigadista`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_brigadista_apoyo_id_fkey` FOREIGN KEY (`brigadista_apoyo_id`) REFERENCES `Brigadista`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Programacion` ADD CONSTRAINT `Programacion_vehiculo_id_fkey` FOREIGN KEY (`vehiculo_id`) REFERENCES `Vehiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
