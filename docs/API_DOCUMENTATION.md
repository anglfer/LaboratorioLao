# 🔗 API Documentation - LaboratorioLao

## 📋 Información General

Esta documentación describe todos los endpoints disponibles en la API REST de LaboratorioLao. La API está construida con Express.js y utiliza Prisma como ORM para interactuar con la base de datos MySQL.

### 🌐 Base URL
```
http://localhost:3000/api
```

### 🔐 Autenticación
La API utiliza sesiones basadas en cookies. Todos los endpoints (excepto login) requieren autenticación previa.

### 📊 Códigos de Respuesta HTTP
| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Operación completada |
| 201 | Creado - Recurso creado exitosamente |
| 400 | Error de validación - Datos inválidos |
| 401 | No autorizado - Sin sesión activa |
| 403 | Prohibido - Sin permisos suficientes |
| 404 | No encontrado - Recurso inexistente |
| 500 | Error interno del servidor |

---

## 🔐 Autenticación

### POST `/auth/login`
Inicia sesión en el sistema

#### Request Body
```json
{
  "email": "admin@laboratorio.com",
  "password": "password123"
}
```

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "email": "admin@laboratorio.com",
  "nombre": "Administrador",
  "apellidos": "Sistema",
  "rol": "admin"
}
```

#### Errores
- **400**: Credenciales inválidas
- **401**: Usuario inactivo

### GET `/auth/me`
Obtiene información del usuario autenticado

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "email": "admin@laboratorio.com",
  "nombre": "Administrador",
  "apellidos": "Sistema",
  "rol": "admin",
  "activo": true
}
```

#### Errores
- **401**: Sin sesión activa

### POST `/auth/logout`
Cierra la sesión actual

#### Respuesta Exitosa (200)
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## 👥 Gestión de Clientes

### GET `/clientes`
Lista todos los clientes

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Búsqueda por nombre |
| `page` | number | Página (default: 1) |
| `limit` | number | Registros por página (default: 10) |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "nombre": "Constructora ABC S.A. de C.V.",
    "direccion": "Av. Principal 123, Col. Centro",
    "representanteLegal": "Ing. Juan Pérez",
    "contactoPagos": "María González",
    "telefonoPagos": "5512345678",
    "metodoPago": "TRANSFERENCIA",
    "correoFacturacion": "facturacion@constructoraabc.com",
    "fechaRegistro": "2024-01-15T10:30:00.000Z",
    "activo": true,
    "telefonos": [
      {
        "id": 1,
        "telefono": "5512345678"
      }
    ],
    "correos": [
      {
        "id": 1,
        "correo": "contacto@constructoraabc.com"
      }
    ],
    "datosFacturacion": {
      "id": 1,
      "rfc": "CAB123456ABC",
      "regimenFiscal": "PERSONAS_MORALES",
      "usoCfdi": "GASTOS_EN_GENERAL",
      "tipoPago": "PUE"
    }
  }
]
```

### POST `/clientes`
Crea un nuevo cliente

#### Request Body
```json
{
  "nombre": "Nueva Constructora S.A.",
  "direccion": "Calle Nueva 456",
  "representanteLegal": "Ing. Ana Martínez",
  "contactoPagos": "Carlos López",
  "telefonoPagos": "5587654321",
  "metodoPago": "EFECTIVO",
  "correoFacturacion": "facturacion@nuevaconstructora.com",
  "telefonos": ["5587654321", "5555123456"],
  "correos": ["contacto@nuevaconstructora.com"],
  "datosFacturacion": {
    "rfc": "NCO123456ABC",
    "regimenFiscal": "PERSONAS_MORALES",
    "usoCfdi": "GASTOS_EN_GENERAL",
    "tipoPago": "PUE"
  }
}
```

#### Respuesta Exitosa (201)
```json
{
  "id": 2,
  "nombre": "Nueva Constructora S.A.",
  "message": "Cliente creado exitosamente"
}
```

### PUT `/clientes/:id`
Actualiza un cliente existente

#### Path Parameters
- `id` (number): ID del cliente

#### Request Body
Misma estructura que POST, todos los campos opcionales

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "message": "Cliente actualizado exitosamente"
}
```

### DELETE `/clientes/:id`
Elimina un cliente

#### Path Parameters
- `id` (number): ID del cliente

#### Respuesta Exitosa (204)
Sin contenido

---

## 🏗️ Gestión de Obras

### GET `/obras`
Lista todas las obras

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `areaCodigo` | string | Filtrar por área |
| `clienteId` | number | Filtrar por cliente |
| `estado` | number | Filtrar por estado (1-5) |

#### Respuesta Exitosa (200)
```json
[
  {
    "clave": "CC-2024-0001",
    "areaCodigo": "CC",
    "nombre": "Control de Calidad Edificio Corporativo",
    "descripcion": "Pruebas de control de calidad para construcción de edificio corporativo de 10 niveles",
    "responsable": "Ing. Pedro González",
    "contacto": "Ing. Pedro González - Responsable de Obra",
    "direccion": "Av. Insurgentes 1500, Col. Del Valle, CDMX",
    "contratista": "Constructora ABC S.A. de C.V.",
    "estado": 1,
    "fechaInicio": "2024-02-01T00:00:00.000Z",
    "clienteId": 1,
    "alcance": "Alcance completo de la obra incluyendo todos los trabajos especificados",
    "fechaCreacion": "2024-01-15T15:30:00.000Z",
    "creadoPor": "admin@laboratorio.com",
    "area": {
      "codigo": "CC",
      "nombre": "Control de Calidad"
    },
    "cliente": {
      "id": 1,
      "nombre": "Constructora ABC S.A. de C.V."
    }
  }
]
```

### POST `/obras`
Crea una nueva obra

#### Request Body
```json
{
  "areaCodigo": "CC",
  "nombre": "Nueva Obra de Construcción",
  "descripcion": "Descripción detallada de la obra",
  "responsable": "Ing. María López",
  "contacto": "Ing. María López - Tel: 5555123456",
  "direccion": "Calle Principal 789, Col. Nueva",
  "contratista": "Constructora XYZ S.A.",
  "clienteId": 1,
  "alcance": "Alcance completo del proyecto",
  "fechaInicio": "2024-03-01",
  "presupuestoEstimado": 500000
}
```

#### Respuesta Exitosa (201)
```json
{
  "clave": "CC-2024-0002",
  "message": "Obra creada exitosamente"
}
```

### POST `/obras/generate-clave`
Genera una clave automática para obra

#### Request Body
```json
{
  "areaCodigo": "CC"
}
```

#### Respuesta Exitosa (200)
```json
{
  "claveObra": "CC-2024-0003"
}
```

---

## 💰 Gestión de Presupuestos

### GET `/presupuestos`
Lista presupuestos (filtrados por usuario si no es admin)

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `estado` | string | Filtrar por estado |
| `clienteId` | number | Filtrar por cliente |
| `page` | number | Página |
| `limit` | number | Registros por página |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "claveObra": "CC-2024-0001",
    "clienteId": 1,
    "usuarioId": 1,
    "ultimoUsuarioId": 1,
    "iva": "0.1600",
    "subtotal": "100000.00",
    "ivaMonto": "16000.00",
    "total": "116000.00",
    "manejaAnticipo": true,
    "porcentajeAnticipo": "30.00",
    "estado": "borrador",
    "fechaSolicitud": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "cliente": {
      "id": 1,
      "nombre": "Constructora ABC S.A. de C.V."
    },
    "obra": {
      "clave": "CC-2024-0001",
      "nombre": "Control de Calidad Edificio Corporativo"
    },
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "apellidos": "Sistema"
    },
    "detalles": [
      {
        "id": 1,
        "conceptoCodigo": "2.1.1.1",
        "cantidad": "5.00",
        "precioUnitario": "1231.53",
        "subtotal": "6157.65",
        "estado": "en_proceso",
        "concepto": {
          "codigo": "2.1.1.1",
          "descripcion": "VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR",
          "unidad": "VISITA",
          "precioUnitario": "1231.53"
        }
      }
    ]
  }
]
```

### POST `/presupuestos`
Crea un nuevo presupuesto

#### Request Body
```json
{
  "clienteId": 1,
  "claveObra": "CC-2024-0001",
  "iva": 0.16,
  "manejaAnticipo": true,
  "porcentajeAnticipo": 30,
  "conceptos": [
    {
      "conceptoCodigo": "2.1.1.1",
      "cantidad": 5,
      "precioUnitario": 1231.53
    },
    {
      "conceptoCodigo": "2.1.1.2",
      "cantidad": 10,
      "precioUnitario": 183.77
    }
  ]
}
```

#### Respuesta Exitosa (201)
```json
{
  "id": 2,
  "message": "Presupuesto creado exitosamente",
  "totales": {
    "subtotal": "8095.35",
    "ivaMonto": "1295.26",
    "total": "9390.61"
  }
}
```

### GET `/presupuestos/:id`
Obtiene un presupuesto específico

#### Path Parameters
- `id` (number): ID del presupuesto

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "claveObra": "CC-2024-0001",
  "clienteId": 1,
  // ... resto de campos como en GET /presupuestos
  "detalles": [
    // ... detalles completos
  ]
}
```

#### Errores
- **403**: Sin permisos para ver este presupuesto
- **404**: Presupuesto no encontrado

### PUT `/presupuestos/:id`
Actualiza un presupuesto

#### Path Parameters
- `id` (number): ID del presupuesto

#### Request Body
```json
{
  "estado": "enviado",
  "iva": 0.16,
  "manejaAnticipo": false
}
```

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "message": "Presupuesto actualizado exitosamente"
}
```

#### Errores
- **403**: Sin permisos para modificar este presupuesto

### DELETE `/presupuestos/:id`
Elimina un presupuesto

#### Path Parameters
- `id` (number): ID del presupuesto

#### Respuesta Exitosa (204)
Sin contenido

#### Errores
- **403**: Sin permisos para eliminar este presupuesto

### GET `/presupuestos/:id/pdf`
Genera PDF del presupuesto

#### Path Parameters
- `id` (number): ID del presupuesto

#### Headers de Respuesta
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="presupuesto_1.pdf"
```

#### Respuesta Exitosa (200)
Archivo PDF binario

### GET `/presupuestos/:id/preview`
Vista previa HTML del presupuesto

#### Path Parameters
- `id` (number): ID del presupuesto

#### Respuesta Exitosa (200)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Presupuesto - CC-2024-0001</title>
    <style>/* CSS del presupuesto */</style>
</head>
<body>
    <!-- HTML del presupuesto -->
</body>
</html>
```

---

## 🔧 Sistema Jerárquico

### GET `/areas-jerarquicas`
Lista áreas jerárquicas

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nivel` | number | Filtrar por nivel |
| `padreId` | number | Filtrar por área padre |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "codigo": "2",
    "nombre": "CONTROL DE CALIDAD",
    "padreId": null,
    "nivel": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "hijos": [
      {
        "id": 2,
        "codigo": "2.1",
        "nombre": "TERRACERÍAS",
        "padreId": 1,
        "nivel": 2
      }
    ]
  }
]
```

### POST `/areas-jerarquicas`
Crea una nueva área jerárquica

#### Request Body
```json
{
  "codigo": "2.1.2",
  "nombre": "PAVIMENTOS",
  "padreId": 2,
  "nivel": 3
}
```

#### Respuesta Exitosa (201)
```json
{
  "id": 5,
  "codigo": "2.1.2",
  "nombre": "PAVIMENTOS",
  "message": "Área creada exitosamente"
}
```

### GET `/conceptos-jerarquicos`
Lista conceptos jerárquicos

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `areaId` | number | Filtrar por área |
| `search` | string | Búsqueda por descripción |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "codigo": "2.1.1.1",
    "descripcion": "VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR (CALAS)",
    "unidad": "VISITA",
    "precioUnitario": "1231.53",
    "areaId": 4,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "area": {
      "id": 4,
      "codigo": "2.1.1",
      "nombre": "TRABAJOS DE CAMPO"
    }
  }
]
```

### POST `/conceptos-jerarquicos`
Crea un nuevo concepto

#### Request Body
```json
{
  "codigo": "2.1.1.5",
  "descripcion": "NUEVA PRUEBA DE LABORATORIO",
  "unidad": "PRUEBA",
  "precioUnitario": 500.00,
  "areaId": 4
}
```

#### Respuesta Exitosa (201)
```json
{
  "id": 10,
  "codigo": "2.1.1.5",
  "message": "Concepto creado exitosamente"
}
```

---

## 📅 Programación

### GET `/programaciones`
Lista programaciones

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `estado` | string | Filtrar por estado |
| `fecha` | string | Filtrar por fecha (YYYY-MM-DD) |
| `brigadistaId` | number | Filtrar por brigadista |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "presupuestoId": 1,
    "claveObra": "CC-2024-0001",
    "fechaProgramada": "2024-02-15T00:00:00.000Z",
    "horaProgramada": "09:00",
    "tipoProgramacion": "obra_por_visita",
    "nombreResidente": "Ing. Carlos Mendoza",
    "telefonoResidente": "5555987654",
    "brigadistaPrincipalId": 1,
    "brigadistaApoyoId": 2,
    "vehiculoId": 1,
    "claveEquipo": "EQ-001",
    "estado": "programada",
    "fechaCreacion": "2024-01-20T10:00:00.000Z",
    "brigadistaPrincipal": {
      "id": 1,
      "nombre": "Juan",
      "apellidos": "Pérez"
    },
    "brigadistaApoyo": {
      "id": 2,
      "nombre": "María",
      "apellidos": "González"
    },
    "vehiculo": {
      "id": 1,
      "clave": "VEH-001",
      "marca": "Ford",
      "modelo": "Transit"
    },
    "detalles": [
      {
        "id": 1,
        "conceptoCodigo": "2.1.1.1",
        "cantidadMuestras": 5,
        "tipoRecoleccion": "sondeo",
        "muestrasObtenidas": null,
        "observaciones": null
      }
    ]
  }
]
```

### POST `/programaciones`
Crea una nueva programación

#### Request Body
```json
{
  "presupuestoId": 1,
  "claveObra": "CC-2024-0001",
  "fechaProgramada": "2024-02-20",
  "horaProgramada": "08:00",
  "tipoProgramacion": "obra_por_visita",
  "nombreResidente": "Ing. Ana Torres",
  "telefonoResidente": "5556543210",
  "brigadistaPrincipalId": 1,
  "brigadistaApoyoId": null,
  "vehiculoId": 1,
  "claveEquipo": "EQ-002",
  "observacionesProgramacion": "Primera visita de reconocimiento",
  "detalles": [
    {
      "conceptoCodigo": "2.1.1.1",
      "cantidadMuestras": 3,
      "tipoRecoleccion": "sondeo",
      "distribucionMuestras": "Distribuir uniformemente en el área"
    }
  ]
}
```

#### Respuesta Exitosa (201)
```json
{
  "id": 2,
  "message": "Programación creada exitosamente"
}
```

### GET `/brigadistas`
Lista brigadistas activos

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellidos": "Pérez",
    "telefono": "5555123456",
    "email": "juan.perez@laboratorio.com",
    "activo": true,
    "fechaRegistro": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/vehiculos`
Lista vehículos activos

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "clave": "VEH-001",
    "marca": "Ford",
    "modelo": "Transit",
    "año": 2022,
    "placas": "ABC-123-DE",
    "activo": true,
    "fechaRegistro": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 📊 Dashboard y Estadísticas

### GET `/dashboard/stats`
Obtiene estadísticas generales del sistema

#### Respuesta Exitosa (200)
```json
{
  "totalClientes": 15,
  "totalPresupuestos": 47,
  "totalObras": 23,
  "presupuestosPorEstado": {
    "borrador": 12,
    "enviado": 18,
    "aprobado": 15,
    "rechazado": 2
  },
  "obrasPorArea": {
    "CC": 15,
    "GEO": 8
  },
  "programacionesHoy": 3,
  "programacionesPendientes": 7
}
```

---

## 🛡️ Códigos de Error Comunes

### Errores de Validación (400)
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "El correo electrónico debe tener un formato válido"
    },
    {
      "field": "clienteId",
      "message": "El cliente es requerido"
    }
  ]
}
```

### Error de Autenticación (401)
```json
{
  "error": "UNAUTHORIZED",
  "message": "Debes iniciar sesión para acceder a este recurso"
}
```

### Error de Permisos (403)
```json
{
  "error": "FORBIDDEN",
  "message": "No tienes permiso para modificar este presupuesto"
}
```

### Recurso No Encontrado (404)
```json
{
  "error": "NOT_FOUND",
  "message": "Presupuesto no encontrado"
}
```

### Error Interno del Servidor (500)
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Ha ocurrido un error interno del servidor"
}
```

---

## 📚 Ejemplos de Uso con cURL

### Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@laboratorio.com",
    "password": "admin123"
  }' \
  -c cookies.txt
```

### Crear Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nombre": "Nueva Constructora S.A.",
    "direccion": "Calle Nueva 456",
    "metodoPago": "TRANSFERENCIA",
    "telefonos": ["5587654321"],
    "correos": ["contacto@nuevaconstructora.com"]
  }'
```

### Crear Presupuesto
```bash
curl -X POST http://localhost:3000/api/presupuestos \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "clienteId": 1,
    "claveObra": "CC-2024-0001",
    "iva": 0.16,
    "conceptos": [
      {
        "conceptoCodigo": "2.1.1.1",
        "cantidad": 5,
        "precioUnitario": 1231.53
      }
    ]
  }'
```

### Generar PDF
```bash
curl -X GET http://localhost:3000/api/presupuestos/1/pdf \
  -b cookies.txt \
  -o presupuesto_1.pdf
```

---

*Documentación API generada para LaboratorioLao v1.0.0*