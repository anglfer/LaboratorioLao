import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";


import { 
  insertClienteSchema,
  insertTelefonoSchema,
  insertCorreoSchema,
  insertAreaSchema,
  insertSubareaSchema,
  insertConceptoSchema,
  insertObraSchema,
  insertPresupuestoSchema,
  insertPresupuestoDetalleSchema,
  SYSTEM_CONSTANTS,
} from "@shared/schema";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generatePresupuestoHTML(presupuesto: any, detalles: any[], forPDF = false) {
  const subtotal = presupuesto.subtotal || 0;
  const iva = presupuesto.ivaMonto || 0;
  const total = presupuesto.total || 0;
  const fechaGeneracion = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
    // Generar número de folio único basado en ID y fecha
  
  // Obtener el estado del presupuesto con color apropiado
  const estadoColors = {
    'borrador': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    'enviado': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    'aprobado': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    'rechazado': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
    'finalizado': { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' }
  };
  const estadoInfo = estadoColors[presupuesto.estado as keyof typeof estadoColors] || estadoColors.borrador;

  // Agrupar detalles por subárea/área para el resumen ejecutivo
  const detallesPorArea = detalles.reduce((acc: any, detalle: any) => {
    const area = detalle.concepto?.subarea?.area?.nombre || 'Sin Área';
    const subarea = detalle.concepto?.subarea?.nombre || 'Sin Subárea';
    
    if (!acc[area]) {
      acc[area] = {};
    }
    if (!acc[area][subarea]) {
      acc[area][subarea] = [];
    }
    acc[area][subarea].push(detalle);
    return acc;
  }, {});
  let logoSrc = "/img/versionPresupuesto.png";
  if (forPDF) {
    logoSrc = "file://" + path.resolve(__dirname, "public/img/versionPresupuesto.png");
    console.log('[PDF] Logo path:', logoSrc);
  }
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto ${presupuesto.claveObra || presupuesto.id}</title>
        <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        body {
            font-family: 'Arial', sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.3;
        }
        
        .header {
            text-align: left;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            background: none;
        }
        
        .company-logo {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            text-transform: none;
            text-shadow: none;
        }
        
        .company-info {
            font-size: 10px;
            color: #333;
            margin-bottom: 5px;
            line-height: 1.3;
        }
        
        .document-title {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin: 10px 0 8px;
            text-transform: none;
        }
        
        .budget-code {
            font-size: 12px;
            font-weight: bold;
            color: #000;
            margin-top: 5px;
            padding: 5px 10px;
            border: 1px solid #333;
            background: none;
            display: inline-block;
        }
        
        .generation-date {
            font-size: 9px;
            color: #333;
            margin-top: 8px;
        }
        
        /* INFORMACIÓN DEL CLIENTE Y PROYECTO */
        .client-project-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            background: none;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #000;
            margin-bottom: 8px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }
        
        .info-item {
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            padding: 4px 0;
        }
        
        .label {
            font-weight: bold;
            min-width: 80px;
            color: #333;
            font-size: 10px;
        }
        
        .value {
            color: #000;
            flex: 1;
            font-size: 10px;
            line-height: 1.4;
        }
        
        /* TABLA DE CONCEPTOS */
        .concepts-section {
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10px;
            border: 1px solid #333;
        }
        
        th {
            background: #ddd;
            color: #000;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #333;
        }
        
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        
        .number-cell { text-align: center; font-weight: bold; }
        .amount-cell { text-align: right; font-family: 'Courier New', monospace; }
        
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        tr:hover {
            background-color: #f3f4f6;
        }
        
        /* TOTALES */
        .totals-section {
            text-align: right;
            margin: 20px 0;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            background: none;
        }
        
        .total-row {
            margin: 8px 0;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #ccc;
        }
        
        .subtotal-row { 
            border-bottom: 2px solid #333; 
            font-weight: 600;
        }
        .iva-row { 
            color: #7c2d12; 
            font-weight: 500;
        }
        
        .final-total {
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #333;
            background: #eee;
        }
        
        /* RESUMEN EJECUTIVO */
        .executive-summary {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: none;
        }
        
        .area-group {
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .area-header {
            background: #f0f0f0;
            color: #000;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 10px;
        }
        
        .subarea-list {
            padding: 8px 10px;
            background: white;
        }
        
        .subarea-item {
            padding: 4px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .subarea-included {
            color: #16a34a;
            font-weight: bold;
        }
        
        .subarea-not-included {
            color: #64748b;
        }
        
        /* TÉRMINOS Y CONDICIONES */
        .terms-section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: none;
        }
        
        .terms-list {
            list-style: decimal;
            padding-left: 25px;
            margin: 10px 0;
        }
        
        .terms-list li {
            margin-bottom: 10px;
            text-align: justify;
            line-height: 1.4;
            font-size: 10px;
            color: #333;
        }
        
        /* CLÁUSULA LEGAL */
        .legal-clause {
            background: #fff3f3;
            border: 1px solid #dc2626;
            padding: 15px;
            margin: 25px 0;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            color: #991b1b;
            font-size: 10px;
            line-height: 1.4;
        }
        
        /* SECCIÓN DE FIRMAS */
        .signatures-section {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .signature-box {
            border: 1px solid #333;
            padding: 20px;
            text-align: center;
            background: none;
            border-radius: 5px;
            min-height: 120px;
        }
        
        .signature-title {
            font-weight: bold;
            font-size: 12px;
            color: #000;
            margin-bottom: 30px;
            text-transform: none;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin: 15px 0 10px 0;
            padding-top: 5px;
            font-size: 10px;
            color: #333;
            font-weight: 500;
        }
        
        .signature-space {
            height: 60px;
            margin: 15px 0;
            border-bottom: 1px dashed #ccc;
        }
        
        /* FOOTER */
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #333;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoSrc}" alt="Versión Presupuesto" style="height:40px; width:auto; margin-right:10px;" />
        <div class="company-logo">
          ${SYSTEM_CONSTANTS.COMPANY_INFO.name}
        </div>
        <div class="company-info">
            RFC: ${SYSTEM_CONSTANTS.COMPANY_INFO.fiscalId} | 
            Tel: ${SYSTEM_CONSTANTS.COMPANY_INFO.phone} | 
            Email: ${SYSTEM_CONSTANTS.COMPANY_INFO.email}<br>
            ${SYSTEM_CONSTANTS.COMPANY_INFO.address}<br>
            ${SYSTEM_CONSTANTS.COMPANY_INFO.website}
        </div>
        <div class="document-title">Presupuesto de Servicios de Laboratorio</div>            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
            <div class="budget-code">Clave de Obra: ${presupuesto.claveObra || 'N/A'}</div>
            <div style="display: flex; gap: 15px; align-items: center;">
            </div>
        </div>
        <div class="generation-date">Fecha de generación: ${fechaGeneracion}</div>
      </div>

      <!-- INFORMACIÓN DEL CLIENTE Y PROYECTO -->
      <div class="client-project-section">
          <div>
              <div class="section-title">Datos del Cliente</div>                <div class="info-item">
                  <span class="label">Dirigido a:</span>
                  <span class="value">${presupuesto.cliente?.nombre ? presupuesto.cliente.nombre.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #dc2626; font-style: italic;">Cliente no especificado</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value">${presupuesto.cliente?.direccion ? presupuesto.cliente.direccion.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #64748b; font-style: italic;">No especificada</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Teléfonos:</span>
                  <span class="value">${presupuesto.cliente?.telefonos?.length > 0 ? presupuesto.cliente.telefonos.map((t: any) => t.telefono).join(', ') : '<span style="color: #64748b; font-style: italic;">No registrados</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Correos:</span>
                  <span class="value">${presupuesto.cliente?.correos?.length > 0 ? presupuesto.cliente.correos.map((c: any) => c.correo).join(', ') : '<span style="color: #64748b; font-style: italic;">No registrados</span>'}</span>
              </div>
          </div>
          <div>
              <div class="section-title">Información del Proyecto</div>                <div class="info-item">
                  <span class="label">Responsable:</span>
                  <span class="value">${presupuesto.contactoResponsable ? presupuesto.contactoResponsable.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #64748b; font-style: italic;">No especificado</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Contratista:</span>
                  <span class="value">${presupuesto.nombreContratista ? presupuesto.nombreContratista.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #64748b; font-style: italic;">No especificado</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Descripción:</span>
                  <span class="value">${presupuesto.descripcionObra ? presupuesto.descripcionObra.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #64748b; font-style: italic;">No especificada</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">Ubicación:</span>
                  <span class="value">
                      ${[presupuesto.tramo, presupuesto.colonia, presupuesto.calle].filter(Boolean).map(item => item.replace(/"/g, '&quot;').replace(/'/g, '&#39;')).join(', ') || '<span style="color: #64748b; font-style: italic;">No especificada</span>'}
                  </span>
              </div>
              <div class="info-item">
                  <span class="label">F. Solicitud:</span>
                  <span class="value">${presupuesto.fechaSolicitud ? new Date(presupuesto.fechaSolicitud).toLocaleDateString('es-MX') : '<span style="color: #64748b; font-style: italic;">No registrada</span>'}</span>
              </div>
              <div class="info-item">
                  <span class="label">F. Inicio:</span>
                  <span class="value">${presupuesto.fechaInicio ? new Date(presupuesto.fechaInicio).toLocaleDateString('es-MX') : '<span style="color: #64748b; font-style: italic;">No programada</span>'}</span>
              </div>
          </div>
      </div>

      <!-- DESGLOSE DE SERVICIOS Y CONCEPTOS -->
      <div class="concepts-section">
          <div class="section-title">Desglose Detallado de Servicios</div>
          <table>
              <thead>
                  <tr>
                      <th style="width: 8%;">No.</th>
                      <th style="width: 15%;">Código</th>
                      <th style="width: 40%;">Descripción del Servicio</th>
                      <th style="width: 10%;">Unidad</th>
                      <th style="width: 8%;">Cantidad</th>
                      <th style="width: 12%;">Precio Unitario</th>
                      <th style="width: 12%;">Importe</th>
                  </tr>
              </thead>
              <tbody>                    ${detalles.length === 0 ? `
                      <tr>
                          <td colspan="7" style="text-align: center; padding: 30px; color: #64748b; font-style: italic; background: #f8fafc;">
                              <div style="padding: 20px;">
                                  <strong style="color: #dc2626;">⚠️ No hay conceptos registrados para este presupuesto</strong><br>
                                  <span style="font-size: 10px; margin-top: 10px; display: block;">
                                      Es necesario agregar servicios para completar la cotización
                                  </span>
                              </div>
                          </td>
                      </tr>
                  ` : detalles.map((detalle, index) => `
                      <tr style="border-left: 4px solid ${index % 2 === 0 ? '#2563eb' : '#3b82f6'};">
                          <td class="number-cell" style="background: #f8fafc; font-weight: bold;">${(index + 1).toString().padStart(2, '0')}</td>
                          <td class="number-cell" style="font-family: 'Courier New', monospace; font-weight: bold; color: #2563eb;">
                              ${detalle.conceptoCodigo}
                          </td>
                          <td style="line-height: 1.4;">${detalle.concepto?.descripcion ? detalle.concepto.descripcion.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '<span style="color: #dc2626; font-style: italic;">Descripción no disponible</span>'}</td>
                          <td class="number-cell" style="font-weight: 600;">${detalle.concepto?.unidad || 'N/A'}</td>
                          <td class="amount-cell" style="font-weight: 600;">${Number(detalle.cantidad || 1).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td class="amount-cell" style="color: #059669; font-weight: bold;">$${Number(detalle.precioUnitario || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td class="amount-cell" style="background: #f0f9ff; color: #1e40af; font-weight: bold;">$${Number(detalle.subtotal || detalle.precioUnitario || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      </div>

      <!-- TOTALES -->
      <div class="totals-section">
          <div class="total-row subtotal-row">
              <span><strong>Subtotal:</strong></span>
              <span><strong>$${Number(subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <div class="total-row iva-row">
              <span>IVA (${(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}%):</span>
              <span>$${Number(iva).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="final-total">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>TOTAL A PAGAR:</span>
                  <span>$${Number(total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
          </div>
          ${presupuesto.formaPago ? `
              <div style="margin-top: 15px; text-align: center; background: #e0f2fe; padding: 10px; border-radius: 6px;">
                  <strong>Forma de Pago:</strong> ${presupuesto.formaPago}
              </div>
          ` : ''}
      </div>

      <!-- RESUMEN EJECUTIVO POR SUBÁREAS -->
      ${Object.keys(detallesPorArea).length > 0 ? `
          <div class="executive-summary">
              <div class="section-title">Resumen Ejecutivo por Áreas de Servicio</div>
              <p style="margin-bottom: 15px; font-style: italic; color: #64748b;">
                  Las áreas marcadas en <span class="subarea-included">verde</span> están incluidas en este presupuesto.
              </p>
              ${Object.entries(detallesPorArea).map(([area, subareas]: [string, any]) => `
                  <div class="area-group">
                      <div class="area-header">${area}</div>
                      <div class="subarea-list">
                          ${Object.keys(subareas).map(subarea => `
                              <div class="subarea-item subarea-included">
                                  ✓ ${subarea} (${subareas[subarea].length} concepto${subareas[subarea].length > 1 ? 's' : ''})
                              </div>
                          `).join('')}
                      </div>
                  </div>
              `).join('')}
          </div>
      ` : ''}

      <!-- PÁGINA NUEVA PARA TÉRMINOS -->
      <div class="page-break"></div>

      <!-- TÉRMINOS COMERCIALES Y LEGALES -->
      <div class="terms-section">
          <div class="section-title">Términos y Condiciones Generales</div>
          <ol class="terms-list">
              ${SYSTEM_CONSTANTS.TERMS_AND_CONDITIONS.map(term => `
                  <li>${term}</li>
              `).join('')}
          </ol>
      </div>

      <!-- CLÁUSULA LEGAL DE ACEPTACIÓN -->
      <div class="legal-clause">
          <p>
              <strong>CLÁUSULA LEGAL DE ACEPTACIÓN:</strong><br><br>
              La firma de este documento por parte del cliente implica la aceptación total de los términos y condiciones aquí establecidos, 
              así como la autorización para la ejecución de los servicios descritos, constituyendo este presupuesto un acuerdo vinculante entre las partes.
          </p>
      </div>

      <!-- SECCIÓN DE FIRMAS -->
      <div class="signatures-section">
          <div class="signature-box">
              <div class="signature-title">Firma del Laboratorio</div>
              <div class="signature-space"></div>
              <div class="signature-line">Nombre: ${SYSTEM_CONSTANTS.COMPANY_INFO.manager}</div>
              <div class="signature-line">Cargo: ${SYSTEM_CONSTANTS.COMPANY_INFO.position}</div>
              <div class="signature-line">Fecha: _________________</div>
          </div>
          
          <div class="signature-box">
              <div class="signature-title">Firma del Cliente</div>
              <div class="signature-space"></div>
              <div class="signature-line">Nombre: _________________________________</div>
              <div class="signature-line">Cargo: __________________________________</div>
              <div class="signature-line">Fecha: _________________</div>
          </div>
      </div>        <!-- FOOTER -->
      <div class="footer">
          <p style="margin-bottom: 10px;"><strong>${SYSTEM_CONSTANTS.COMPANY_INFO.name}</strong></p>
          <p style="margin-bottom: 5px;">Este documento ha sido generado electrónicamente el ${fechaGeneracion}</p>
          <p style="font-size: 9px; color: #94a3b8; margin-top: 10px;">
              Para consultas: ${SYSTEM_CONSTANTS.COMPANY_INFO.email} | ${SYSTEM_CONSTANTS.COMPANY_INFO.phone}
          </p>
      </div>
    </body>
    </html>
  `;
}

// HTML validation function to prevent PDF corruption
function validateHTML(html: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for basic HTML structure
  if (!html.includes('<!DOCTYPE html>')) {
    errors.push('Missing DOCTYPE declaration');
  }
  if (!html.includes('<html') || !html.includes('</html>')) {
    errors.push('Missing html tags');
  }
  
  if (!html.includes('<head>') || !html.includes('</head>')) {
    errors.push('Missing head tags');
  }
  
  if (!html.includes('<body>') || !html.includes('</body>')) {
    errors.push('Missing body tags');
  }
  
  // Check for unclosed tags that can cause rendering issues
  const openTags = html.match(/<[^/][^>]*>/g) || [];
  const closeTags = html.match(/<\/[^>]*>/g) || [];
  
  if (openTags.length === 0) {
    errors.push('No opening tags found');
  }
  
  // Check for problematic characters that might cause encoding issues
  const problematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (problematicChars.test(html)) {
    errors.push('Contains control characters that may cause corruption');
  }
  
  // Check minimum length
  if (html.length < 1000) {
    errors.push('HTML content seems tooshort');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  // Dashboard routes
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const [totalClientes, totalPresupuestos, totalObras] = await Promise.all([
        storage.getAllClientes(),
        storage.getAllPresupuestos(),
        storage.getAllObras()
      ]);
      
      const stats = {
        totalClientes: totalClientes.length,
        totalPresupuestos: totalPresupuestos.length,
        totalObras: totalObras.length
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Areas routes
  app.get("/api/areas", async (_req, res) => {
    try {
      const areas = await storage.getAllAreas();
      res.json(areas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/areas", async (req, res) => {
    try {
      const result = insertAreaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const area = await storage.createArea(result.data);
      res.status(201).json(area);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Subareas routes
  app.get("/api/subareas", async (req, res) => {
    try {
      const areaCodigo = req.query.area as string;
      const subareas = areaCodigo 
        ? await storage.getSubareasByArea(areaCodigo)
        : await storage.getAllSubareas();
      res.json(subareas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/subareas", async (req, res) => {
    try {
      const result = insertSubareaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const subarea = await storage.createSubarea(result.data);
      res.status(201).json(subarea);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Conceptos routes
  app.get("/api/conceptos", async (req, res) => {
    try {
      const subareaId = req.query.subarea ? parseInt(req.query.subarea as string) : undefined;
      const conceptos = subareaId 
        ? await storage.getConceptosBySubarea(subareaId)
        : await storage.getAllConceptos();
      res.json(conceptos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conceptos", async (req, res) => {
    try {
      const result = insertConceptoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const concepto = await storage.createConcepto(result.data);
      res.status(201).json(concepto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cliente routes
  app.get("/api/clientes", async (req, res) => {
    try {
      const clientes = await storage.getAllClientes();
      res.json(clientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clientes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cliente = await storage.getClienteById(id);
      if (!cliente) {
        return res.status(404).json({ message: "Cliente not found" });
      }
      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clientes", async (req, res) => {
    try {
      const result = insertClienteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const cliente = await storage.createCliente(result.data);
      res.status(201).json(cliente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });  app.post("/api/clientes/:id/telefonos", async (req, res) => {
    try {
      const clienteId = parseInt(req.params.id);
      console.log('[API] Agregando teléfono para cliente:', clienteId, 'Datos:', req.body);
      
      // Agregar clienteId al body antes de validar
      const dataToValidate = { ...req.body, clienteId };
      const result = insertTelefonoSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        console.log('[API] Error de validación teléfono:', result.error.errors);
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const telefono = await storage.createTelefono(result.data);
      console.log('[API] Teléfono creado exitosamente:', telefono);
      res.status(201).json(telefono);
    } catch (error: any) {
      console.error('[API] Error al crear teléfono:', error);
      res.status(500).json({ message: error.message });
    }
  });  app.post("/api/clientes/:id/correos", async (req, res) => {
    try {
      const clienteId = parseInt(req.params.id);
      console.log('[API] Agregando correo para cliente:', clienteId, 'Datos:', req.body);
      
      // Agregar clienteId al body antes de validar
      const dataToValidate = { ...req.body, clienteId };
      const result = insertCorreoSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        console.log('[API] Error de validación correo:', result.error.errors);
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const correo = await storage.createCorreo(result.data);
      console.log('[API] Correo creado exitosamente:', correo);
      res.status(201).json(correo);
    } catch (error: any) {
      console.error('[API] Error al crear correo:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obras routes
  app.get("/api/obras", async (req, res) => {
    try {
      const areaCodigo = req.query.area as string;
      const obras = areaCodigo 
        ? await storage.getObrasByArea(areaCodigo)
        : await storage.getAllObras();
      res.json(obras);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/obras/:clave", async (req, res) => {
    try {
      const clave = req.params.clave;
      const obra = await storage.getObraById(clave);
      if (!obra) {
        return res.status(404).json({ message: "Obra not found" });
      }
      res.json(obra);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/obras", async (req, res) => {
    try {
      const result = insertObraSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      
      // Generate clave for obra based on area and year
      const year = new Date().getFullYear();
      const obras = await storage.getObrasByArea(result.data.areaCodigo);
      const nextNumber = obras.length + 1;
      const clave = `${result.data.areaCodigo}-${year}-${nextNumber.toString().padStart(4, '0')}`;
      
      const obra = await storage.createObra({ ...result.data, clave });
      res.status(201).json(obra);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ruta para generar clave de obra automáticamente
  app.post("/api/obras/generate-clave", async (req, res) => {
    try {
      const { areaCodigo } = req.body;
      if (!areaCodigo) {
        return res.status(400).json({ message: "areaCodigo is required" });
      }
      const claveObra = await storage.generateClaveObra(areaCodigo);
      res.json({ claveObra });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Presupuesto routes
  app.get("/api/presupuestos", async (req, res) => {
    try {
      const presupuestos = await storage.getAllPresupuestos();
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }
      res.json(presupuesto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });  app.post("/api/presupuestos", async (req, res) => {
    try {
      const { conceptos, areaCodigo, ...presupuestoData } = req.body;
      console.log('[POST /api/presupuestos] Request body:', req.body);
      
      // Si se proporciona areaCodigo, necesitamos crear o encontrar una obra
      let claveObra = presupuestoData.claveObra;
      
      if (areaCodigo && !claveObra) {
        // Generar clave de obra automáticamente
        try {
          claveObra = await storage.generateClaveObra(areaCodigo);
          console.log('[POST /api/presupuestos] Generated claveObra:', claveObra);
          
          // Crear la obra si no existe
          const existingObra = await storage.getObraById(claveObra);
          if (!existingObra) {
            await storage.createObra({
              clave: claveObra,
              areaCodigo: areaCodigo,
              contratista: presupuestoData.nombreContratista,
              estado: 1
            });
            console.log('[POST /api/presupuestos] Created new obra:', claveObra);
          }        } catch (error) {
          console.error('[POST /api/presupuestos] Error creating obra:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return res.status(500).json({ message: 'Error creating obra: ' + errorMessage });
        }
      }
      
      // Preparar datos del presupuesto (sin areaCodigo que no existe en el modelo)
      const finalPresupuestoData = {
        ...presupuestoData,
        claveObra: claveObra
      };
      
      console.log('[POST /api/presupuestos] Final presupuesto data:', finalPresupuestoData);
      
      // Crear el presupuesto principal
      const presupuesto = await storage.createPresupuesto(finalPresupuestoData);
      console.log('[POST /api/presupuestos] Created presupuesto:', presupuesto.id);
      
      // Crear los detalles del presupuesto
      if (conceptos && conceptos.length > 0) {
        console.log('[POST /api/presupuestos] Creating', conceptos.length, 'detalles');
        for (const concepto of conceptos) {
          await storage.createPresupuestoDetalle({
            presupuestoId: presupuesto.id,
            conceptoCodigo: concepto.conceptoCodigo,
            cantidad: concepto.cantidad,
            precioUnitario: concepto.precioUnitario,
            subtotal: concepto.subtotal || (concepto.cantidad * concepto.precioUnitario),
            estado: 'en_proceso'
          });
        }
        
        // Recalcular totales
        await storage.recalcularTotalesPresupuesto(presupuesto.id);
        console.log('[POST /api/presupuestos] Recalculated totals');
      }
      
      // Obtener el presupuesto completo con detalles
      const presupuestoCompleto = await storage.getPresupuestoById(presupuesto.id);
      
      console.log('[POST /api/presupuestos] Success, returning presupuesto:', presupuestoCompleto?.id);
      res.status(201).json(presupuestoCompleto);
    } catch (error: any) {
      console.error('[POST /api/presupuestos] Error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  app.put("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { conceptos, areaCodigo, ...presupuestoData } = req.body;
      console.log('[PUT /api/presupuestos/:id] Request body:', req.body);
      
      // Validar datos del presupuesto (sin conceptos)
      const result = insertPresupuestoSchema.partial().safeParse(presupuestoData);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      
      // Actualizar el presupuesto principal
      const presupuesto = await storage.updatePresupuesto(id, result.data);
      console.log('[PUT /api/presupuestos/:id] Updated presupuesto:', presupuesto.id);
      
      // Si hay conceptos, actualizar los detalles
      if (conceptos && conceptos.length > 0) {
        console.log('[PUT /api/presupuestos/:id] Updating conceptos, count:', conceptos.length);
        
        // Eliminar todos los detalles existentes
        await storage.deletePresupuestoDetallesByPresupuestoId(id);
        
        // Crear los nuevos detalles
        for (const concepto of conceptos) {
          await storage.createPresupuestoDetalle({
            presupuestoId: id,
            conceptoCodigo: concepto.conceptoCodigo,
            cantidad: concepto.cantidad,
            precioUnitario: concepto.precioUnitario,
            subtotal: concepto.subtotal || (concepto.cantidad * concepto.precioUnitario),
            estado: 'en_proceso'
          });
        }
          // Recalcular totales
        const detalles = await storage.getPresupuestoDetalles(id);
        const subtotal = detalles.reduce((sum, detalle) => {
          const cantidad = Number(detalle.cantidad);
          const precio = Number(detalle.precioUnitario);
          return sum + (cantidad * precio);
        }, 0);
        const iva = Number(presupuesto.iva) || 0;
        const ivaMonto = subtotal * iva;
        const total = subtotal + ivaMonto;
        
        // Actualizar totales del presupuesto
        await storage.updatePresupuesto(id, {
          subtotal,
          ivaMonto,
          total
        });
      }
      
      // Obtener el presupuesto actualizado con todos los datos
      const updatedPresupuesto = await storage.getPresupuestoById(id);
      res.json(updatedPresupuesto);
    } catch (error: any) {
      console.error('[PUT /api/presupuestos/:id] Error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePresupuesto(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Presupuesto Detalles routes
  app.get("/api/presupuestos/:id/detalles", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalles = await storage.getPresupuestoDetalles(presupuestoId);
      res.json(detalles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/presupuestos/:id/detalles", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      
      // Agregar presupuestoId al body antes de validar
      const dataToValidate = { ...req.body, presupuestoId };
      const result = insertPresupuestoDetalleSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const detalle = await storage.createPresupuestoDetalle(result.data);
      
      // Recalcular totales después de agregar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);
      
      res.status(201).json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      const result = insertPresupuestoDetalleSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Validation error", errors: result.error.errors });
      }
      const detalle = await storage.updatePresupuestoDetalle(detalleId, result.data);
      
      // Recalcular totales después de actualizar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);
      
      res.json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      await storage.deletePresupuestoDetalle(detalleId);
      
      // Recalcular totales después de eliminar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });  // PDF generation route
  app.get("/api/presupuestos/:id/pdf", async (req, res) => {
    let browser;
    try {
      const id = parseInt(req.params.id);
      console.log(`[PDF] Generating PDF for presupuesto ${id}`);
      
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      console.log(`[PDF] Found ${detalles.length} detalles`);
      const html = generatePresupuestoHTML(presupuesto, detalles, true);
      console.log(`[PDF] Generated HTML, length: ${html.length}`);
      
      // Validate HTML before processing
      const validation = validateHTML(html);
      if (!validation.isValid) {
        console.error('[PDF] HTML validation failed:', validation.errors);
        throw new Error(`HTML validation failed: ${validation.errors.join(', ')}`);
      }
      console.log('[PDF] HTML validation passed');

      // Validate HTML before generating PDF
      const { isValid, errors } = validateHTML(html);
      if (!isValid) {
        return res.status(500).json({ message: 'Invalid HTML generated', errors });
      }

      // Improved puppeteer configuration for PDF corruption issues
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport and user agent to ensure consistent rendering
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`[PDF] Setting page content...`);
      await page.setContent(html, { 
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 60000 
      });
        // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[PDF] Generating PDF...`);
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        timeout: 60000
      });

      console.log(`[PDF] Generated PDF successfully, size: ${pdf.length} bytes`);

      // Verify PDF is not empty or corrupted
      if (!pdf || pdf.length === 0) {
        throw new Error('Generated PDF is empty');
      }      // Check if PDF starts with valid PDF header
      if (!(pdf[0] === 0x25 && pdf[1] === 0x50 && pdf[2] === 0x44 && pdf[3] === 0x46)) {
        throw new Error('Generated PDF has invalid header');
      }

      // Set proper headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${presupuesto.claveObra || presupuesto.id}.pdf"`);
      res.setHeader('Content-Length', pdf.length.toString());
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send PDF as binary data
      res.end(pdf, 'binary');
      
    } catch (error: any) {
      console.error('[PDF] Error generating PDF:', error);
      res.status(500).json({ message: `Error generating PDF: ${error.message}` });
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log('[PDF] Browser closed successfully');
        } catch (closeError) {
          console.error('[PDF] Error closing browser:', closeError);
        }
      }
    }
  });

  // Debug route to see HTML content
  app.get("/api/presupuestos/:id/html", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      const html = generatePresupuestoHTML(presupuesto, detalles);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PDF test endpoint - generates PDF and returns metadata for debugging
  app.get("/api/presupuestos/:id/pdf-test", async (req, res) => {
    let browser;
    try {
      const id = parseInt(req.params.id);
      console.log(`[PDF-TEST] Testing PDF generation for presupuesto ${id}`);
      
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      const html = generatePresupuestoHTML(presupuesto, detalles, true);
      
      // Validate HTML
      const validation = validateHTML(html);
      
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.setContent(html, { 
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 60000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        timeout: 60000
      });      // PDF integrity checks
      const pdfHeader = pdf.slice(0, 5).toString();
      const pdfFooter = pdf.slice(-5).toString();
      
      const result = {
        success: true,
        htmlValidation: validation,
        pdfMetadata: {
          size: pdf.length,
          header: pdfHeader,
          footer: pdfFooter,
          hasValidHeader: pdf[0] === 0x25 && pdf[1] === 0x50 && pdf[2] === 0x44 && pdf[3] === 0x46, // %PDF
          isEmpty: pdf.length === 0,
          firstBytes: Array.from(pdf.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '),
          lastBytes: Array.from(pdf.slice(-20)).map(b => b.toString(16).padStart(2, '0')).join(' ')
        },
        presupuestoData: {
          id: presupuesto.id,
          claveObra: presupuesto.claveObra,
          detallesCount: detalles.length,
          estado: presupuesto.estado,
          subtotal: presupuesto.subtotal,
          total: presupuesto.total
        }
      };
      
      res.json(result);
      
    } catch (error: any) {
      console.error('[PDF-TEST] Error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  return Promise.resolve(server);
}