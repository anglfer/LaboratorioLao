/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- CreateTable
CREATE TABLE `brigadistas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_brigadista_activo`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(20) NOT NULL,
    `marca` VARCHAR(50) NULL,
    `modelo` VARCHAR(50) NULL,
    `año` INTEGER NULL,
    `placas` VARCHAR(15) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehiculos_clave_key`(`clave`),
    INDEX `idx_vehiculo_activo`(`activo`),
    INDEX `idx_vehiculo_clave`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `presupuesto_id` INTEGER NOT NULL,
    `clave_obra` VARCHAR(20) NOT NULL,
    `fecha_programada` DATETIME(3) NOT NULL,
    `hora_programada` VARCHAR(10) NOT NULL,
    `tipo_programacion` ENUM('obra_por_visita', 'obra_por_estancia') NOT NULL,
    `nombre_residente` VARCHAR(255) NULL,
    `telefono_residente` VARCHAR(20) NULL,
    `observaciones_iniciales` TEXT NULL,
    `brigadista_principal_id` INTEGER NOT NULL,
    `brigadista_apoyo_id` INTEGER NULL,
    `vehiculo_id` INTEGER NOT NULL,
    `clave_equipo` VARCHAR(50) NULL,
    `herramientas_especiales` TEXT NULL,
    `observaciones_programacion` TEXT NULL,
    `instrucciones_brigadista` TEXT NULL,
    `condiciones_especiales` TEXT NULL,
    `estado` ENUM('programada', 'en_proceso', 'completada', 'cancelada', 'reprogramada') NOT NULL DEFAULT 'programada',
    `motivo_cancelacion` TEXT NULL,
    `observaciones_complecion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_complecion` DATETIME(3) NULL,
    `creado_por` INTEGER NULL,
    `actualizado_por` INTEGER NULL,

    INDEX `idx_programacion_presupuesto_id`(`presupuesto_id`),
    INDEX `idx_programacion_clave_obra`(`clave_obra`),
    INDEX `idx_programacion_estado`(`estado`),
    INDEX `idx_programacion_fecha_programada`(`fecha_programada`),
    INDEX `idx_programacion_brigadista_principal`(`brigadista_principal_id`),
    INDEX `idx_programacion_vehiculo`(`vehiculo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programacion_detalles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programacion_id` INTEGER NOT NULL,
    `concepto_codigo` VARCHAR(50) NOT NULL,
    `cantidad_muestras` INTEGER NOT NULL,
    `tipo_recoleccion` ENUM('metros_cuadrados', 'metros_cubicos', 'metros_lineales', 'sondeo', 'piezas', 'condensacion') NOT NULL,
    `distribucion_muestras` TEXT NULL,
    `muestras_obtenidas` INTEGER NULL,
    `observaciones` TEXT NULL,
    `es_no_presupuestado` BOOLEAN NOT NULL DEFAULT false,
    `descripcion_concepto` TEXT NULL,
    `unidad_medida` VARCHAR(50) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_programacion_detalle_programacion_id`(`programacion_id`),
    INDEX `idx_programacion_detalle_concepto_codigo`(`concepto_codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_presupuesto_id_fkey` FOREIGN KEY (`presupuesto_id`) REFERENCES `Presupuesto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_clave_obra_fkey` FOREIGN KEY (`clave_obra`) REFERENCES `Obra`(`clave`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_brigadista_principal_id_fkey` FOREIGN KEY (`brigadista_principal_id`) REFERENCES `brigadistas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_brigadista_apoyo_id_fkey` FOREIGN KEY (`brigadista_apoyo_id`) REFERENCES `brigadistas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_vehiculo_id_fkey` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_creado_por_fkey` FOREIGN KEY (`creado_por`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programaciones` ADD CONSTRAINT `programaciones_actualizado_por_fkey` FOREIGN KEY (`actualizado_por`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programacion_detalles` ADD CONSTRAINT `programacion_detalles_programacion_id_fkey` FOREIGN KEY (`programacion_id`) REFERENCES `programaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programacion_detalles` ADD CONSTRAINT `programacion_detalles_concepto_codigo_fkey` FOREIGN KEY (`concepto_codigo`) REFERENCES `conceptos_jerarquicos`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
