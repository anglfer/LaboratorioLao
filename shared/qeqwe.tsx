export interface PresupuestoData {
  id: number;
  claveObra?: string | null;
  cliente?: {
    nombre?: string;
    direccion?: string;
    telefonos?: { telefono: string }[];
    correos?: { correo: string }[];
  } | null;
  nombreContratista?: string | null;
  contactoResponsable?: string | null;
  descripcionObra?: string | null;
  alcance?: string | null;
  direccion?: string | null;
  fechaSolicitud?: string | Date | null;
  estado?: string | null;
  subtotal?: number | null;
  iva?: number | null;
  ivaMonto?: number | null;
  total?: number | null;
  manejaAnticipo?: boolean | null;
  porcentajeAnticipo?: number | null;
}

export interface ConceptoDetalle {
  concepto?: {
    codigo?: string;
    descripcion?: string;
    unidad?: string;
  } | null;
  conceptoCodigo?: string | null;
  cantidad?: number | null;
  precioUnitario?: number | null;
}

// Función para convertir números a letras
function numeroALetras(numero: number): string {
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];

  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  if (numero === 0) return "cero";

  const convertirGrupo = (num: number): string => {
    let resultado = "";

    if (num >= 100) {
      if (num === 100) {
        resultado += "cien";
      } else {
        resultado += centenas[Math.floor(num / 100)];
      }
      num %= 100;
      if (num > 0) resultado += " ";
    }

    if (num >= 20) {
      resultado += decenas[Math.floor(num / 10)];
      num %= 10;
      if (num > 0) resultado += " y " + unidades[num];
    } else if (num > 0) {
      resultado += unidades[num];
    }

    return resultado;
  };

  const entero = Math.floor(numero);
  const centavos = Math.round((numero - entero) * 100);

  let resultado = "";
  let enteroRestante = entero;

  if (enteroRestante >= 1000000) {
    const millones = Math.floor(enteroRestante / 1000000);
    if (millones === 1) {
      resultado += "un millón";
    } else {
      resultado += convertirGrupo(millones) + " millones";
    }
    enteroRestante %= 1000000;
    if (enteroRestante > 0) resultado += " ";
  }

  if (enteroRestante >= 1000) {
    const miles = Math.floor(enteroRestante / 1000);
    if (miles === 1) {
      resultado += "mil";
    } else {
      resultado += convertirGrupo(miles) + " mil";
    }
    enteroRestante %= 1000;
    if (enteroRestante > 0) resultado += " ";
  }

  if (enteroRestante > 0) {
    if (enteroRestante === 1 && resultado !== "") {
      resultado += "uno";
    } else {
      resultado += convertirGrupo(enteroRestante);
    }
  }

  if (resultado === "") resultado = "cero";

  // Agregar la moneda
  resultado += " pesos";

  // Agregar centavos si los hay
  if (centavos > 0) {
    resultado += " con " + convertirGrupo(centavos) + " centavos";
  }

  return resultado + " mexicanos";
}

export function generatePresupuestoHTML(
  presupuesto: PresupuestoData,
  detalles: ConceptoDetalle[]
): string {
  const subtotal = presupuesto.subtotal || 0;
  const iva = presupuesto.ivaMonto || 0;
  const total = presupuesto.total || 0;
  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto ${presupuesto.claveObra || presupuesto.id}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
                color: #333;
                background: white;
                font-size: 12px;
            }
            
            /* Configuración de página para PDF - SIN conflictos con Puppeteer */
            @page {
                size: Letter;
                margin: 3cm 1.5cm 3cm 1.5cm;
            }
            
            /* Header corporativo */
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px 0;
                border-bottom: 3px solid #4CAF50;
                background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%);
                border-radius: 8px;
            }
            
            .company-name {
                font-size: 20px;
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 5px;
            }
            
            .company-subtitle {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
            }
            
            .document-title {
                font-size: 16px;
                font-weight: bold;
                color: #1976D2;
                margin-top: 15px;
            }
            
            .obra-code {
                background: #E3F2FD;
                padding: 8px 15px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 10px;
                font-weight: bold;
                color: #1976D2;
                font-size: 14px;
            }
            
            /* Información del cliente y proyecto */
            .info-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin: 30px 0;
            }
            
            .info-box {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
            }
            
            .info-title {
                font-size: 14px;
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 15px;
                text-transform: uppercase;
            }
            
            .info-item {
                margin-bottom: 8px;
                font-size: 11px;
            }
            
            .info-label {
                font-weight: bold;
                color: #555;
                display: inline-block;
                width: 100px;
            }
            
            .info-value {
                color: #333;
            }
            
            /* Tabla de conceptos */
            .concepts-section {
                margin: 30px 0;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 20px;
                text-align: center;
                padding: 10px;
                background: #E8F5E8;
                border-radius: 5px;
            }
            
            .concepts-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .concepts-table th {
                background: #2E7D32;
                color: white;
                padding: 10px 6px;
                text-align: center;
                font-weight: bold;
                font-size: 10px;
            }
            
            .concepts-table td {
                padding: 8px 6px;
                border-bottom: 1px solid #eee;
                font-size: 9px;
                text-align: center;
                vertical-align: top;
            }
            
            .concepts-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .concept-desc {
                text-align: left !important;
                font-weight: 500;
                max-width: 200px;
                word-wrap: break-word;
            }
            
            .amount {
                text-align: right !important;
                font-weight: bold;
                color: #2E7D32;
            }
            
            /* Totales */
            .totals-section {
                margin: 30px 0;
                display: flex;
                justify-content: flex-end;
            }
            
            .totals-table {
                width: 250px;
                border-collapse: collapse;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .totals-table td {
                padding: 10px 12px;
                border-bottom: 1px solid #eee;
                font-size: 12px;
            }
            
            .totals-table .label {
                font-weight: bold;
                color: #555;
                text-align: left;
            }
            
            .totals-table .value {
                text-align: right;
                font-weight: bold;
                color: #2E7D32;
            }
            
            .total-final {
                background: #2E7D32 !important;
                color: white !important;
                font-size: 14px !important;
            }
            
            /* Total en letras */
            .total-letras {
                margin: 20px 0;
                display: flex;
                justify-content: flex-end;
            }
            
            .total-letras-box {
                width: 400px;
                padding: 15px 20px;
                background: #f8f9fa;
                border: 2px solid #2E7D32;
                border-radius: 8px;
                text-align: center;
            }
            
            /* Notas importantes */
            .notes-section {
                margin: 30px 0;
                padding: 20px;
                background: #fafafa;
                border: 1px solid #ddd;
                border-radius: 8px;
            }
            
            .notes-title {
                font-size: 14px;
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 15px;
                text-transform: uppercase;
                text-align: center;
            }
            
            .notes-content {
                font-size: 10px;
                line-height: 1.5;
                color: #333;
            }
            
            .notes-content p {
                margin: 0 0 8px 0;
            }
            
            /* Forma de pago */
            .payment-section {
                margin: 30px 0;
                padding: 20px;
                background: #E3F2FD;
                border: 1px solid #1976D2;
                border-radius: 8px;
            }
            
            .payment-title {
                font-size: 14px;
                font-weight: bold;
                color: #1976D2;
                margin-bottom: 15px;
                text-transform: uppercase;
                text-align: center;
            }
            
            .payment-content {
                font-size: 11px;
                line-height: 1.6;
                color: #333;
            }
            
            .payment-content p {
                margin: 0 0 8px 0;
            }
            
            /* Mensaje de agradecimiento */
            .thanks-message {
                margin: 30px 0;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #555;
                font-style: italic;
            }
            
            /* Sección de firma */
            .signature-section {
                margin-top: 40px;
                padding: 25px;
                background: #f9f9f9;
                border-radius: 8px;
                text-align: center;
            }
            
            .signature-title {
                font-size: 16px;
                font-weight: bold;
                color: #2E7D32;
                margin-bottom: 25px;
                text-transform: uppercase;
            }
            
            .signature-boxes {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 25px;
            }
            
            .signature-box {
                text-align: center;
            }
            
            .signature-line {
                border-bottom: 2px solid #333;
                width: 180px;
                margin: 30px auto 8px;
            }
            
            .signature-label {
                font-weight: bold;
                color: #555;
                font-size: 10px;
            }
            
            /* Page breaks */
            .page-break {
                page-break-before: always;
            }
            
            /* Términos y condiciones */
            .terms-section {
                margin-top: 30px;
            }
            
            .terms-title {
                font-size: 18px;
                font-weight: bold;
                color: #2E7D32;
                text-align: center;
                margin-bottom: 25px;
                padding: 12px;
                background: #E8F5E8;
                border-radius: 8px;
            }
            
            .terms-content {
                font-size: 10px;
                line-height: 1.5;
                text-align: justify;
            }
            
            .terms-section-title {
                font-size: 12px;
                font-weight: bold;
                color: #2E7D32;
                margin: 15px 0 8px 0;
                text-transform: uppercase;
            }
            
            .accreditation-table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
                font-size: 8px;
            }
            
            .accreditation-table th {
                background: #2E7D32;
                color: white;
                padding: 6px;
                text-align: center;
                font-weight: bold;
            }
            
            .accreditation-table td {
                padding: 4px;
                border: 1px solid #ddd;
                vertical-align: top;
            }
            
            .method-list {
                line-height: 1.3;
            }
            
            .method-list p {
                margin-bottom: 4px;
            }
            
            /* Footer información */
            .footer-info {
                margin-top: 25px;
                text-align: center;
                font-size: 8px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }
            
            /* Responsive adjustments para PDF */
            @media print {
                body {
                    font-size: 11px;
                }
                
                .info-section {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .signature-boxes {
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                }
                
                .concepts-table {
                    font-size: 8px;
                }
                
                .concepts-table th {
                    font-size: 9px;
                }
            }
        </style>
    </head>
    <body>
        <!-- PRIMERA PÁGINA: PRESUPUESTO -->
        <div class="header">
            <div class="company-name">LABORATORIO Y CONSULTORÍA LOA S.A. DE C.V.</div>
            <div class="document-title">PROPUESTA DE SERVICIOS DE LABORATORIO</div>
            <div class="obra-code">CLAVE DE OBRA: ${
              presupuesto.claveObra || "SIN ASIGNAR"
            }</div>
        </div>
        
        <div class="info-section">
            <div class="info-box">
                <div class="info-title">Datos del Cliente</div>
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">${
                      presupuesto.cliente?.nombre || "No especificado"
                    }</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contratista:</span>
                    <span class="info-value">${
                      presupuesto.nombreContratista || "No especificado"
                    }</span>
                </div>
                ${
                  presupuesto.contactoResponsable
                    ? `
                <div class="info-item">
                    <span class="info-label">Contacto:</span>
                    <span class="info-value">${presupuesto.contactoResponsable}</span>
                </div>
                `
                    : ""
                }
                ${
                  presupuesto.direccion
                    ? `
                <div class="info-item">
                    <span class="info-label">Dirección:</span>
                    <span class="info-value">${presupuesto.direccion}</span>
                </div>
                `
                    : ""
                }
                ${
                  presupuesto.cliente?.telefonos?.length
                    ? `
                <div class="info-item">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">${presupuesto.cliente.telefonos[0].telefono}</span>
                </div>
                `
                    : ""
                }
                ${
                  presupuesto.cliente?.correos?.length
                    ? `
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${presupuesto.cliente.correos[0].correo}</span>
                </div>
                `
                    : ""
                }
            </div>
            
            <div class="info-box">
                <div class="info-title">Datos del Proyecto</div>
                <div class="info-item">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${new Date(
                      presupuesto.fechaSolicitud || new Date()
                    ).toLocaleDateString("es-MX")}</span>
                </div>
                ${
                  presupuesto.descripcionObra 
                    ? `
                <div class="info-item">
                    <span class="info-label">Obra:</span>
                    <span class="info-value">${presupuesto.descripcionObra}</span>
                </div>
                `
                    : ""
                }
                ${
                  presupuesto.alcance
                    ? `
                <div class="info-item">
                    <span class="info-label">Alcance:</span>
                    <span class="info-value">${presupuesto.alcance}</span>
                </div>
                `
                    : ""
                }
                <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">${(
                      presupuesto.estado || "borrador"
                    ).toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        <div class="concepts-section">
            <div class="section-title">Desglose de Servicios</div>
            <table class="concepts-table">
                <thead>
                    <tr>
                        <th style="width: 8%">No.</th>
                        <th style="width: 12%">Código</th>
                        <th style="width: 45%">Descripción</th>
                        <th style="width: 8%">Unidad</th>
                        <th style="width: 10%">Cantidad</th>
                        <th style="width: 12%">P. Unit.</th>
                        <th style="width: 12%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${detalles
                      .map(
                        (detalle, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${
                              detalle.concepto?.codigo ||
                              detalle.conceptoCodigo ||
                              "-"
                            }</td>  
                            <td class="concept-desc">${
                              detalle.concepto?.descripcion || "Sin descripción"
                            }</td>
                            <td>${detalle.concepto?.unidad || "-"}</td>
                            <td>${Number(detalle.cantidad || 0).toFixed(2)}</td>
                            <td class="amount">$${Number(
                              detalle.precioUnitario || 0
                            ).toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}</td>
                            <td class="amount">$${(
                              Number(detalle.cantidad || 0) *
                              Number(detalle.precioUnitario || 0)
                            ).toLocaleString("es-MX", {
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
        
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td class="label">Subtotal:</td>
                    <td class="value">$${Number(subtotal).toLocaleString(
                      "es-MX",
                      { minimumFractionDigits: 2 }
                    )}</td>
                </tr>
                <tr>
                    <td class="label">IVA (${(
                      (presupuesto.iva || 0.16) * 100
                    ).toFixed(0)}%):</td>
                    <td class="value">$${Number(iva).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}</td>
                </tr>
                <tr class="total-final">w
                    <td class="label">TOTAL:</td>
                    <td class="value">$${Number(total).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}</td>
                </tr>
            </table>
        </div>
        
        <!-- Total en letras -->
        <div style="margin: 20px 0; display: flex; justify-content: flex-end;">
            <div style="width: 400px; padding: 15px 20px; background: #f8f9fa; border: 2px solid #2E7D32; border-radius: 8px; text-align: center;">
                <div style="font-size: 11px; font-weight: bold; color: #2E7D32; margin-bottom: 5px; text-transform: uppercase;">
                    Total en Letras:
                </div>
                <div style="font-size: 12px; color: #333; font-weight: bold; text-transform: uppercase; font-style: italic;">
                    ${numeroALetras(total)}
                </div>
            </div>
        </div>

        ${
          presupuesto.manejaAnticipo && presupuesto.porcentajeAnticipo
            ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #E3F2FD; border-left: 4px solid #1976D2; border-radius: 5px;">
            <strong>Anticipo requerido:</strong> ${
              presupuesto.porcentajeAnticipo
            }% = $${(
                (Number(total) * Number(presupuesto.porcentajeAnticipo)) /
                100
              ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </div>
        `
            : ""
        }

        <!-- Notas importantes -->
        <div style="margin: 30px 0; padding: 20px; background: #fafafa; border: 1px solid #ddd; border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; color: #2E7D32; margin-bottom: 15px; text-transform: uppercase; text-align: center;">
                NOTAS
            </div>
            <div style="font-size: 10px; line-height: 1.5; color: #333;">
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> Las cantidades en presupuesto pueden sufrir variación en función de las pruebas elaboradas, por lo que el presente presupuesto es una referencia de los costos.
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> En la realización de <em>visitas nocturnas</em> para muestreo de concreto se deberá considerar un costo por visita de <strong>$1,517.83</strong> más IVA, en horario de 20:00 a 06:00 hrs, con permanencia de <em>1.5 hr máximo</em> (CC.060).
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> Se deberá considerar un costo de <strong>$677.44</strong> más IVA por <em>hora extraordinaria</em> de personal de laboratorio en trabajos de campo en <em>horario nocturno</em>, considerando un horario de 21:00 a 06:00 (CC.059).
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> El horario de servicio es de 08:00 a 17:00 hr de lunes a viernes, sábados de 08:00 a 14:00 hr, trabajos fuera del horario se tomará como <em>tiempo extraordinario</em> con un costo de <strong>$406.47</strong> más IVA por hora (CC.055).
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> <em>Visita en falso</em> para muestreo en obra considerando traslados y permanencia de 1.5 hr máximo en horario diurno de 8:00 a 17:00 hr se deberá considerar un costo de <strong>$640.63</strong> más IVA (CC.012).
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> Una vez finalizados los trabajos y entregados los informes correspondientes se dará un período de 30 días para mantener los materiales en laboratorio, posteriormente se desecharán.
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> Los accesos al lugar de la obra, la ubicación de las exploraciones y los permisos necesarios para su realización <em>correrán por cuenta del contratante</em>.
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> Para iniciar los trabajos se requiere: <em>la aceptación del presupuesto se realizará firmando el mismo</em>, preferentemente por el representante legal. La entrega de información final con los resultados se realizará una vez liquidado el monto de los trabajos ejecutados.
                <
                    DIV{
                        /p>
                <p style="margin: 0 0 8px 0;">
                    <strong>*</strong> En caso de requerir cualquier tipo de modificación en el alcance de este presupuesto después de su firma, se realizará un nuevo presupuesto.
                </p>
            </div>
        </div>

        <!-- Forma de pago -->
        <div style="margin: 30px 0; padding: 20px; background: #E3F2FD; border: 1px solid #1976D2; border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; color: #1976D2; margin-bottom: 15px; text-transform: uppercase; text-align: center;">
                FORMA DE PAGO
            </div>
            <div style="font-size: 11px; line-height: 1.6; color: #333;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">
                    Cuenta Bancaria a nombre de: Laboratorio y Consultoría Loa, S.A. de C.V.
                </p>
                <p style="margin: 0 0 8px 0;">
                    <strong>Banorte</strong> No de Cuenta: <strong>00537908428</strong>. Clabe Interbancaria: <strong>072225005379084280</strong>
                </p>
                <p style="margin: 0 0 12px 0;">
                    <strong>Santander</strong> No de Cuenta: <strong>92000608547</strong>. Clabe Interbancaria: <strong>014225920006085475</strong>
                </p>
                <p style="margin: 0; font-size: 10px; font-style: italic;">
                    Le recordamos que ninguno de nuestros laboratoristas está autorizado para recibir o solicitar el pago de las actividades realizadas, en dado caso de ser solicitado favor de comunicarse a los teléfonos del laboratorio.
                </p>
            </div>
        </div>

        <!-- Mensaje de agradecimiento -->
        <div style="margin: 30px 0; padding: 15px; text-align: center; font-size: 12px; color: #555; font-style: italic;">
            Agradeciendo de antemano la atención al presente y en espera de su aceptación, me es grato reiterarme a sus órdenes para cualquier aclaración al respecto.
        </div>
        
        <!-- Sección de firmas completamente nueva -->
        <div style="margin-top: 40px; padding: 25px; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <div style="font-size: 16px; font-weight: bold; color: #2E7D32; margin-bottom: 25px; text-transform: uppercase;">
                Aceptación del Cliente
            </div>
            <p style="margin-bottom: 20px; font-size: 12px; color: #666;">
                RECIBÍ AVISO DE PRIVACIDAD Y TÉRMINOS Y CONDICIONES (ARCHIVOS ANEXOS EN EL CORREO)<br>
                ACEPTO PRESUPUESTO
            </p>
            
            <!-- Tabla para forzar layout horizontal -->
            <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%; text-align: center; vertical-align: top; padding: 0 20px;">
                        <div style="font-weight: bold; margin-bottom: 15px; font-size: 12px;">LABORATORIO Y CONSULTORÍA LOA</div>
                        <div style="margin-bottom: 15px; line-height: 1.4;">
                            <div style="font-weight: bold; font-size: 11px;">A T E N T A M E N T E</div>
                            <div style="font-size: 10px; margin: 5px 0;">Laboratorio y Consultoria Loa S.A. de C.V.</div>
                            <div style="font-size: 10px; margin: 5px 0;">Ing. José Luis Reséndiz Merlos</div>
                            <div style="font-size: 10px; font-weight: bold;">Director General</div>
                        </div>
                        <!-- Imagen de firma del director -->
                        <div style="margin: 20px auto; width: 200px; height: 80px; display: flex; align-items: center; justify-content: center;">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" 
                                 style="max-width: 180px; max-height: 60px; width: auto; height: auto;" 
                                 alt="Firma Director General" />
                        </div>

                        <div style="border-bottom: 2px solid #333; width: 200px; margin: 8px auto; height: 1px;"></div>
                        <div style="font-weight: bold; color: #555; font-size: 10px;">Firma del Director General</div>
                        <div style="margin-top: 8px; font-size: 9px;">Fecha: _______________</div>
                    </td>

                    <td style="width: 50%; text-align: center; vertical-align: top; padding: 0 20px;">
                        <div style="font-weight: bold; margin-bottom: 15px; font-size: 12px;">CLIENTE</div>
                        <div style="height: 60px;"></div> <!-- Espaciado para igualar altura -->
                        <div style="border-bottom: 2px solid #333; width: 200px; margin: 30px auto 8px; height: 1px;"></div>
                        <div style="font-weight: bold; color: #555; font-size: 10px;">Nombre y Firma del Cliente</div>
                        <div style="margin-top: 8px; font-size: 9px;">Fecha: _______________</div>
                    </td>

                </tr>
            </table>
  w                   duv{ ¿¿¿}        
        <!-- SEGUNDA PÁGINA: TÉRMINOS Y CONDICIONES -->
        <div class="page-break"></div>
        
        <div class="terms-section">
            <div class="terms-title">Términos y Condiciones</div>
            
            <div class="terms-content">
                <div class="terms-section-title">Acreditaciones</div>
                <p><strong>Laboratorio y Consultoría LOA:</strong></p>
                <p>Laboratorio de ensayo acreditado por ema, a.c, con acreditación No. <strong>C-08-05-146/17</strong> en la rama de Construcción.</p>
                <p>Laboratorio de ensayo acreditado por ema, a.c, con acreditación No. <strong>MM-1285-116/20</strong> en la rama de Metal mecánica.</p>
                
                <div class="terms-section-title">Métodos de prueba acreditados ante ema: (+)</div>
                
                <table class="accreditation-table">
                    <thead>
                        <tr>
                            <th style="width: 50%">MÉTODOS DE PRUEBA PARA CONCRETO HIDRÁULICO</th>
                            <th style="width: 50%">MÉTODOS DE PRUEBA PARA GEOTECNIA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="method-list">
                                <p>  hadhs,  n</p>
                                <p(+)       re                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            eNMX-C-161-ONNCCE-2013 —Industria de la Construcción-"Concreto Fresco- Muestreo".</p>
                                <p>(+) NMX-C-156-ONNCCE 2010 —Industria de la Construcción-Concreto Hidráulico- "Determinación del revenimiento en el concreto fresco".</p>
                                <p>(*) NMX-C-159-ONNCCE-2016: Industria de la Construcción - Concreto - Elaboración y Curado de Especímenes de Ensayo.</p>
                                <p>(+) NMX-C-109-ONNCCE 2013 —Industria de la Construcción-Concreto Hidráulico- "Cabeceo de especímenes".</p>
                                <p>(+) NMX-C-083-ONNCCE 2014 —Industria de la Construcción-Concreto- "Determ. de la resistencia a la compresión de cilindros de concreto únicamente para cilindros de concreto".</p>
                                <p>(+) NMX-C-169-ONNCCE-2009; "Industria de la Construcción - Concreto - Extracción de especímenes cilíndricos o prismáticos de concreto hidráulico endurecido". (Solo cilindros).</p>
                                <p>(+) NMX-C-191-ONNCCE-2015; "Industria de la Construcción - Concreto - Determinación de la resistencia a la flexión del concreto usando una viga simple con carga en los tercios del claro".</p>
                            </td>
                            <td class="method-list">
                                
                            <p>(+) NMX-C-416-ONNCCE-2003 Capitulo 15: Industria de la construcción - Muestreo de estructuras térreas y métodos de prueba - Método de prueba para la determinación de compactación en el lugar. 15.7.3 "Método de cono y arena" y 15.7.5 "Método de trompa y arena".</p>
                                <p>(+) NMX-C-467-ONNCCE-2019: Industria de la Construcción – Geotecnia – Materiales para Terracerías – Métodos de Muestreo.</p>
                                <p>(+) NMX-C-468-ONNCCE-2018: Industria de la Construcción – Geotecnia – Materiales Térreos – Método de Preparación de Muestras.</p>
                                <p>(+) NMX-C-475-ONNCCE-2020: Industria de la construcción - Geotecnia - Materiales térreos - Determinación del contenido de agua mediante horno - Método de ensayo.</p>
                                <p>(+) NMX-C-476-ONNCCE-2019: Industria de la construcción – Geotecnia – Materiales térreos – Compactación Dinámica Estándar y Modificado – Métodos de ensayo.</p>
                                <p>(+) NMX-C-480-ONNCCE-2014: Industria de la construcción - Geotecnia - Equivalente de arena de agregados finos - Método de ensayo.</p>
                                <p>(+) NMX-C-493-ONNCCE-2018: Industria de la construcción - Geotecnia- Límites de Consistencia de suelos - Método de ensayo.</p>
                                <p>(+) NMX-C-496-ONNCCE-2014: Industria de la Construcción – Geotecnia – Materiales para terracerías – Determinación de la composición granular.</p>
                                <p>(+) NMX-C-503-ONNCCE-2019: Industria de la construcción – Geotecnia – Materiales térreos – Determinación del contenido de agua de suelos mediante secado rápido.</p>
                                <p>(+) ASTM D-1883-16: Standard Test Method for California Bearing Ratio (CBR) of Laboratory Compacted Soils.</p>
                            
                                </td                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                        </tr>
                    </tbody>
                </table>
                
                <table class="accreditation-table">
                
                            <th style="width: 50%">MÉTODOS DE PRUEBA PARA MAMPOSTERÍA</th>
                            <th style="width: 50%">MÉTODOS DE PRUEBA PARA METAL MECÁNICA</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>

                            <td class="method-list">

                                <p>(+) NMX-C-036-ONNCCE-2013; "Industria de la construcción - Mampostería - Resistencia a la compresión de bloques, tabiques o ladrillos y tabicones y adoquines - Método de ensayo".</p>
                                <p>(+) NMX-C-037-ONNCCE-2013; "Industria de la construcción - Mampostería - Determinación de la absorción total y la absorción inicial de agua en bloques, tabiques o ladrillos y tabicones - Método de ensayo".</p>
                                <p>(+) NMX-C-038-ONNCCE-2013; "Industria de la construcción - Mampostería - Determinación de las dimensiones de bloques, tabiques o ladrillos y tabicones - Método de ensayo".</p>
                            
                                </td>
                            <td class="method-list">
                    </td>
                        </tr>wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm                                                                                                                                                                                                                                                                                                                                           
                    </tbody>
                </table>                                                                                     
                
                <div class="terms-section-title">Políticas de Laboratorio</div>
                <p><strong>* Declaración de Conformidad:</strong> Laboratorio y Consultoría LOA no declara conformidad en los resultados. En caso de que se requiera una declaración de conformidad, deberá indicarnos la regla de decisión a seguir y enviarla al correo: controldecalidad@loalaboratorio.com. Si no se recibe la solicitud en un lapso de 3 días hábiles después de firmar de aceptación el presente presupuesto, se da por hecho que no es requerida.</p>
                
                <p><strong>* Incertidumbre:</strong> Si desea conocer la incertidumbre de los métodos de ensayo favor de solicitarlos al correo: gestiondecalidad@loalaboratorio.com</p>
                
                <p><strong>* Capacidad Técnica:   </strong> Laboratorio y Consultoría LOA tiene la capacidad para cumplir con los requisitos especificados en el presente documento.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                
                <p><strong>* Alcance de Resultados:</strong> Laboratorio y Consultoría LOA presenta únicamente en el informe el resultado de las pruebas realizadas. Las recomendaciones solicitadas por el cliente se entregarán en documento anexo y su uso serán su responsabilidad.</p>
                
                <p><strong>* Presencia en Ensayos:</strong> Laboratorio y Consultoría Loa puede atender a los clientes que soliciten presenciar sus ensayes en el Laboratorio Central, previa cita con la Gerencia Técnica.</p>
                
                <p><strong>* Contrato de Servicios:</strong> Laboratorio y Consultoría Loa y el cliente reconocen el presente documento como contrato de prestación de servicios profesionales, para lo cual se firma de conformidad por ambas partes.</p>
                
                <div class="terms-section-title">Imparcialidad</div>
                <p><strong>* Independencia Técnica:</strong> Todo el personal técnico que integra esta empresa se declara ajeno a toda influencia o dependencia moral, económica, laboral, etc., que pudiera afectar de forma negativa en cualquier momento a nuestro servicio, por lo que en su trabajo únicamente se reflejarán los datos de los procedimientos solicitados por el cliente al momento de la realización de los mismos, no incluyendo jamás apreciaciones personales o de terceros, así como datos ficticios o no aprobados.</p>
                
                <p><strong>* Política Anti-Corrupción:</strong> Laboratorio y Consultoría Loa trabaja con apego a la imparcialidad, por lo cual lo invitamos a contribuir NO otorgando ningún tipo de remuneración económica a nuestro personal.</p>
                
                <p><strong>* Comunicación Oficial:</strong> Apreciable cliente, con el objetivo de garantizar la imparcialidad en nuestros servicios: Solicitamos que todo trabajo sea solicitado únicamente a los teléfonos oficiales, por lo que queda estrictamente prohibido dar nuevas indicaciones al personal del laboratorio.</p>
                
                <p>Agradecemos su colaboración en mantener la integridad de nuestros procesos.</p>
                
                <div class="terms-section-title">Confidencialidad</div>
                <p><strong>* Protección de Información:</strong> La empresa declara que tanto ella como el personal que la compone, no están sometidos a ninguna forma de presión interna o externa, por lo que los resultados y/o observaciones serán facilitados únicamente al cliente, de este modo, resguardamos la información para los fines que sean de su interés.</p>
                
                <p><strong>* Compromiso de Privacidad:</strong> Todo el personal firma el documento correspondiente donde declara su independencia, imparcialidad y mantenimiento de confidencialidad en relación a las tareas que ejecuta.</p>
                
                <p><strong>* Manejo de Datos:</strong> La información que Laboratorio y Consultoría LOA maneja es confidencial. Los derechos de propiedad de productos y procesos de los cliente no son divulgados sin la aprobación escrita de éste, esto incluye el almacenamiento y la transmisión electrónica de los resultados.</p>

                <div class="terms-section-title">Condiciones Comerciales</div>
                
                <p><strong>* Forma de Pago:</strong> ${
                  presupuesto.manejaAnticipo
                    ? `Anticipo del ${presupuesto.porcentajeAnticipo}% al momento de la aceptación del presupuesto. El saldo se liquida contra entrega de resultados.`
                    : "Pago contra entrega de resultados."
                }</p>jsj
                
                <p><strong>* Tiempo de Entrega:</strong> Los tiempos de entrega se especificarán al momento de la programación de servicios y dependerán de la carga de trabajo del laboratorio.</p>
                
                <p><strong>* Cancelaciones:</strong> En caso de cancelación por parte del cliente después de iniciados los trabajos, se cobrará proporcionalmente el avance realizado.</p>
                
                <div style="text-align: center; margin-top: 30px; font-weight: bold; font-size: 14px; color: #2E7D32;">
                    FIN DE DOCUMENTO    iiiiiiiewj
                </div>
            </div>
        </div>
             
           
         
           
                                                                                                                                                                                                                                                                                                                                                                                                                               b
        <div class="footer-info">
        <p><strong>Documento generado el ${fechaGeneracion}</strong></p>
            <p>AVE. DE LA PRESA 511 B, IBARRILLA, GTO. C.P. 37080</p>
            <p>TEL: 01 477 2102263 / 01 477 3112205 | EMAIL: recepcion@loalaboratorio.com</p>
            <p>RFC: LOA940429-QR8 | www.loalaboratorio.com</p>
            binuiiiiiiiiiiiiiiiiiiiiiiii                                                                                                                                                                                                                                                                                                                                                                                                     
        </div>
    </body>
    </html> 
  `;
}
