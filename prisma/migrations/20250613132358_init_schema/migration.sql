-- CreateTable
CREATE TABLE `Area` (
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(255) NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subarea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NULL,
    `areaCodigo` VARCHAR(50) NULL,

    INDEX `idx_subareas_area_codigo`(`areaCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Concepto` (
    `codigo` VARCHAR(50) NOT NULL,
    `subareaId` INTEGER NULL,
    `descripcion` VARCHAR(1000) NULL,
    `unidad` VARCHAR(50) NULL,
    `p_u` DECIMAL(10, 2) NULL,

    INDEX `idx_conceptos_subarea_id`(`subareaId`),
    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NULL,
    `direccion` VARCHAR(255) NULL,
    `fecha_registro` DATETIME NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Telefono` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `telefono` VARCHAR(255) NOT NULL,

    INDEX `idx_telefonos_cliente_id`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Correo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `correo` VARCHAR(255) NOT NULL,

    INDEX `idx_correos_cliente_id`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Obra` (
    `clave` VARCHAR(20) NOT NULL,
    `areaCodigo` VARCHAR(50) NOT NULL,
    `contratista` VARCHAR(50) NULL,
    `estado` TINYINT NULL,

    INDEX `idx_obra_area_codigo`(`areaCodigo`),
    PRIMARY KEY (`clave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContadorObras` (
    `areaCodigo` VARCHAR(50) NOT NULL,
    `año` INTEGER NOT NULL,
    `contador` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`areaCodigo`, `año`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave_obra` VARCHAR(20) NULL,
    `clienteId` INTEGER NULL,
    `nombre_contratista` VARCHAR(255) NULL,
    `descripcion_obra` TEXT NULL,
    `tramo` VARCHAR(255) NULL,
    `colonia` VARCHAR(255) NULL,
    `calle` VARCHAR(255) NULL,
    `contacto_responsable` VARCHAR(255) NULL,
    `iva` DECIMAL(5, 4) NULL DEFAULT 0.1600,
    `subtotal` DECIMAL(12, 2) NULL DEFAULT 0,
    `iva_monto` DECIMAL(12, 2) NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NULL DEFAULT 0,
    `forma_pago` VARCHAR(100) NULL,
    `estado` ENUM('borrador', 'enviado', 'aprobado', 'rechazado', 'finalizado') NULL DEFAULT 'borrador',
    `fecha_solicitud` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_inicio` TIMESTAMP(0) NULL,

    INDEX `idx_presupuestos_clave_obra`(`clave_obra`),
    INDEX `idx_presupuestos_cliente_id`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PresupuestoDetalle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `presupuestoId` INTEGER NOT NULL,
    `conceptoCodigo` VARCHAR(50) NOT NULL,
    `cantidad` DECIMAL(10, 2) NOT NULL DEFAULT 1,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NULL,
    `estado` ENUM('en_proceso', 'hecho') NULL DEFAULT 'en_proceso',

    INDEX `idx_presupuestodetalle_presupuesto_id`(`presupuestoId`),
    INDEX `idx_presupuestodetalle_concepto_codigo`(`conceptoCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subarea` ADD CONSTRAINT `Subarea_areaCodigo_fkey` FOREIGN KEY (`areaCodigo`) REFERENCES `Area`(`codigo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Concepto` ADD CONSTRAINT `Concepto_subareaId_fkey` FOREIGN KEY (`subareaId`) REFERENCES `Subarea`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Telefono` ADD CONSTRAINT `Telefono_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correo` ADD CONSTRAINT `Correo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Obra` ADD CONSTRAINT `Obra_areaCodigo_fkey` FOREIGN KEY (`areaCodigo`) REFERENCES `Area`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContadorObras` ADD CONSTRAINT `ContadorObras_areaCodigo_fkey` FOREIGN KEY (`areaCodigo`) REFERENCES `Area`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_clave_obra_fkey` FOREIGN KEY (`clave_obra`) REFERENCES `Obra`(`clave`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresupuestoDetalle` ADD CONSTRAINT `PresupuestoDetalle_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresupuestoDetalle` ADD CONSTRAINT `PresupuestoDetalle_conceptoCodigo_fkey` FOREIGN KEY (`conceptoCodigo`) REFERENCES `Concepto`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
