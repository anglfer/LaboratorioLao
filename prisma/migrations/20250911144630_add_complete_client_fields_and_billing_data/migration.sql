/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `contactoPagos` VARCHAR(255) NULL,
    ADD COLUMN `correoFacturacion` VARCHAR(255) NULL,
    ADD COLUMN `metodoPago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE') NULL DEFAULT 'EFECTIVO',
    ADD COLUMN `representanteLegal` VARCHAR(255) NULL,
    ADD COLUMN `telefonoPagos` VARCHAR(20) NULL,
    MODIFY `direccion` VARCHAR(500) NULL,
    MODIFY `fecha_registro` DATETIME NULL;

-- CreateTable
CREATE TABLE `DatosFacturacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `rfc` VARCHAR(13) NOT NULL,
    `regimenFiscal` ENUM('PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES', 'PERSONAS_MORALES', 'REGIMEN_SIMPLIFICADO_DE_CONFIANZA', 'PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES', 'REGIMEN_DE_INCORPORACION_FISCAL', 'OTROS') NOT NULL,
    `usoCfdi` ENUM('GASTOS_EN_GENERAL', 'EQUIPOS_DE_COMPUTO', 'HONORARIOS_MEDICOS', 'GASTOS_MEDICOS', 'INTERESES_REALES', 'DONACIONES', 'OTROS') NOT NULL,
    `tipoPago` ENUM('PUE', 'PPD') NOT NULL DEFAULT 'PUE',

    UNIQUE INDEX `DatosFacturacion_clienteId_key`(`clienteId`),
    INDEX `idx_datos_facturacion_cliente_id`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DatosFacturacion` ADD CONSTRAINT `DatosFacturacion_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
