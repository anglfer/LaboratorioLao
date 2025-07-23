export interface Cliente {
  id: number;
  nombre?: string;
  direccion?: string;
  fechaRegistro?: string;
  activo?: boolean;
  telefonos?: Telefono[];
  correos?: Correo[];
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
