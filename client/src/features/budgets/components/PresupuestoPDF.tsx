import React from "react";

// Función para convertir números a letras
const numeroALetras = (numero: number): string => {
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
};

interface PresupuestoData {
  id: number;
  claveObra?: string;
  cliente?: {
    nombre?: string;
    direccion?: string;
    telefonos?: { telefono: string }[];
    correos?: { correo: string }[];
  };
  nombreContratista?: string;
  contactoResponsable?: string;
  descripcionObra?: string;
  alcance?: string;
  fechaSolicitud?: string;
  estado?: string;
  subtotal?: number;
  iva?: number;
  ivaMonto?: number;
  total?: number;
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
}

interface ConceptoDetalle {
  concepto?: {
    codigo?: string;
    descripcion?: string;
    unidad?: string;
  };
  conceptoCodigo?: string;
  cantidad?: number;
  precioUnitario?: number;
}

interface PresupuestoPDFProps {
  presupuesto: PresupuestoData;
  detalles: ConceptoDetalle[];
  forPDF?: boolean;
}

const PresupuestoPDF: React.FC<PresupuestoPDFProps> = ({
  presupuesto,
  detalles,
  forPDF = false,
}) => {
  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subtotal = presupuesto.subtotal || 0;
  const iva = presupuesto.ivaMonto || 0;
  const total = presupuesto.total || 0;

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        lineHeight: 1.4,
        color: "#333",
        background: "white",
        fontSize: "12px",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Header corporativo */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "20px 0",
          borderBottom: "3px solid #4CAF50",
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#2E7D32",
            marginBottom: "5px",
          }}
        >
          LABORATORIO Y CONSULTORÍA LOA S.A. DE C.V.
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginBottom: "10px",
          }}
        >
          Laboratorio de Ensayo Acreditado por EMA
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1976D2",
            marginTop: "15px",
          }}
        >
          PROPUESTA DE SERVICIOS DE LABORATORIO
        </div>
        <div
          style={{
            background: "#E3F2FD",
            padding: "8px 15px",
            borderRadius: "5px",
            display: "inline-block",
            marginTop: "10px",
            fontWeight: "bold",
            color: "#1976D2",
            fontSize: "14px",
          }}
        >
          CLAVE DE OBRA: {presupuesto.claveObra || "SIN ASIGNAR"}
        </div>
      </div>

      {/* Información del cliente y proyecto */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          margin: "30px 0",
        }}
      >
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #4CAF50",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#2E7D32",
              marginBottom: "15px",
              textTransform: "uppercase",
            }}
          >
            Datos del Cliente
          </div>
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#555",
                display: "inline-block",
                width: "100px",
              }}
            >
              Cliente:
            </span>
            <span style={{ color: "#333" }}>
              {presupuesto.cliente?.nombre || "No especificado"}
            </span>
          </div>
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#555",
                display: "inline-block",
                width: "100px",
              }}
            >
              Contratista:
            </span>
            <span style={{ color: "#333" }}>
              {presupuesto.nombreContratista || "No especificado"}
            </span>
          </div>
          {presupuesto.contactoResponsable && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Contacto:
              </span>
              <span style={{ color: "#333" }}>
                {presupuesto.contactoResponsable}
              </span>
            </div>
          )}
          {presupuesto.cliente?.direccion && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Dirección:
              </span>
              <span style={{ color: "#333" }}>
                {presupuesto.cliente.direccion}
              </span>
            </div>
          )}
          {presupuesto.cliente?.telefonos?.length && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Teléfono:
              </span>
              <span style={{ color: "#333" }}>
                {presupuesto.cliente.telefonos[0].telefono}
              </span>
            </div>
          )}
          {presupuesto.cliente?.correos?.length && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Email:
              </span>
              <span style={{ color: "#333" }}>
                {presupuesto.cliente.correos[0].correo}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #4CAF50",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#2E7D32",
              marginBottom: "15px",
              textTransform: "uppercase",
            }}
          >
            Datos del Proyecto
          </div>
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#555",
                display: "inline-block",
                width: "100px",
              }}
            >
              Fecha:
            </span>
            <span style={{ color: "#333" }}>
              {new Date(
                presupuesto.fechaSolicitud || new Date()
              ).toLocaleDateString("es-MX")}
            </span>
          </div>
          {presupuesto.descripcionObra && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Obra:
              </span>
              <span style={{ color: "#333" }}>
                {presupuesto.descripcionObra}
              </span>
            </div>
          )}
          {presupuesto.alcance && (
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#555",
                  display: "inline-block",
                  width: "100px",
                }}
              >
                Alcance:
              </span>
              <span style={{ color: "#333" }}>{presupuesto.alcance}</span>
            </div>
          )}
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#555",
                display: "inline-block",
                width: "100px",
              }}
            >
              Estado:
            </span>
            <span style={{ color: "#333" }}>
              {(presupuesto.estado || "borrador").toUpperCase()}
            </span>
          </div>
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#555",
                display: "inline-block",
                width: "100px",
              }}
            >
              Vigencia:
            </span>
            <span style={{ color: "#333" }}>30 días naturales</span>
          </div>
        </div>
      </div>

      {/* Tabla de conceptos */}
      <div style={{ margin: "30px 0" }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#2E7D32",
            marginBottom: "20px",
            textAlign: "center",
            padding: "10px",
            background: "#E8F5E8",
            borderRadius: "5px",
          }}
        >
          Desglose de Servicios
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "20px 0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "8%",
                }}
              >
                No.
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "12%",
                }}
              >
                Código
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "45%",
                }}
              >
                Descripción
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "8%",
                }}
              >
                Unidad
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "10%",
                }}
              >
                Cantidad
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "12%",
                }}
              >
                P. Unit.
              </th>
              <th
                style={{
                  background: "#2E7D32",
                  color: "white",
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  width: "12%",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle, index) => (
              <tr
                key={index}
                style={{
                  background: index % 2 === 1 ? "#f9f9f9" : "white",
                }}
              >
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {detalle.concepto?.codigo || detalle.conceptoCodigo || "-"}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "left",
                    verticalAlign: "top",
                    fontWeight: "500",
                    maxWidth: "200px",
                    wordWrap: "break-word",
                  }}
                >
                  {detalle.concepto?.descripcion || "Sin descripción"}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {detalle.concepto?.unidad || "-"}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {Number(detalle.cantidad || 0).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "right",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    color: "#2E7D32",
                  }}
                >
                  $
                  {Number(detalle.precioUnitario || 0).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: "1px solid #eee",
                    fontSize: "9px",
                    textAlign: "right",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    color: "#2E7D32",
                  }}
                >
                  $
                  {(
                    Number(detalle.cantidad || 0) *
                    Number(detalle.precioUnitario || 0)
                  ).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div
        style={{
          margin: "30px 0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <table
          style={{
            width: "250px",
            borderCollapse: "collapse",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#555",
                  textAlign: "left",
                }}
              >
                Subtotal:
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  fontSize: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: "#2E7D32",
                }}
              >
                $
                {Number(subtotal).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#555",
                  textAlign: "left",
                }}
              >
                IVA ({((presupuesto.iva || 0.16) * 100).toFixed(0)}%):
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  fontSize: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                  color: "#2E7D32",
                }}
              >
                $
                {Number(iva).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr
              style={{
                background: "#2E7D32",
                color: "white",
              }}
            >
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                TOTAL:
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "14px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                $
                {Number(total).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total en letras */}
      <div
        style={{
          margin: "20px 0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: "400px",
            padding: "15px 20px",
            background: "#f8f9fa",
            border: "2px solid #2E7D32",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#2E7D32",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Total en Letras:
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#333",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            {numeroALetras(total)}
          </div>
        </div>
      </div>

      {/* Anticipo */}
      {presupuesto.manejaAnticipo && presupuesto.porcentajeAnticipo && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#E3F2FD",
            borderLeft: "4px solid #1976D2",
            borderRadius: "5px",
          }}
        >
          <strong>Anticipo requerido:</strong> {presupuesto.porcentajeAnticipo}%
          = $
          {(
            (Number(total) * Number(presupuesto.porcentajeAnticipo)) /
            100
          ).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}
        </div>
      )}

      {/* Notas importantes */}
      <div
        style={{
          margin: "30px 0",
          padding: "20px",
          background: "#fafafa",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#2E7D32",
            marginBottom: "15px",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          NOTAS
        </div>
        <div style={{ fontSize: "10px", lineHeight: 1.5, color: "#333" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> Las cantidades en presupuesto pueden sufrir
            variación en función de las pruebas elaboradas, por lo que el
            presente presupuesto es una referencia de los costos.
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> En la realización de <em>visitas nocturnas</em>{" "}
            para muestreo de concreto se deberá considerar un costo por visita
            de <strong>$1,517.83</strong> más IVA, en horario de 20:00 a 06:00
            hrs, con permanencia de <em>1.5 hr máximo</em> (CC.060).
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> Se deberá considerar un costo de{" "}
            <strong>$677.44</strong> más IVA por <em>hora extraordinaria</em> de
            personal de laboratorio en trabajos de campo en{" "}
            <em>horario nocturno</em>, considerando un horario de 21:00 a 06:00
            (CC.059).
          </p>

          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> El horario de servicio es de 08:00 a 17:00 hr de
            lunes a viernes, sábados de 08:00 a 14:00 hr, trabajos fuera del
            horario se tomará como <em>tiempo extraordinario</em> con un costo
            de <strong>$406.47</strong> más IVA por hora (CC.055).
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> <em>Visita en falso</em> para muestreo en obra
            considerando traslados y permanencia de 1.5 hr máximo en horario
            diurno de 8:00 a 17:00 hr se deberá considerar un costo de{" "}
            <strong>$640.63</strong> más IVA (CC.012).
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> Una vez finalizados los trabajos y entregados los
            informes correspondientes se dará un período de 30 días para
            mantener los materiales en laboratorio, posteriormente se
            desecharán.
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> Los accesos al lugar de la obra, la ubicación de
            las exploraciones y los permisos necesarios para su realización{" "}
            <em>correrán por cuenta del contratante</em>.
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> Para iniciar los trabajos se requiere:{" "}
            <em>
              la aceptación del presupuesto se realizará firmando el mismo
            </em>
            , preferentemente por el representante legal. La entrega de
            información final con los resultados se realizará una vez liquidado
            el monto de los trabajos ejecutados.
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>*</strong> En caso de requerir cualquier tipo de
            modificación en el alcance de este presupuesto después de su firma,
            se realizará un nuevo presupuesto.
          </p>
        </div>
      </div>

      {/* Forma de pago */}
      <div
        style={{
          margin: "30px 0",
          padding: "20px",
          background: "#E3F2FD",
          border: "1px solid #1976D2",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#1976D2",
            marginBottom: "15px",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          FORMA DE PAGO
        </div>
        <div style={{ fontSize: "11px", lineHeight: 1.6, color: "#333" }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
            Cuenta Bancaria a nombre de: Laboratorio y Consultoría Loa, S.A. de
            C.V.
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Banorte</strong> No de Cuenta: <strong>00537908428</strong>.
            Clabe Interbancaria: <strong>072225005379084280</strong>
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Santander</strong> No de Cuenta:{" "}
            <strong>92000608547</strong>. Clabe Interbancaria:{" "}
            <strong>014225920006085475</strong>
          </p>
          <p style={{ margin: "0", fontSize: "10px", fontStyle: "italic" }}>
            Le recordamos que ninguno de nuestros laboratoristas está autorizado
            para recibir o solicitar el pago de las actividades realizadas, en
            dado caso de ser solicitado favor de comunicarse a los teléfonos del
            laboratorio.
          </p>
        </div>
      </div>

      {/* Mensaje de agradecimiento */}
      <div
        style={{
          margin: "30px 0",
          padding: "15px",
          textAlign: "center",
          fontSize: "12px",
          color: "#555",
          fontStyle: "italic",
        }}
      >
        Agradeciendo de antemano la atención al presente y en espera de su
        aceptación, me es grato reiterarme a sus órdenes para cualquier
        aclaración al respecto.
      </div>

      {/* Sección de firma */}
      <div
        style={{
          marginTop: "40px",
          padding: "25px",
          background: "#f9f9f9",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#2E7D32",
            marginBottom: "25px",
            textTransform: "uppercase",
          }}
        >
          Aceptación del Cliente
        </div>
        <p
          style={{
            marginBottom: "20px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          RECIBÍ AVISO DE PRIVACIDAD Y TÉRMINOS Y CONDICIONES (ARCHIVOS ANEXOS
          EN EL CORREO)
          <br />
          ACEPTO PRESUPUESTO
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            marginTop: "25px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
              LABORATORIO Y CONSULTORÍA LOA
            </div>
            <div
              style={{
                marginBottom: "15px",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "11px" }}>
                A T E N T A M E N T E
              </div>
              <div style={{ fontSize: "10px", margin: "5px 0" }}>
                Laboratorio y Consultoria Loa S.A. de C.V.
              </div>
              <div style={{ fontSize: "10px", margin: "5px 0" }}>
                Ing. José Luis Reséndiz Merlos
              </div>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                Director General
              </div>
            </div>
            <div
              style={{
                borderBottom: "2px solid #333",
                width: "180px",
                margin: "30px auto 8px",
              }}
            ></div>
            <div
              style={{
                fontWeight: "bold",
                color: "#555",
                fontSize: "10px",
              }}
            >
              Firma del Director General
            </div>
            <div style={{ marginTop: "8px", fontSize: "9px" }}>
              Fecha: _______________
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
              CLIENTE
            </div>
            <div
              style={{
                borderBottom: "2px solid #333",
                width: "180px",
                margin: "30px auto 8px",
              }}
            ></div>
            <div
              style={{
                fontWeight: "bold",
                color: "#555",
                fontSize: "10px",
              }}
            >
              Nombre y Firma del Cliente
            </div>
            <div style={{ marginTop: "8px", fontSize: "9px" }}>
              Fecha: _______________
            </div>
          </div>
        </div>
      </div>

      {/* Footer información */}
      <div
        style={{
          marginTop: "25px",
          textAlign: "center",
          fontSize: "8px",
          color: "#666",
          borderTop: "1px solid #ddd",
          paddingTop: "10px",
        }}
      >
        <p>
          <strong>Documento generado el {fechaGeneracion}</strong>
        </p>
        <p>AVE. DE LA PRESA 511 B, IBARRILLA, GTO. C.P. 37080</p>
        <p>
          TEL: 01 477 2102263 / 01 477 3112205 | EMAIL:
          recepcion@loalaboratorio.com
        </p>
        <p>RFC: LOA940429-QR8 | www.loalaboratorio.com</p>
      </div>
    </div>
  );
};

export default PresupuestoPDF;
