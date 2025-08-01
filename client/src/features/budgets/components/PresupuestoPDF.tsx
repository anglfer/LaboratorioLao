import React from "react";

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
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
              LABORATORIO Y CONSULTORÍA LOA
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
              Nombre y Firma del Representante
            </div>
            <div style={{ marginTop: "8px", fontSize: "9px" }}>
              Fecha: _______________
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
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
