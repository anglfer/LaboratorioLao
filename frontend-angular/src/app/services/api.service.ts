import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { 
  Cliente, 
  Obra, 
  Presupuesto, 
  Area, 
  ConceptoJerarquico,
  DashboardStats,
  CreateClienteDto,
  CreateObraDto,
  CreatePresupuestoDto,
  CreateTelefonoDto,
  CreateCorreoDto
} from '@models/index';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  // Signals para el estado global
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Signals reactivos para datos
  private _clientes = signal<Cliente[]>([]);
  private _obras = signal<Obra[]>([]);
  private _presupuestos = signal<Presupuesto[]>([]);
  private _areas = signal<Area[]>([]);
  private _conceptos = signal<ConceptoJerarquico[]>([]);
  private _dashboardStats = signal<DashboardStats | null>(null);

  // Computed properties
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly clientes = this._clientes.asReadonly();
  readonly obras = this._obras.asReadonly();
  readonly presupuestos = this._presupuestos.asReadonly();
  readonly areas = this._areas.asReadonly();
  readonly conceptos = this._conceptos.asReadonly();
  readonly dashboardStats = this._dashboardStats.asReadonly();

  // Computed para estadísticas derivadas
  readonly clientesCount = computed(() => this._clientes().length);
  readonly obrasActivas = computed(() => 
    this._obras().filter((obra: Obra) => obra.estado === 1)
  );

  constructor(private http: HttpClient) {}

  // Método genérico para manejar errores
  private handleError<T>(operation = 'operation', fallback: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      this._error.set(error.error?.message || error.message || 'Error desconocido');
      this._loading.set(false);
      return of(fallback);
    };
  }

  // Método helper para actualizar loading state
  private setLoading(loading: boolean) {
    this._loading.set(loading);
    if (loading) {
      this._error.set(null);
    }
  }

  // === DASHBOARD ===
  async loadDashboardStats(): Promise<void> {
    this.setLoading(true);
    try {
      const stats = await this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`)
        .pipe(
          catchError(this.handleError<DashboardStats>('loadDashboardStats', { 
            totalClientes: 0, 
            totalPresupuestos: 0, 
            totalObras: 0 
          }))
        ).toPromise();
      
      this._dashboardStats.set(stats || null);
    } finally {
      this._loading.set(false);
    }
  }

  // === CLIENTES ===
  async loadClientes(): Promise<void> {
    this.setLoading(true);
    try {
      const clientes = await this.http.get<Cliente[]>(`${this.baseUrl}/clientes/full`)
        .pipe(
          catchError(this.handleError<Cliente[]>('loadClientes', []))
        ).toPromise();
      
      this._clientes.set(clientes || []);
    } finally {
      this._loading.set(false);
    }
  }

  async createCliente(clienteData: CreateClienteDto): Promise<Cliente | null> {
    this.setLoading(true);
    try {
      const cliente = await this.http.post<Cliente>(`${this.baseUrl}/clientes`, clienteData)
        .pipe(
          catchError(this.handleError<Cliente | null>('createCliente', null))
        ).toPromise();
      
      if (cliente) {
        this._clientes.update((current: Cliente[]) => [...current, cliente]);
      }
      return cliente || null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateCliente(id: number, clienteData: Partial<CreateClienteDto>): Promise<Cliente | null> {
    this.setLoading(true);
    try {
      const cliente = await this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, clienteData)
        .pipe(
          catchError(this.handleError<Cliente | null>('updateCliente', null))
        ).toPromise();
      
      if (cliente) {
        this._clientes.update((current: Cliente[]) => 
          current.map((c: Cliente) => c.id === id ? cliente : c)
        );
      }
      return cliente || null;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteCliente(id: number): Promise<boolean> {
    this.setLoading(true);
    try {
      await this.http.delete(`${this.baseUrl}/clientes/${id}`)
        .pipe(
          catchError(this.handleError('deleteCliente', false))
        ).toPromise();
      
      this._clientes.update((current: Cliente[]) => current.filter((c: Cliente) => c.id !== id));
      return true;
    } catch {
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async addTelefono(clienteId: number, telefonoData: CreateTelefonoDto): Promise<boolean> {
    this.setLoading(true);
    try {
      await this.http.post(`${this.baseUrl}/clientes/${clienteId}/telefonos`, telefonoData)
        .pipe(
          catchError(this.handleError('addTelefono', false))
        ).toPromise();
      
      // Recargar clientes para obtener los datos actualizados
      await this.loadClientes();
      return true;
    } catch {
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async addCorreo(clienteId: number, correoData: CreateCorreoDto): Promise<boolean> {
    this.setLoading(true);
    try {
      await this.http.post(`${this.baseUrl}/clientes/${clienteId}/correos`, correoData)
        .pipe(
          catchError(this.handleError('addCorreo', false))
        ).toPromise();
      
      // Recargar clientes para obtener los datos actualizados
      await this.loadClientes();
      return true;
    } catch {
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // === OBRAS ===
  async loadObras(): Promise<void> {
    this.setLoading(true);
    try {
      const obras = await this.http.get<Obra[]>(`${this.baseUrl}/obras`)
        .pipe(
          catchError(this.handleError<Obra[]>('loadObras', []))
        ).toPromise();
      
      this._obras.set(obras || []);
    } finally {
      this._loading.set(false);
    }
  }

  async createObra(obraData: CreateObraDto): Promise<Obra | null> {
    this.setLoading(true);
    try {
      const obra = await this.http.post<Obra>(`${this.baseUrl}/obras`, obraData)
        .pipe(
          catchError(this.handleError<Obra | null>('createObra', null))
        ).toPromise();
      
      if (obra) {
        this._obras.update((current: Obra[]) => [...current, obra]);
      }
      return obra || null;
    } finally {
      this._loading.set(false);
    }
  }

  async generateClave(): Promise<string | null> {
    this.setLoading(true);
    try {
      const response = await this.http.post<{ clave: string }>(`${this.baseUrl}/obras/generate-clave`, {})
        .pipe(
          catchError(this.handleError<{ clave: string } | null>('generateClave', null))
        ).toPromise();
      
      return response?.clave || null;
    } finally {
      this._loading.set(false);
    }
  }

  // === PRESUPUESTOS ===
  async loadPresupuestos(): Promise<void> {
    this.setLoading(true);
    try {
      const presupuestos = await this.http.get<Presupuesto[]>(`${this.baseUrl}/presupuestos`)
        .pipe(
          catchError(this.handleError<Presupuesto[]>('loadPresupuestos', []))
        ).toPromise();
      
      this._presupuestos.set(presupuestos || []);
    } finally {
      this._loading.set(false);
    }
  }

  async createPresupuesto(presupuestoData: CreatePresupuestoDto): Promise<Presupuesto | null> {
    this.setLoading(true);
    try {
      const presupuesto = await this.http.post<Presupuesto>(`${this.baseUrl}/presupuestos`, presupuestoData)
        .pipe(
          catchError(this.handleError<Presupuesto | null>('createPresupuesto', null))
        ).toPromise();
      
      if (presupuesto) {
        this._presupuestos.update((current: Presupuesto[]) => [...current, presupuesto]);
      }
      return presupuesto || null;
    } finally {
      this._loading.set(false);
    }
  }

  // === AREAS ===
  async loadAreas(): Promise<void> {
    this.setLoading(true);
    try {
      const areas = await this.http.get<Area[]>(`${this.baseUrl}/areas`)
        .pipe(
          catchError(this.handleError<Area[]>('loadAreas', []))
        ).toPromise();
      
      this._areas.set(areas || []);
    } finally {
      this._loading.set(false);
    }
  }

  // === CONCEPTOS ===
  async loadConceptos(): Promise<void> {
    this.setLoading(true);
    try {
      const conceptos = await this.http.get<ConceptoJerarquico[]>(`${this.baseUrl}/conceptos-jerarquicos`)
        .pipe(
          catchError(this.handleError<ConceptoJerarquico[]>('loadConceptos', []))
        ).toPromise();
      
      this._conceptos.set(conceptos || []);
    } finally {
      this._loading.set(false);
    }
  }

  // Método para limpiar errores
  clearError(): void {
    this._error.set(null);
  }

  // Método para recargar todos los datos
  async loadAllData(): Promise<void> {
    await Promise.all([
      this.loadDashboardStats(),
      this.loadClientes(),
      this.loadObras(),
      this.loadPresupuestos(),
      this.loadAreas(),
      this.loadConceptos()
    ]);
  }
}
