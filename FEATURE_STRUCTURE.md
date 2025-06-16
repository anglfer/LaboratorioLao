# Estructura del Proyecto por Features

Este proyecto ha sido reestructurado siguiendo el patrón de **Feature-Based Architecture** para mejorar la organización, mantenibilidad y escalabilidad del código.

## Estructura de Carpetas

```
src/
├── app/                    # Configuración principal de la aplicación
│   ├── App.tsx            # Componente principal y rutas
│   └── not-found.tsx      # Página 404
├── shared/                 # Recursos compartidos entre features
│   ├── components/        # Componentes UI reutilizables
│   │   ├── ui/           # Componentes de interfaz de usuario
│   │   └── Layout.tsx    # Layout principal
│   ├── hooks/            # Custom hooks compartidos
│   ├── lib/              # Utilidades y configuraciones
│   └── types/            # Tipos TypeScript compartidos
├── features/              # Features principales de la aplicación
│   ├── budgets/          # Feature de gestión de presupuestos
│   │   ├── components/   # Componentes específicos de presupuestos
│   │   │   ├── AdvancedBudgetForm.tsx
│   │   │   └── BudgetPdfPreview.tsx
│   │   ├── hooks/        # Hooks específicos de presupuestos
│   │   │   └── useBudgets.ts
│   │   ├── pages/        # Páginas de presupuestos
│   │   │   ├── BudgetsNew.tsx
│   │   │   └── BudgetPrint.tsx
│   │   ├── services/     # Servicios/API calls
│   │   │   └── budgetService.ts
│   │   ├── types/        # Tipos específicos de presupuestos
│   │   │   └── budget.ts
│   │   └── index.ts      # Exportaciones del feature
│   └── dashboard/        # Feature del dashboard
│       ├── pages/
│       │   └── Dashboard.tsx
│       └── index.ts
├── main.tsx              # Punto de entrada de la aplicación
└── index.css             # Estilos globales
```

## Ventajas de esta Estructura

### 1. **Separación de Responsabilidades**
- Cada feature es independiente y maneja su propia lógica
- Los componentes compartidos están claramente separados
- Facilita el desarrollo en equipo

### 2. **Escalabilidad**
- Fácil agregar nuevos features sin afectar los existentes
- Cada feature puede tener su propia estructura interna
- Facilita la migración a microfrontends en el futuro

### 3. **Mantenibilidad**
- Código relacionado está agrupado junto
- Importaciones más claras y organizadas
- Facilita el testing y debugging

### 4. **Reutilización**
- Componentes compartidos en `shared/`
- Hooks y utilidades reutilizables
- Tipos TypeScript bien organizados

## Cómo Agregar un Nuevo Feature

1. **Crear la estructura de carpetas:**
   ```
   src/features/nuevo-feature/
   ├── components/
   ├── hooks/
   ├── pages/
   ├── services/
   ├── types/
   └── index.ts
   ```

2. **Definir tipos en `types/`:**
   ```typescript
   // types/nuevo-feature.ts
   export interface MiTipo {
     id: number;
     nombre: string;
   }
   ```

3. **Crear servicios en `services/`:**
   ```typescript
   // services/nuevoFeatureService.ts
   export const nuevoFeatureService = {
     async getAll() { /* implementación */ }
   };
   ```

4. **Crear hooks en `hooks/`:**
   ```typescript
   // hooks/useNuevoFeature.ts
   export function useNuevoFeature() { /* implementación */ }
   ```

5. **Crear componentes en `components/` y páginas en `pages/`**

6. **Exportar todo en `index.ts`:**
   ```typescript
   // index.ts
   export * from './components/MiComponente';
   export * from './hooks/useNuevoFeature';
   export * from './types/nuevo-feature';
   ```

7. **Agregar rutas en `app/App.tsx`**

## Importaciones

### Desde un Feature:
```typescript
// Importar de shared
import { Button } from '../../../shared/components/ui/button';

// Importar de otro feature
import { Budget } from '../../budgets/types/budget';
```

### Desde App o archivos principales:
```typescript
// Importar features
import { BudgetsNew } from '../features/budgets';
import { Dashboard } from '../features/dashboard';

// Importar shared
import { Layout } from '../shared';
```

## Reglas de Importación

1. **Features no deben importar de otros features directamente**
2. **Usar siempre rutas relativas para imports internos**
3. **Shared puede ser importado por cualquier feature**
4. **App puede importar de cualquier lugar**

Esta estructura facilita el crecimiento del proyecto y mejora la experiencia de desarrollo.
