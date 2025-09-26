# 🔬 LaboratorioLao - Sistema de Gestión de Laboratorio

## 📋 Descripción General

**LaboratorioLao** es un sistema integral de gestión para laboratorios de control de calidad en construcción. El sistema permite la administración completa de presupuestos, obras, clientes y programación de actividades de laboratorio.

### 🎯 Propósito Principal
Gestionar de manera eficiente el flujo completo desde la solicitud de presupuestos hasta la ejecución de pruebas de laboratorio en obras de construcción.

## ⚡ Características Principales

### 🏗️ Gestión de Obras y Proyectos
- **Registro de obras** con información detallada
- **Generación automática de claves** de obra
- **Seguimiento de estados** y avances
- **Gestión de contratistas y responsables**

### 💰 Sistema de Presupuestos
- **Creación de presupuestos** detallados
- **Estructura jerárquica de conceptos** (áreas → conceptos)
- **Cálculos automáticos** de IVA y totales
- **Generación de PDF** para envío a clientes
- **Control de estados** (borrador, enviado, aprobado, rechazado)
- **Sistema de permisos** por usuario

### 👥 Gestión de Clientes
- **Base de datos completa** de clientes
- **Datos de facturación** integrados
- **Múltiples contactos** por cliente
- **Historial de proyectos**

### 📅 Programación de Actividades
- **Calendario de actividades** de laboratorio
- **Asignación de brigadistas** y vehículos
- **Programación por visita o estancia**
- **Control de muestras** y resultados
- **Seguimiento en tiempo real**

### 🔐 Sistema de Autenticación
- **Roles diferenciados**: Admin, Recepcionista, Jefe de Laboratorio
- **Permisos granulares** por funcionalidad
- **Sesiones seguras** con cookies
- **Control de acceso** a presupuestos por propietario

## 🏗️ Arquitectura del Sistema

### 📁 Estructura del Proyecto
```
LaboratorioLao/
├── client/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── app/              # Configuración de la aplicación
│   │   ├── features/         # Módulos principales
│   │   │   ├── budgets/      # Gestión de presupuestos
│   │   │   ├── clientes/     # Gestión de clientes
│   │   │   ├── concepts/     # Sistema jerárquico
│   │   │   ├── dashboard/    # Panel principal
│   │   │   ├── obras/        # Gestión de obras
│   │   │   └── programming/  # Programación de actividades
│   │   ├── shared/           # Componentes compartidos
│   │   └── types/            # Definiciones de tipos
├── server/                   # Backend Node.js + Express
│   ├── routes.ts            # Rutas principales
│   ├── routes-areas.ts      # Rutas de áreas jerárquicas
│   ├── routes-conceptos.ts  # Rutas de conceptos
│   ├── routes-programming.ts # Rutas de programación
│   ├── storage.ts           # Capa de datos
│   ├── pdf-service.ts       # Generación de PDF
│   └── prisma.ts            # Configuración de Prisma
├── prisma/                  # Base de datos
│   └── schema.prisma        # Esquema de la base de datos
├── shared/                  # Código compartido
│   └── prisma-schema.ts     # Validaciones Zod
└── generated/               # Código generado por Prisma
```

### 🛠️ Stack Tecnológico

#### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler y servidor de desarrollo
- **React Router** - Enrutamiento
- **TanStack Query** - Gestión de estado del servidor
- **React Hook Form** - Gestión de formularios
- **Tailwind CSS** - Framework de estilos
- **Radix UI** - Componentes accesibles
- **Lucide Icons** - Iconografía

#### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **MySQL** - Base de datos
- **Zod** - Validación de esquemas
- **bcryptjs** - Encriptación de contraseñas
- **Puppeteer** - Generación de PDF
- **Express Session** - Gestión de sesiones

## 📊 Modelo de Base de Datos

### 🔗 Entidades Principales

#### 👤 **Cliente**
- Información personal/empresarial
- Datos de facturación (RFC, régimen fiscal)
- Múltiples teléfonos y correos
- Método de pago preferido

#### 🏗️ **Obra**
- Clave única autogenerada
- Información del proyecto
- Relación con cliente
- Estado de avance
- Datos del contratista

#### 💰 **Presupuesto**
- Vinculado a obra y cliente
- Cálculos financieros (subtotal, IVA, total)
- Control de estados
- Sistema de permisos por usuario
- Políticas de anticipo

#### 📋 **PresupuestoDetalle**
- Conceptos individuales del presupuesto
- Cantidad y precio unitario
- Subtotales calculados
- Estado de ejecución

#### 🔧 **ConceptosJerarquicos**
- Estructura jerárquica de servicios
- Precios unitarios
- Unidades de medida
- Descripciones detalladas

#### 📅 **Programacion**
- Calendario de actividades
- Asignación de recursos (brigadistas, vehículos)
- Tipos de programación (visita/estancia)
- Control de estados y resultados

### 🔄 Relaciones Clave
```mermaid
erDiagram
    Cliente ||--o{ Obra : "tiene"
    Obra ||--o{ Presupuesto : "genera"
    Presupuesto ||--o{ PresupuestoDetalle : "contiene"
    Presupuesto ||--o{ Programacion : "programa"
    ConceptosJerarquicos ||--o{ PresupuestoDetalle : "especifica"
    Usuario ||--o{ Presupuesto : "crea"
    AreasJerarquicas ||--o{ ConceptosJerarquicos : "contiene"
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos
- Node.js 18 o superior
- MySQL 8.0 o superior
- npm o yarn

### ⚙️ Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/anglfer/LaboratorioLao.git
cd LaboratorioLao
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con los datos de conexión:
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/laboratorio_lao"
SESSION_SECRET="tu-clave-secreta-aqui"
NODE_ENV="development"
```

4. **Configurar base de datos**
```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar migraciones
npm run db:push

# Poblar datos iniciales
npm run seed
```

5. **Iniciar el servidor de desarrollo**
```bash
# Backend y Frontend simultáneamente
npm run dev

# Solo backend
npm run dev:server

# Solo frontend
npm run dev:client
```

### 🌐 URLs de Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## 👥 Roles y Permisos

### 🔐 Sistema de Autenticación

#### **Administrador**
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del sistema jerárquico
- Visualización de todos los presupuestos
- Reportes y estadísticas

#### **Recepcionista**
- Gestión de clientes
- Creación de presupuestos
- Solo visualiza sus propios presupuestos
- Generación de PDF

#### **Jefe de Laboratorio**
- Gestión de programación
- Asignación de recursos
- Seguimiento de actividades
- Reportes de productividad

### 🛡️ Control de Permisos
- **Presupuestos**: Solo el creador puede modificar (excepto admins)
- **Obras**: Acceso basado en asignación
- **Programación**: Acceso basado en rol
- **Clientes**: Acceso según rol y asignación

## 🔄 Flujos de Trabajo Principales

### 📊 Flujo de Presupuestos

```mermaid
flowchart TD
    A[Solicitud Cliente] --> B[Crear Presupuesto]
    B --> C[Seleccionar Conceptos]
    C --> D[Calcular Totales]
    D --> E[Generar PDF]
    E --> F[Enviar a Cliente]
    F --> G{¿Aprobado?}
    G -->|Sí| H[Programar Actividades]
    G -->|No| I[Modificar/Rechazar]
    H --> J[Ejecutar Trabajos]
    J --> K[Finalizar Presupuesto]
```

### 🏗️ Flujo de Obras

```mermaid
flowchart TD
    A[Registro de Obra] --> B[Asignar Cliente]
    B --> C[Generar Clave Automática]
    C --> D[Crear Presupuesto]
    D --> E[Aprobación Cliente]
    E --> F[Programar Actividades]
    F --> G[Ejecutar Trabajos]
    G --> H[Entrega de Resultados]
```

### 📅 Flujo de Programación

```mermaid
flowchart TD
    A[Presupuesto Aprobado] --> B[Crear Programación]
    B --> C[Asignar Brigadistas]
    C --> D[Asignar Vehículo]
    D --> E[Programar Fecha/Hora]
    E --> F[Ejecutar Visita]
    F --> G[Registrar Muestras]
    G --> H[Completar Actividad]
```

## 📱 Interfaces de Usuario

### 🏠 Dashboard Principal
- **Vista por rol**: Información relevante según el usuario
- **Estadísticas**: Clientes, presupuestos, obras activas
- **Accesos rápidos**: Funciones más utilizadas
- **Notificaciones**: Actividades pendientes

### 💰 Gestión de Presupuestos
- **Lista de presupuestos**: Filtros por estado, cliente, fecha
- **Creación paso a paso**: Wizard guiado
- **Calculadora automática**: Subtotales, IVA, total
- **Vista previa PDF**: Antes de enviar al cliente
- **Historial de cambios**: Trazabilidad completa

### 📅 Programación de Actividades
- **Vista de calendario**: Programaciones por semana/mes
- **Asignación de recursos**: Drag & drop de brigadistas
- **Control de disponibilidad**: Vehículos y personal
- **Estados visuales**: Colores por estado de programación

## 🔧 API Reference

### 🔗 Endpoints Principales

#### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

#### **Clientes**
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

#### **Obras**
- `GET /api/obras` - Listar obras
- `POST /api/obras` - Crear obra
- `POST /api/obras/generate-clave` - Generar clave automática
- `PUT /api/obras/:clave` - Actualizar obra
- `DELETE /api/obras/:clave` - Eliminar obra

#### **Presupuestos**
- `GET /api/presupuestos` - Listar presupuestos
- `POST /api/presupuestos` - Crear presupuesto
- `GET /api/presupuestos/:id` - Obtener presupuesto
- `PUT /api/presupuestos/:id` - Actualizar presupuesto
- `DELETE /api/presupuestos/:id` - Eliminar presupuesto
- `GET /api/presupuestos/:id/pdf` - Generar PDF
- `GET /api/presupuestos/:id/preview` - Vista previa HTML

#### **Sistema Jerárquico**
- `GET /api/areas-jerarquicas` - Listar áreas
- `POST /api/areas-jerarquicas` - Crear área
- `GET /api/conceptos-jerarquicos` - Listar conceptos
- `POST /api/conceptos-jerarquicos` - Crear concepto

#### **Programación**
- `GET /api/programaciones` - Listar programaciones
- `POST /api/programaciones` - Crear programación
- `PUT /api/programaciones/:id` - Actualizar programación
- `GET /api/brigadistas` - Listar brigadistas
- `GET /api/vehiculos` - Listar vehículos

## 🧪 Testing y Calidad

### ✅ Tipos de Pruebas Implementadas

#### **Pruebas de Endpoints**
- Validación de API REST
- Pruebas de autenticación
- Pruebas de permisos
- Validación de datos

#### **Pruebas de Flujo Completo**
- Flujo de creación de presupuestos
- Integración entre módulos
- Pruebas de base de datos
- Validación de cálculos

### 📊 Archivos de Prueba
- `test-endpoints.sh` - Script de pruebas de API
- `test-presupuesto-flow.js` - Pruebas de flujo completo
- `test-backend-communication.js` - Pruebas de comunicación

## 📚 Documentación Adicional

### 📋 Archivos de Documentación
- `SEGURIDAD_PRESUPUESTOS.md` - Sistema de permisos detallado
- `RESULTADOS_PRUEBAS_ENDPOINTS.md` - Resultados de pruebas API

### 🎓 Guías de Desarrollo
- Convenciones de código TypeScript
- Patrones de componentes React
- Estructura de base de datos
- Guías de API design

## 🤝 Contribución

### 📝 Convenciones de Código
- **TypeScript strict mode**
- **ESLint + Prettier** para formato
- **Conventional Commits** para mensajes
- **Feature branches** para desarrollo

### 🔄 Proceso de Desarrollo
1. Fork del repositorio
2. Crear feature branch
3. Desarrollar funcionalidad
4. Escribir pruebas
5. Pull request con descripción detallada

## 📞 Soporte y Contacto

### 🆘 Reportar Problemas
- **GitHub Issues**: Para bugs y mejoras
- **Documentación**: Consultar este README
- **Pruebas**: Ejecutar tests antes de reportar

### 📧 Contacto
- **Desarrollador**: anglfer
- **Repositorio**: https://github.com/anglfer/LaboratorioLao

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

*Documentación generada para LaboratorioLao - Sistema de Gestión de Laboratorio*