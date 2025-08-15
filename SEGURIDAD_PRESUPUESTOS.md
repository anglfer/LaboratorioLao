# Sistema de Restricciones de Permisos para Presupuestos

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de restricciones de permisos que garantiza que **solo el usuario que creó un presupuesto pueda modificarlo**, mientras que otros usuarios solo pueden visualizar sus propios presupuestos.

## 🔒 Cambios Implementados

### 1. Middleware de Autorización

Se agregaron funciones auxiliares para centralizar la validación de permisos:

```typescript
function requireAuth(req: any): SessionUser {
  const sessionUser = req.session?.user as SessionUser | undefined;
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }
  return sessionUser;
}

async function requirePresupuestoPermission(
  presupuestoId: number, 
  sessionUser: SessionUser, 
  action: 'read' | 'write'
): Promise<any> {
  const presupuesto = await storage.getPresupuestoById(presupuestoId);
  if (!presupuesto) {
    throw new Error("NOT_FOUND");
  }

  const esAdmin = sessionUser.rol === 'admin';
  const ownerId = (presupuesto as any).usuarioId ?? null;
  
  if (!esAdmin && ownerId !== sessionUser.id) {
    const actionText = action === 'read' ? 'ver' : 'modificar';
    throw new Error(`No tienes permiso para ${actionText} este presupuesto`);
  }

  return presupuesto;
}
```

### 2. Rutas Protegidas

Se aplicaron validaciones de permisos a todas las rutas críticas:

#### **GET `/api/presupuestos`** (Listado)
- **Admins**: Ven todos los presupuestos
- **Usuarios normales**: Solo ven sus propios presupuestos
- **Sin autenticación**: Error 401

#### **GET `/api/presupuestos/:id`** (Vista individual)
- **Admins**: Pueden ver cualquier presupuesto
- **Propietario**: Puede ver su presupuesto
- **Otros usuarios**: Error 403 "No tienes permiso para ver este presupuesto"

#### **GET `/api/presupuestos/:id/preview`** (Preview HTML)
- Mismas restricciones que vista individual

#### **GET `/api/presupuestos/:id/pdf`** (Generar PDF)
- Mismas restricciones que vista individual

#### **PUT `/api/presupuestos/:id`** (Actualizar)
- **Admins**: Pueden modificar cualquier presupuesto
- **Propietario**: Puede modificar su presupuesto
- **Otros usuarios**: Error 403 "No tienes permiso para modificar este presupuesto"

#### **DELETE `/api/presupuestos/:id`** (Eliminar)
- Mismas restricciones que actualización

### 3. Rutas de Detalles Protegidas

#### **POST `/api/presupuestos/:id/detalles`** (Agregar detalle)
- Solo el propietario del presupuesto o admins pueden agregar detalles

#### **PUT `/api/presupuestos/:id/detalles/:detalleId`** (Actualizar detalle)
- Solo el propietario del presupuesto o admins pueden modificar detalles

#### **DELETE `/api/presupuestos/:id/detalles/:detalleId`** (Eliminar detalle)
- Solo el propietario del presupuesto o admins pueden eliminar detalles

### 4. Filtrado en Listados por Obra

#### **GET `/api/obras/:clave/presupuestos`**
- **Admins**: Ven todos los presupuestos de la obra
- **Usuarios normales**: Solo ven sus propios presupuestos de esa obra

## 🎯 Beneficios del Sistema

### ✅ Seguridad Mejorada
- **Aislamiento de datos**: Cada usuario solo ve y modifica sus propios presupuestos
- **Prevención de accesos no autorizados**: Validación en todas las rutas
- **Roles claramente definidos**: Admins tienen acceso completo, usuarios regulares acceso limitado

### ✅ Experiencia de Usuario
- **Mensajes de error claros**: Se informa específicamente el tipo de restricción
- **Códigos HTTP apropiados**: 401 (No autenticado), 403 (Sin permisos), 404 (No encontrado)
- **Filtrado automático**: Los listados solo muestran contenido relevante

### ✅ Mantenibilidad
- **Código centralizado**: Funciones auxiliares reutilizables
- **Manejo consistente de errores**: Misma lógica en todas las rutas
- **Fácil auditoría**: Logs claros de intentos de acceso

## 🚀 Cómo Funciona

1. **Autenticación**: Se verifica que el usuario esté logueado
2. **Identificación**: Se obtiene el ID del usuario de la sesión
3. **Verificación de propiedad**: Se compara el `usuarioId` del presupuesto con el usuario actual
4. **Roles especiales**: Los usuarios con rol `admin` tienen acceso completo
5. **Respuesta apropiada**: Se devuelve el contenido o error según corresponda

## 📊 Estados de Respuesta

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| 200/201 | Éxito | Usuario autorizado |
| 401 | No autenticado | Sin sesión activa |
| 403 | Sin permisos | Usuario no es propietario ni admin |
| 404 | No encontrado | Presupuesto no existe |
| 500 | Error servidor | Error interno |

## 🔧 Campos de Control

El sistema utiliza estos campos de la base de datos:

- **`usuarioId`**: ID del usuario que creó el presupuesto
- **`ultimoUsuarioId`**: ID del último usuario que modificó el presupuesto  
- **`rol`**: Rol del usuario en sesión (`admin`, `recepcionista`, `jefe_laboratorio`)

## ⚡ Próximas Mejoras

Para el futuro se puede considerar:

1. **Sistema de versionado automático**: Crear nueva versión en cada modificación
2. **Permisos granulares**: Permitir compartir presupuestos específicos
3. **Historial de cambios**: Registrar quién hizo qué cambios y cuándo
4. **Notificaciones**: Avisar cuando alguien intenta acceder sin permisos
