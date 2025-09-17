/*
  Warnings:

  - You are about to alter the column `fecha_registro` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `fecha_fin` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_fin_prevista` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `objetivos` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `presupuesto_estimado` on the `obra` table. All the data in the column will be lost.
  - You are about to drop the column `presupuesto_total` on the `obra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `fecha_registro` DATETIME NULL;

-- AlterTable
ALTER TABLE `obra` DROP COLUMN `fecha_fin`,
    DROP COLUMN `fecha_fin_prevista`,
    DROP COLUMN `notas`,
    DROP COLUMN `objetivos`,
    DROP COLUMN `presupuesto_estimado`,
    DROP COLUMN `presupuesto_total`;
