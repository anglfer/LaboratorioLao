export interface Cliente {
  id: number;
  nombre?: string;                    // Nombre o Razón Social
  direccion?: string;                 // Dirección Fiscal o de Contacto u Oficina
  representanteLegal?: string;        // Nombre del Representante Legal (solo si es empresa)
  contactoPagos?: string;             // Nombre de Contacto para Seguimiento a Pagos
  telefonoPagos?: string;             // Teléfono de Contacto para Seguimiento a Pagos
  metodoPago?: MetodoPago;             // Método de Pago
  correoFacturacion?: string;         // Correo Electrónico para Envío de Facturas
  fechaRegistro?: string;
  activo?: boolean;
  telefonos?: Telefono[];
  correos?: Correo[];
  datosFacturacion?: DatosFacturacion;
}

export interface Telefono {
  id: number;
  clienteId: number;
  telefono: string;
}

export interface Correo {
  id: number;
  clienteId: number;
  correo: string;
}

export interface DatosFacturacion {
  id: number;
  clienteId: number;
  rfc: string;                        // RFC del cliente
  regimenFiscal: RegimenFiscal;       // Régimen Fiscal
  usoCfdi: UsoCFDI;                   // Uso de CFDI
  tipoPago: TipoPago;                 // PUE o PPD
}

// Enums
export enum MetodoPago {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA = "TRANSFERENCIA",
  CHEQUE = "CHEQUE"
}

export enum RegimenFiscal {
  PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES = "PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES",
  PERSONAS_MORALES = "PERSONAS_MORALES",
  REGIMEN_SIMPLIFICADO_DE_CONFIANZA = "REGIMEN_SIMPLIFICADO_DE_CONFIANZA",
  PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES = "PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES",
  REGIMEN_DE_INCORPORACION_FISCAL = "REGIMEN_DE_INCORPORACION_FISCAL",
  OTROS = "OTROS"
}

export enum UsoCFDI {
  GASTOS_EN_GENERAL = "GASTOS_EN_GENERAL",
  EQUIPOS_DE_COMPUTO = "EQUIPOS_DE_COMPUTO",
  HONORARIOS_MEDICOS = "HONORARIOS_MEDICOS",
  GASTOS_MEDICOS = "GASTOS_MEDICOS",
  INTERESES_REALES = "INTERESES_REALES",
  DONACIONES = "DONACIONES",
  OTROS = "OTROS"
}

export enum TipoPago {
  PUE = "PUE", // Pago en Una Sola Exhibición
  PPD = "PPD"  // Pago en Parcialidades o Diferido
}
