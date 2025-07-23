/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `fecha_completado` on the `presupuestodetalle` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `presupuestodetalle` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_retirado` on the `presupuestodetalle` table. All the data in the column will be lost.
  - You are about to drop the column `motivo_retiro` on the `presupuestodetalle` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `presupuestodetalle` table. All the data in the column will be lost.
  - You are about to alter the column `estado` on the `presupuestodetalle` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.
  - You are about to drop the `brigadista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehiculo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_brigadista_apoyo_id_fkey`;

-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_brigadista_id_fkey`;

-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_clave_obra_fkey`;

-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_concepto_codigo_fkey`;

-- DropForeignKey
ALTER TABLE `programacion` DROP FOREIGN KEY `Programacion_vehiculo_id_fkey`;

-- DropIndex
DROP INDEX `idx_presupuestodetalle_estado` ON `presupuestodetalle`;

-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `presupuestodetalle` DROP COLUMN `fecha_completado`,
    DROP COLUMN `fecha_inicio`,
    DROP COLUMN `fecha_retirado`,
    DROP COLUMN `motivo_retiro`,
    DROP COLUMN `observaciones`,
    MODIFY `estado` ENUM('en_proceso', 'completado', 'cancelado') NULL DEFAULT 'en_proceso';

-- DropTable
DROP TABLE `brigadista`;

-- DropTable
DROP TABLE `programacion`;

-- DropTable
DROP TABLE `vehiculo`;
