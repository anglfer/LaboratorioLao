# 👨‍💻 Guía de Desarrollo - LaboratorioLao

## 📋 Información General

Esta guía proporciona las mejores prácticas, convenciones y flujo de trabajo para desarrolladores que trabajan en el proyecto LaboratorioLao.

---

## 🚀 Quick Start para Desarrolladores

### 1️⃣ Setup Inicial

```bash
# Clonar repositorio
git clone https://github.com/anglfer/LaboratorioLao.git
cd LaboratorioLao

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con configuración local

# Setup base de datos
npm run db:generate
npm run db:push
npm run seed

# Iniciar desarrollo
npm run dev
```

### 2️⃣ Verificar Setup

```bash
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Login de prueba
# Email: admin@laboratorio.com
# Password: admin123
```

---

## 📁 Estructura del Proyecto

### 🎯 Convenciones de Carpetas

```
LaboratorioLao/
├── client/src/           # Frontend React
│   ├── app/             # Configuración global
│   ├── features/        # Módulos por dominio
│   │   ├── budgets/     # Usar nombres en inglés
│   │   ├── clients/     # Singular/plural consistente
│   │   └── concepts/    # Nombres descriptivos
│   ├── shared/          # Código reutilizable
│   └── types/           # Tipos globales
├── server/              # Backend Node.js
│   ├── routes*.ts       # Rutas por módulo
│   ├── storage.ts       # Capa de datos
│   └── *.service.ts     # Servicios especializados
├── shared/              # Código compartido
├── docs/                # Documentación
└── prisma/              # Base de datos
```

### 📝 Convenciones de Nombres

#### **Archivos**
```
✅ Correcto:
- BudgetForm.tsx (PascalCase para componentes)
- useBudgets.ts (camelCase para hooks)
- budgetService.ts (camelCase para servicios)
- DATABASE_SCHEMA.md (UPPER_CASE para docs)

❌ Incorrecto:
- budget-form.tsx
- Budget_Service.ts
- UseBudgets.ts
```

#### **Variables y Funciones**
```typescript
// ✅ Correcto - camelCase
const userName = 'admin';
const totalAmount = 1000;
function createBudget() {}

// ❌ Incorrecto
const user_name = 'admin';
const TotalAmount = 1000;
function CreateBudget() {}
```

#### **Tipos y Interfaces**
```typescript
// ✅ Correcto - PascalCase
interface User {
  id: number;
  name: string;
}

type BudgetStatus = 'draft' | 'sent' | 'approved';

// ❌ Incorrecto
interface user {
  id: number;
  name: string;
}
```

---

## 🏗️ Arquitectura y Patrones

### 🎨 Frontend Patterns

#### **Feature-Based Organization**
```typescript
// features/budgets/
export { BudgetsPage } from './pages/BudgetsPage';
export { BudgetForm } from './components/BudgetForm';
export { useBudgets } from './hooks/useBudgets';
export { budgetService } from './services/budgetService';
export type { Budget, BudgetFormData } from './types/budget';
```

#### **Custom Hooks Pattern**
```typescript
// ✅ Correcto - Hook reutilizable
export function useBudgets(filters?: BudgetFilters) {
  const query = useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
      toast.success('Presupuesto creado exitosamente');
    }
  });

  return {
    budgets: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createBudget: createMutation.mutate,
    isCreating: createMutation.isLoading
  };
}

// ❌ Incorrecto - Lógica en componente
function BudgetsList() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/budgets')
      .then(res => res.json())
      .then(setBudgets)
      .finally(() => setLoading(false));
  }, []);
  
  // ...
}
```

#### **Component Composition**
```typescript
// ✅ Correcto - Componentes composables
export function BudgetPage() {
  return (
    <Layout>
      <BudgetHeader />
      <BudgetFilters />
      <BudgetList />
      <BudgetPagination />
    </Layout>
  );
}

// ❌ Incorrecto - Componente monolítico
export function BudgetPage() {
  return (
    <div>
      {/* 500 líneas de JSX mezclado */}
    </div>
  );
}
```

### ⚙️ Backend Patterns

#### **Service Layer Pattern**
```typescript
// ✅ Correcto - Separación de responsabilidades
// routes.ts
app.post('/api/budgets', async (req, res) => {
  try {
    const user = requireAuth(req);
    const validatedData = createBudgetSchema.parse(req.body);
    const budget = await budgetService.create(validatedData, user.id);
    res.status(201).json(budget);
  } catch (error) {
    handleError(error, res);
  }
});

// budgetService.ts
export class BudgetService {
  static async create(data: CreateBudgetData, userId: number): Promise<Budget> {
    const calculatedTotals = this.calculateTotals(data.conceptos);
    
    return await storage.createBudget({
      ...data,
      ...calculatedTotals,
      userId,
      estado: 'borrador'
    });
  }
  
  private static calculateTotals(conceptos: ConceptData[]) {
    const subtotal = conceptos.reduce((sum, c) => sum + (c.quantity * c.unitPrice), 0);
    const ivaAmount = subtotal * 0.16;
    const total = subtotal + ivaAmount;
    
    return { subtotal, ivaAmount, total };
  }
}

// ❌ Incorrecto - Lógica en routes
app.post('/api/budgets', async (req, res) => {
  // 100 líneas de lógica de negocio aquí
});
```

#### **Repository Pattern**
```typescript
// ✅ Correcto - Abstracción de datos
export class BudgetRepository {
  static async findByUser(userId: number, filters?: BudgetFilters): Promise<Budget[]> {
    return await prisma.presupuesto.findMany({
      where: {
        usuarioId: userId,
        ...(filters?.status && { estado: filters.status }),
        ...(filters?.clientId && { clienteId: filters.clientId })
      },
      include: {
        cliente: { select: { id: true, nombre: true } },
        detalles: { include: { concepto: true } }
      },
      orderBy: { fechaSolicitud: 'desc' }
    });
  }
}

// ❌ Incorrecto - Consultas directas en servicios
export class BudgetService {
  static async getByUser(userId: number) {
    // Consulta Prisma directa sin abstracción
    return await prisma.presupuesto.findMany({ /* ... */ });
  }
}
```

---

## 🎨 Standards de Código

### 📝 TypeScript Best Practices

#### **Tipos Explícitos**
```typescript
// ✅ Correcto - Tipos explícitos
interface CreateBudgetRequest {
  clienteId: number;
  claveObra?: string;
  iva: number;
  conceptos: ConceptoData[];
}

interface ConceptoData {
  conceptoCodigo: string;
  cantidad: number;
  precioUnitario: number;
}

function createBudget(data: CreateBudgetRequest): Promise<Budget> {
  // implementación
}

// ❌ Incorrecto - any o tipos implícitos
function createBudget(data: any): any {
  // implementación
}
```

#### **Utility Types**
```typescript
// ✅ Correcto - Reutilizar tipos base
interface Budget {
  id: number;
  clienteId: number;
  total: number;
  estado: BudgetStatus;
  fechaCreacion: Date;
}

// Crear tipos derivados
type CreateBudgetData = Omit<Budget, 'id' | 'fechaCreacion'>;
type BudgetSummary = Pick<Budget, 'id' | 'total' | 'estado'>;
type UpdateBudgetData = Partial<Pick<Budget, 'estado' | 'total'>>;

// ❌ Incorrecto - Duplicar interfaces
interface CreateBudgetData {
  clienteId: number;
  total: number;
  estado: BudgetStatus;
}
```

#### **Enums vs Union Types**
```typescript
// ✅ Correcto - Union types para valores literales
type BudgetStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado';
type UserRole = 'admin' | 'recepcionista' | 'jefe_laboratorio';

// ✅ También correcto - Enums para valores complejos
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// ❌ Evitar - Enums para strings simples
enum BudgetStatus {
  DRAFT = 'borrador',
  SENT = 'enviado'
}
```

### 🎭 React Best Practices

#### **Hooks Rules**
```typescript
// ✅ Correcto - Hooks en el nivel superior
function BudgetForm() {
  const { budgets, createBudget } = useBudgets();
  const { register, handleSubmit, formState } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  
  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    await createBudget(data);
    setIsLoading(false);
  }, [createBudget]);
  
  // ❌ Incorrecto - Hook dentro de condición
  if (someCondition) {
    const someHook = useCustomHook(); // ❌ No hacer esto
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* formulario */}
    </form>
  );
}
```

#### **Component Props**
```typescript
// ✅ Correcto - Props tipadas e interface clara
interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  className?: string;
}

export function BudgetCard({ 
  budget, 
  onEdit, 
  onDelete, 
  showActions = true,
  className 
}: BudgetCardProps) {
  return (
    <div className={cn("budget-card", className)}>
      {/* contenido */}
    </div>
  );
}

// ❌ Incorrecto - Props sin tipar
export function BudgetCard(props: any) {
  return <div>{/* contenido */}</div>;
}
```

#### **State Management**
```typescript
// ✅ Correcto - Estado mínimo necesario
function BudgetForm() {
  const [formData, setFormData] = useState<CreateBudgetData>({
    clienteId: 0,
    conceptos: []
  });
  
  // Estado derivado se calcula, no se almacena
  const totals = useMemo(() => calculateTotals(formData.conceptos), [formData.conceptos]);
  
  return (
    <form>
      <div>Total: {totals.total}</div>
      {/* resto del formulario */}
    </form>
  );
}

// ❌ Incorrecto - Estado redundante
function BudgetForm() {
  const [conceptos, setConceptos] = useState([]);
  const [subtotal, setSubtotal] = useState(0); // ❌ Se puede calcular
  const [total, setTotal] = useState(0); // ❌ Se puede calcular
  
  // Lógica compleja para mantener sincronizado
}
```

---

## 🔄 Git Workflow

### 🌿 Branch Strategy

```bash
# Estructura de branches
main                    # Producción
├── develop            # Desarrollo principal
├── feature/budget-pdf # Nueva funcionalidad
├── bugfix/auth-issue  # Corrección de bugs
└── hotfix/critical-fix # Fixes críticos
```

### 📝 Commit Messages

```bash
# ✅ Correcto - Conventional Commits
feat: add PDF generation for budgets
fix: resolve authentication session timeout
docs: update API documentation for budgets
refactor: extract budget calculation logic
test: add unit tests for budget service

# ❌ Incorrecto
Added some stuff
Fixed bug
Update
```

### 🔄 Pull Request Process

1. **Crear feature branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

2. **Desarrollar con commits atómicos**
```bash
git add .
git commit -m "feat: add budget status validation"
git push origin feature/new-feature
```

3. **Crear PR con template**
```markdown
## 📋 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactoring
- [ ] Documentación

## ✅ Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Se agregaron tests si es necesario
- [ ] Documentación actualizada
- [ ] PR tiene título descriptivo

## 🧪 Testing
Describe cómo testear los cambios.
```

---

## 🧪 Testing Strategy

### 🔬 Tipos de Tests

#### **Unit Tests - Frontend**
```typescript
// components/__tests__/BudgetCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BudgetCard } from '../BudgetCard';

describe('BudgetCard', () => {
  const mockBudget = {
    id: 1,
    claveObra: 'CC-2024-001',
    total: 10000,
    estado: 'borrador' as const
  };

  it('should render budget information correctly', () => {
    render(<BudgetCard budget={mockBudget} />);
    
    expect(screen.getByText('CC-2024-001')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<BudgetCard budget={mockBudget} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Editar'));
    expect(onEdit).toHaveBeenCalledWith(mockBudget);
  });
});
```

#### **Unit Tests - Backend**
```typescript
// services/__tests__/budgetService.test.ts
import { BudgetService } from '../budgetService';
import { prisma } from '../prisma';

vi.mock('../prisma');

describe('BudgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateTotals', () => {
    it('should calculate correct totals', () => {
      const conceptos = [
        { cantidad: 2, precioUnitario: 100 },
        { cantidad: 3, precioUnitario: 200 }
      ];

      const totals = BudgetService.calculateTotals(conceptos);

      expect(totals.subtotal).toBe(800);
      expect(totals.ivaMonto).toBe(128);
      expect(totals.total).toBe(928);
    });
  });
});
```

#### **Integration Tests**
```typescript
// __tests__/integration/budgets.test.ts
import request from 'supertest';
import { app } from '../server';

describe('Budgets API', () => {
  let authCookie: string;

  beforeAll(async () => {
    // Login para obtener cookie de sesión
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    
    authCookie = response.headers['set-cookie'];
  });

  it('should create a new budget', async () => {
    const budgetData = {
      clienteId: 1,
      claveObra: 'CC-2024-001',
      conceptos: [
        { conceptoCodigo: '001', cantidad: 2, precioUnitario: 100 }
      ]
    };

    const response = await request(app)
      .post('/api/presupuestos')
      .set('Cookie', authCookie)
      .send(budgetData);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### 🎯 Testing Commands

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests e2e
npm run test:e2e

# Tests de un archivo específico
npm test -- BudgetCard.test.tsx
```

---

## 🔧 Development Tools

### 🛠️ VSCode Configuration

#### **Extensiones Recomendadas**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### **Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 🎨 Code Formatting

#### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### **ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "prefer-const": "error"
  }
}
```

---

## 📊 Performance Guidelines

### ⚡ Frontend Optimization

#### **Bundle Size**
```typescript
// Lazy loading de rutas
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));

// Tree shaking - importar solo lo necesario
import { format } from 'date-fns/format';
// ❌ import * as dateFns from 'date-fns';

// Minimizar dependencias
import { cn } from '../utils/cn';
// ❌ import classNames from 'classnames';
```

#### **React Performance**
```typescript
// Memoización para componentes pesados
const BudgetCard = memo(({ budget }: { budget: Budget }) => {
  const formattedTotal = useMemo(
    () => formatCurrency(budget.total),
    [budget.total]
  );
  
  return <div>{formattedTotal}</div>;
});

// useCallback para funciones estables
const BudgetList = () => {
  const onBudgetClick = useCallback((budget: Budget) => {
    navigate(`/budgets/${budget.id}`);
  }, [navigate]);
  
  return (
    <div>
      {budgets.map(budget => (
        <BudgetCard key={budget.id} budget={budget} onClick={onBudgetClick} />
      ))}
    </div>
  );
};
```

### 🚀 Backend Optimization

#### **Database Queries**
```typescript
// ✅ Correcto - Incluir solo lo necesario
const getBudgetSummary = async () => {
  return await prisma.presupuesto.findMany({
    select: {
      id: true,
      claveObra: true,
      total: true,
      estado: true,
      cliente: {
        select: { nombre: true }
      }
    },
    take: 20,
    orderBy: { fechaSolicitud: 'desc' }
  });
};

// ❌ Incorrecto - Incluir todo
const getBudgetSummary = async () => {
  return await prisma.presupuesto.findMany({
    include: {
      cliente: true,
      usuario: true,
      detalles: {
        include: { concepto: true }
      }
    }
  });
};
```

#### **Caching**
```typescript
// Cache simple en memoria
const cache = new Map<string, { data: any; expiry: number }>();

export function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300000 // 5 minutos
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && cached.expiry > Date.now()) {
    return Promise.resolve(cached.data);
  }
  
  return fn().then(data => {
    cache.set(key, { data, expiry: Date.now() + ttl });
    return data;
  });
}
```

---

## 🐛 Debugging

### 🔍 Frontend Debugging

```typescript
// React DevTools
// Instalar extensión React Developer Tools

// Debugging hooks
function useBudgets() {
  const query = useQuery(['budgets'], fetchBudgets);
  
  // Debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Budgets query state:', {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
      });
    }
  }, [query.data, query.isLoading, query.error]);
  
  return query;
}

// Error boundaries para capturar errores
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
    // Enviar a servicio de logging
  }
}
```

### 🖥️ Backend Debugging

```typescript
// Logging estructurado
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware de logging
app.use((req, res, next) => {
  logger.info('Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Debug de consultas Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']
});
```

---

## 📚 Learning Resources

### 📖 Documentación Técnica
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Prisma**: https://www.prisma.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TanStack Query**: https://tanstack.com/query/latest

### 🎓 Best Practices
- **React Patterns**: https://reactpatterns.com/
- **TypeScript Best Practices**: https://typescript-eslint.io/rules/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

### 🛠️ Tools
- **VS Code**: https://code.visualstudio.com/
- **Chrome DevTools**: https://developers.google.com/web/tools/chrome-devtools
- **React DevTools**: https://react.dev/learn/react-developer-tools

---

## 🚨 Common Issues & Solutions

### ❌ TypeScript Errors

**Error**: `Cannot find module 'types'`
```bash
# Solución
npm install --save-dev @types/node @types/react
```

**Error**: `Property 'x' does not exist on type 'y'`
```typescript
// Verificar tipos en interfaces
interface User {
  id: number;
  name: string; // ✅ Asegurar que la propiedad existe
}
```

### ❌ Build Errors

**Error**: `Module not found`
```typescript
// ✅ Usar imports relativos correctos
import { Button } from '../components/Button';
// ❌ import { Button } from 'components/Button';
```

### ❌ Database Issues

**Error**: `Connection refused`
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql
sudo systemctl start mysql
```

---

*Guía de desarrollo generada para LaboratorioLao v1.0.0*