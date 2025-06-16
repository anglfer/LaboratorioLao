# Dashboards del Sistema

Se han implementado dos tipos de dashboards diferenciados según el tipo de usuario:

## 🏢 **Dashboard de Empleado (Acceso Completo)**

### Características principales:
- **Vista operativa completa** del estado del laboratorio
- **Estadísticas en tiempo real** de obras, muestras, presupuestos, informes y facturación
- **Indicadores de rendimiento** como tiempo promedio de ensayos y eficiencia del laboratorio
- **Alertas del sistema** para situaciones que requieren atención
- **Presupuestos recientes** con estados y montos
- **Accesos directos** para crear presupuestos y gestionar conceptos

### Métricas mostradas:
- Obras en proceso
- Muestras en laboratorio
- Presupuestos pendientes
- Informes por generar
- Facturación pendiente
- Tiempo promedio de ensayo
- Eficiencia del laboratorio
- Ventas del mes

## 👷 **Dashboard de Brigadista (Vista Operativa)**

### Características principales:
- **Vista enfocada en actividades diarias** del brigadista
- **Estadísticas del día** actual (actividades, completadas, pendientes, horas trabajadas)
- **Lista detallada de actividades** con ubicaciones, horarios y prioridades
- **Estados visuales** (pendiente, en proceso, completada)
- **Indicadores de prioridad** (alta, media, baja)
- **Acciones rápidas** para iniciar/completar actividades

### Métricas mostradas:
- Actividades programadas hoy
- Actividades completadas
- Actividades pendientes
- Horas trabajadas en el día

## 🔄 **Selector de Vista (Temporal)**

Para demostración, se incluye un selector en la parte superior que permite cambiar entre:
- **Vista Empleado**: Dashboard completo con acceso a todas las funcionalidades
- **Vista Brigadista**: Dashboard operativo enfocado en actividades diarias

## 🔮 **Integración Futura con Autenticación**

Una vez implementado el sistema de autenticación:
- El tipo de dashboard se determinará automáticamente según el rol del usuario
- Se eliminarán los selectores temporales
- Se aplicarán restricciones de acceso por endpoints
- Se personalizarán los datos según el usuario autenticado

## 📊 **APIs Implementadas**

### Empleado:
- `GET /api/empleado/stats` - Estadísticas operativas
- `GET /api/empleado/alertas` - Alertas del sistema
- `GET /api/empleado/presupuestos-recientes` - Presupuestos recientes

### Brigadista:
- `GET /api/brigadista/stats` - Estadísticas del día
- `GET /api/brigadista/actividades` - Lista de actividades

## 🎯 **Próximos Pasos**

1. **Implementación de autenticación y autorización**
2. **Integración con datos reales de la base de datos**
3. **Gráficas interactivas y visualizaciones avanzadas**
4. **Sistema de notificaciones en tiempo real**
5. **Configuración personalizable por usuario**

Sistema de Gestión Integral - Laboratorio LOA
Documento de Requerimientos Funcionales
1. INTRODUCCIÓN Y ALCANCE DEL PROYECTO
El Laboratorio LOA requiere la implementación de un sistema de gestión integral que automatice y optimice todos sus procesos operativos, desde la generación inicial de presupuestos hasta la facturación final. Este sistema permitirá una mejor trazabilidad, control y eficiencia en las operaciones del laboratorio.
1.1 Objetivos del Sistema
•	Centralizar todos los procesos operativos en una sola plataforma
•	Mejorar la eficiencia y reducir tiempos de procesamiento
•	Garantizar la trazabilidad completa de cada proyecto
•	Facilitar la generación de reportes y estadísticas
•	Optimizar la experiencia del usuario tanto interno como externo
2. FLUJO DE PROCESOS DEL SISTEMA
El sistema debe gestionar el siguiente flujo de procesos de manera secuencial e integrada:
Presupuesto y Orden de Servicio (Integrados) ↓ Revisión y Firma ↓ Programación ↓ Trabajo de Campo ↓ Toma de Muestra ↓ Recepción en Laboratorio ↓ Ensayos de Laboratorio ↓ Generación de Informes ↓ Facturación
Nota: Se llegó a un acuerdo con LOA para integrar el presupuesto y la orden de servicio en un solo módulo para optimizar el proceso.
3. REQUERIMIENTOS TÉCNICOS DE INTERFAZ
3.1 Características de la Interfaz de Usuario
Diseño y Experiencia de Usuario
•	Interfaz gráfica moderna y profesional que refleje la imagen corporativa del laboratorio
•	UX intuitiva y entendible que minimice la curva de aprendizaje
•	Experiencia de usuario agradable con navegación fluida y lógica
•	Diseño visual atractivo que motive el uso del sistema
Responsividad y Compatibilidad
•	Diseño completamente responsivo que se adapte automáticamente a diferentes tamaños de pantalla
•	Compatibilidad multiplataforma: • Computadoras de escritorio (Windows, Mac, Linux) • Tablets (iOS, Android) • Dispositivos móviles (smartphones)
•	Optimización de rendimiento para dispositivos móviles con conexiones lentas
Esquema de Colores
•	Estado actual: No se han definido los colores corporativos
•	Recomendación: Definir una paleta de colores que refleje profesionalismo y confianza
•	Consideraciones: Accesibilidad y contraste adecuado para todos los usuarios
4. MÓDULO DASHBOARD (Tablero de Control)
Propósito
Proporcionar una vista general del estado operativo del laboratorio en tiempo real, permitiendo a los usuarios identificar rápidamente el estado de las operaciones y tomar decisiones informadas.
Funcionalidades Principales
Estadísticas Operativas:
•	Obras en proceso: Contador en tiempo real con desglose por estado
•	Muestras en laboratorio: Cantidad actual con indicadores de prioridad
•	Presupuestos pendientes: Lista de presupuestos que requieren atención
•	Informes por generar: Cola de informes pendientes
•	Facturación pendiente: Trabajos completados pendientes de facturar
Indicadores de Rendimiento:
•	Tiempo promedio de procesamiento por tipo de ensayo
•	Eficiencia del laboratorio (muestras procesadas vs. recibidas)
•	Indicadores financieros básicos
Visualización de Datos:
•	Gráficas interactivas para tendencias
•	Indicadores visuales (semáforos, barras de progreso)
•	Alertas automáticas para situaciones que requieren atención
5. MÓDULO DE PRESUPUESTOS
Propósito
Gestionar de manera integral el proceso de generación, seguimiento y control de presupuestos, desde la solicitud inicial hasta la aprobación final, integrando también la funcionalidad de orden de servicio.
5.1 Vista Principal del Módulo
Listado de Presupuestos
Características del listado:
•	Tabla responsiva con información esencial visible
•	Funciones de búsqueda y filtrado avanzadas
•	Ordenamiento por columnas (fecha, estado, cliente, etc.)
•	Paginación eficiente para grandes volúmenes de datos
Información básica mostrada:
•	Clave de obra (identificador único)
•	Nombre del cliente
•	Descripción resumida de la obra
•	Estado actual (En proceso, Enviado, Aprobado, Finalizado)
•	Fecha de creación
•	Fecha de última modificación
•	Total del presupuesto
Funcionalidades de la Vista Principal:
•	Botón "Crear Nuevo Presupuesto" prominentemente ubicado
•	Filtros rápidos por estado, fecha, cliente
•	Búsqueda inteligente por múltiples campos
•	Acciones rápidas: Ver, Editar, Duplicar, Eliminar, Exportar PDF
•	Exportación masiva de presupuestos seleccionados
5.2 Formulario de Creación de Presupuesto
El formulario estará organizado en secciones lógicas con navegación por pestañas o pasos, permitiendo guardar el progreso en cualquier momento.
SECCIÓN 1: GESTIÓN DE CLIENTES
Búsqueda de Cliente Existente:
•	Campo de búsqueda inteligente que busque por nombre, teléfono o email
•	Lista desplegable con sugerencias en tiempo real
•	Vista previa de información del cliente seleccionado
Creación de Nuevo Cliente (cuando no existe):
•	Formulario emergente o expandible para no interrumpir el flujo
•	Validaciones en tiempo real de datos ingresados
Datos del Cliente:
•	Nombre completo (requerido)
•	Teléfonos: • Campo dinámico para agregar múltiples números • Marcado de teléfono principal
•	Correos electrónicos: • Campo dinámico para múltiples correos • Validación de formato automática • Marcado de correo principal
•	Dirección completa: • Calle y número • Colonia • Ciudad • Estado • Nota: integrado en un solo campo
SECCIÓN 2: INFORMACIÓN DEL CONTRATISTA
Identificación del Contratista:
•	Pregunta clave: "¿El contratista es el mismo que el cliente?"
•	Opción SÍ: Copia automática del nombre del cliente
•	Opción NO: Habilita campo de captura manual
•	Nombre del contratista (si es diferente del cliente)
•	Información adicional del contratista (opcional): teléfono, email
SECCIÓN 3: DETALLES DE LA OBRA
Información Básica de la Obra:
•	Descripción de la obra (campo de texto amplio con contador de caracteres)
•	Fecha de solicitud: Auto-generada, no modificable
•	Fecha de inicio: Campo modificable por el usuario
•	Ubicación específica: • Tramo • Colonia • Calle principal • Referencias geográficas adicionales
Información de Contacto:
•	Contacto responsable: Persona encargada de la obra por parte del cliente
•	Teléfono de contacto directo
•	Email del responsable
5.3 Selección de Conceptos y Servicios
Esta sección implementa un sistema de filtrado jerárquico de tres niveles para facilitar la selección precisa de servicios.
Sistema de Filtrado Jerárquico
Nivel 1 - Selección de Área:
•	PCC (Control De Calidad)
•	PMS (Mecanica De Suelos)
•	PVCC (Control De calidad)
•	PDP (Diseño De Pavimentos)
Nivel 2 - Selección de Subárea:
•	Se habilita automáticamente basado en el área seleccionada
•	Ejemplo: Al seleccionar PCC, se muestran subáreas como "Concreto", etc.
Nivel 3 - Selección de Conceptos:
•	Lista de conceptos específicos basada en la subárea seleccionada
•	Selección múltiple con interface intuitiva
•	Búsqueda interna dentro de los conceptos disponibles
Gestión de Conceptos Seleccionados
Datos por Concepto:
•	No. de Concepto: Código identificador interno
•	Descripción del concepto: Nombre completo del servicio
•	Unidad de medida: Tipo de unidad (m², m³, kg, etc.)
•	Cantidad: Campo numérico editable
•	Precio Unitario (P.U.): • Precio predeterminado del sistema • Editable para casos especiales • Historial de cambios de precio
•	Importe: Cálculo automático (Cantidad × P.U.)
Funcionalidades Avanzadas:
•	Tabla dinámica que se actualiza en tiempo real
•	Eliminación de conceptos seleccionados
•	Modificación rápida de cantidades
•	Duplicación de conceptos similares
•	Validaciones para evitar cantidades negativas o precios cero
Gestión de Precios
Recomendación: Implementar un módulo independiente de gestión de precios que incluya:
•	Actualización anual de tarifas
•	Historial de precios por concepto
•	Aplicación automática de nuevos precios
•	Reportes de cambios de precios
•	Backup de versiones anteriores
5.4 Cálculos y Totales
Sistema de Cálculo Automático:
•	Subtotal: Suma de todos los importes
•	IVA (16%): Cálculo automático sobre el subtotal
•	Total general: Subtotal + IVA
•	Actualización en tiempo real al modificar conceptos
Forma de Pago:
•	Selector de opciones de pago disponibles
•	Términos de pago asociados a cada forma
5.5 Estados y Flujo de Trabajo
Estados del Presupuesto:
•	En proceso: Presupuesto en elaboración
•	Enviado: Presupuesto enviado al cliente
•	Aprobado: Cliente ha aprobado el presupuesto
•	Finalizado: Presupuesto completado y archivado
•	Cancelado: Presupuesto cancelado por alguna razón
Transiciones de Estado:
•	Reglas de negocio para cambios de estado válidos
•	Notificaciones automáticas en cambios de estado
•	Historial de cambios con timestamps y usuarios responsables
5.6 Sistema de Clave de Obra
Generación Automática
Formato: [ÁREA]-[AÑO]-[CONSECUTIVO]
Ejemplos:
•	PCC-25-001
•	PDP-25-002
•	PMS-25-001
Características:
•	Consecutivo individual por área: Cada área mantiene su propia numeración
•	Generación automática: Al seleccionar el área
•	Numeración de 3-4 dígitos: Escalable según el volumen
•	No duplicable: Sistema de validación único
5.7 Funcionalidades de Guardado y Exportación
Opciones de Guardado:
•	Guardado automático: Cada cierto tiempo
•	Guardado manual: Botón "Guardar"
•	Guardado como borrador: Para presupuestos incompletos
•	Versionado: Mantener historial de cambios
Exportación a PDF:
•	Generación automática del PDF con formato profesional
•	Descarga inmediata
•	Envío por email directamente desde el sistema
•	Almacenamiento en servidor para acceso posterior
5.8 Especificaciones del Documento PDF
5.8.1 Estructura General del Documento
El PDF generado debe ser un documento profesional que sirva como propuesta formal y, una vez firmado, como contrato vinculante.
5.8.2 Encabezado Corporativo
•	Logo e imagen corporativa del Laboratorio LOA (Version del formato)
•	Información de contacto de la empresa
•	Número de identificación fiscal
•	Clave de obra prominentemente mostrada
•	Fecha de generación del presupuesto
5.8.3 Información del Cliente y Proyecto
Datos del Cliente:
•	Nombre completo
•	Dirección completa
•	Teléfonos de contacto
•	Correos electrónicos
Información del Proyecto:
•	Dirigido a: Nombre del cliente
•	Atención: Persona de contacto específica
•	Responsable de la obra: Persona encargada del proyecto
•	Descripción de la obra
•	Ubicación específica: Tramo, colonia, calle
•	Fechas relevantes: Solicitud e inicio propuesto
5.8.4 Desglose de Servicios y Conceptos
Tabla Detallada de Conceptos:
•	Número de concepto
•	Descripción completa del servicio
•	Unidad de medida
•	Cantidad solicitada
•	Precio unitario
•	Importe por concepto
Totales Claramente Identificados:
•	Subtotal: Suma de todos los conceptos
•	IVA (16%): Impuesto aplicable
•	Total General: Cantidad final a pagar
5.8.5 Resumen Ejecutivo por Subáreas
Organización por Categorías:
•	Listado de todas las subáreas por área principal
•	Marcado visual de las subáreas incluidas en el presupuesto
•	Ejemplo: Para PCC, mostrar todas las subáreas disponibles y resaltar las seleccionadas
Beneficios de esta Sección:
•	Claridad para el cliente sobre los servicios incluidos
•	Identificación rápida de servicios no contemplados
•	Base para futuras ampliaciones del contrato
5.8.6 Términos Comerciales y Legales
Condiciones de Pago:
•	Forma de pago seleccionada
•	Términos específicos de pago
Términos y Condiciones Generales:
•	Condiciones de prestación del servicio
•	Responsabilidades de cada parte
•	Garantías ofrecidas
•	Políticas de cancelación
5.8.7 Cláusula Legal de Aceptación
Texto Legal Requerido: "La firma de este documento por parte del cliente implica la aceptación total de los términos y condiciones aquí establecidos, así como la autorización para la ejecución de los servicios descritos, constituyendo este presupuesto un acuerdo vinculante entre las partes."
5.8.8 Sección de Firmas
Firma del Laboratorio:
•	Espacio designado para la firma
•	Nombre: (aun por ver)
•	Cargo: (aun por ver)
Firma del Cliente:
•	Espacio amplio para la firma
•	Línea para nombre completo
•	Línea para cargo (si es empresa)
•	Línea para fecha de firma
6. MÓDULO DE PROGRAMACIÓN
Propósito
Gestionar de manera integral la planificación, asignación y seguimiento de actividades de campo para brigadistas, permitiendo la programación eficiente de la recolección de muestras y el control del progreso de las obras aprobadas.
6.1 Vista Principal del Módulo - Panel de Control de Programación
Dashboard de Programación Semanal
El panel principal estará organizado por semanas, proporcionando una vista cronológica y operativa del estado de las programaciones.
Características del Panel:
•	Vista semanal con navegación entre semanas (anterior/siguiente)
•	Resumen ejecutivo por semana actual
•	Indicadores de rendimiento y estadísticas operativas
Información por Semana:
•	Programaciones Totales: Número total de actividades programadas para la semana
•	Programaciones Completadas: Muestras recolectadas exitosamente
•	Programaciones Pendientes: Actividades aún no ejecutadas
•	Programaciones Canceladas: Actividades canceladas con motivo
•	Rendimiento Semanal: Porcentaje de cumplimiento (Completadas/Totales)
•	Brigadistas Activos: Número de brigadistas con asignaciones
•	Vehículos en Uso: Equipos de transporte asignados
Visualización de Datos:
•	Gráfica de Barras: Progreso diario de la semana
•	Indicadores Visuales: Semáforos de estado (Verde: Completado, Amarillo: En proceso, Rojo: Pendiente/Retrasado)
•	Mapa de Calor: Distribución de actividades por día de la semana
•	Alertas Automáticas: Notificaciones para programaciones vencidas o conflictos
6.2 Listado de Programaciones
Características del Listado
Vista Tabular Responsiva con información esencial:
•	Clave de obra
•	Fecha programada
•	Actividad a realizar
•	Brigadista asignado
•	Estado actual (Programada, En proceso, Completada, Cancelada)
•	Cantidad de muestras previstas vs obtenidas
•	Ubicación de la obra
Funcionalidades de Filtrado y Búsqueda:
•	Filtros por fecha (día, semana, mes)
•	Filtros por brigadista
•	Filtros por estado de programación
•	Filtros por tipo de actividad
•	Búsqueda por clave de obra o cliente
•	Ordenamiento por columnas
6.3 Formulario de Creación de Programación
El formulario estará vinculado directamente con los presupuestos aprobados, garantizando la trazabilidad completa del proceso.
SECCIÓN 1: SELECCIÓN DE OBRA BASE
Vinculación con Presupuestos Aprobados:
•	Lista desplegable de obras con presupuestos en estado "Aprobado"
•	Búsqueda inteligente por clave de obra o nombre del cliente
•	Vista previa de información de la obra seleccionada
Información Auto-completada desde el Presupuesto:
•	Clave de obra (no modificable)
•	Nombre del cliente
•	Ubicación de la obra (Tramo, colonia, calle)
•	Contratista
•	Descripción de la obra
•	Conceptos aprobados en el presupuesto
SECCIÓN 2: DATOS DE PROGRAMACIÓN
Información Temporal:
•	Fecha de programación: Campo de fecha (por defecto: día siguiente)
•	Hora programada: Campo de tiempo con incrementos de 30 minutos
•	Tipo de programación: • Obra por Visita: Contratación específica por actividad • Obra por Estancia: Contratación continua (semanal/mensual/anual)
Información de Contacto:
•	Nombre del residente: Campo editable (pre-cargado del presupuesto si existe)
•	Teléfono del residente: Campo numérico con validación
•	Observaciones iniciales: Campo de texto libre
SECCIÓN 3: DEFINICIÓN DE ACTIVIDADES
Selección de Actividad:
•	Lista desplegable basada en los conceptos aprobados del presupuesto
•	Descripción detallada de la actividad seleccionada
•	Unidad de medida asociada
Configuración de Muestras:
•	Cantidad de muestras: Número de muestras a recolectar
•	Tipo de recolección: • m² (metros cuadrados) • m³ (metros cúbicos) • m lineal (metros lineales) • Sondeo • Pza (piezas) • Condensación
•	Distribución de muestras: Opción para especificar si será en una sola toma o múltiples proyecciones
SECCIÓN 4: ASIGNACIÓN DE RECURSOS
Asignación de Personal:
•	Brigadista principal: Lista desplegable de brigadistas disponibles
•	Brigadista de apoyo: Campo opcional para segundo brigadista
•	Validación de disponibilidad por fecha y hora
Asignación de Equipos:
•	Vehículo asignado: Selección de vehículos disponibles
•	Clave del equipo: Identificador único del equipo de trabajo a utilizar
•	Herramientas especiales: Lista de equipos adicionales requeridos (opcional)
SECCIÓN 5: OBSERVACIONES Y NOTAS
•	Observaciones de programación: Campo de texto amplio para notas especiales
•	Instrucciones para el brigadista: Información específica sobre la actividad
•	Condiciones especiales: Requisitos particulares del cliente o la obra
6.4 Estados y Flujo de Trabajo de Programación
Estados de la Programación:
1.	Programada: Actividad creada y asignada, pendiente de ejecución
2.	En Proceso: Brigadista ha iniciado la actividad en campo
3.	Completada: Muestras recolectadas exitosamente y registradas
4.	Cancelada: Actividad cancelada por motivos justificados
5.	Reprogramada: Actividad movida a nueva fecha/hora
Transiciones de Estado y Reglas de Negocio:
•	Programada → En Proceso: Solo el brigadista asignado puede cambiar el estado
•	En Proceso → Completada: Requiere registro de muestras obtenidas
•	Cualquier estado → Cancelada: Requiere justificación obligatoria
•	Cualquier estado → Reprogramada: Genera nueva programación con historial
6.5 Interfaz del Brigadista
Dashboard Personal del Brigadista
Vista Personalizada que incluye:
•	Mis Actividades del Día: Lista de programaciones asignadas para la fecha actual
•	Próximas Actividades: Programaciones de los siguientes días
•	Historial Reciente: Últimas actividades completadas
•	Estadísticas Personales: Rendimiento individual y metas
Funcionalidades del Brigadista
Visualización de Asignaciones:
•	Detalles completos de cada programación asignada
•	Información de contacto del residente
•	Ubicación con posible integración de mapas
•	Instrucciones específicas y observaciones
Registro de Actividades en Campo:
•	Inicio de Actividad: Marcar inicio con timestamp automático
•	Registro de Muestras Obtenidas: • Cantidad real recolectada • Descripción detallada de cada muestra • Tipo de actividad ejecutada • Condiciones encontradas en campo
•	Finalización de Actividad: Marcar completado con resumen final
Reportes de Campo:
•	Incidencias: Reporte de problemas o situaciones especiales
•	Variaciones: Diferencias entre lo programado y lo ejecutado
•	Fotografías: Opción para adjuntar evidencia fotográfica (si el sistema lo permite)
6.6 Sistema de Seguimiento y Control
Trazabilidad de Actividades
Historial Completo:
•	Registro de creación de programación
•	Cambios de estado con timestamps
•	Usuario responsable de cada modificación
•	Motivos de cancelaciones o reprogramaciones
Indicadores de Rendimiento:
•	Tiempo promedio de ejecución por tipo de actividad
•	Porcentaje de cumplimiento por brigadista
•	Eficiencia en la recolección de muestras
•	Índice de reprogramaciones
Reportes y Estadísticas
Reportes Disponibles:
•	Reporte Semanal: Resumen de actividades por semana
•	Reporte por Brigadista: Rendimiento individual detallado
•	Reporte por Obra: Progreso de actividades por proyecto
•	Reporte de Eficiencia: Análisis de tiempos y recursos utilizados
6.7 Integración con Otros Módulos
Conexión con Presupuestos:
•	Sincronización automática con presupuestos aprobados
•	Actualización de estado en el presupuesto cuando se inicia la programación
•	Validación de que solo obras aprobadas puedan ser programadas
Preparación para Módulos Siguientes:
•	Trabajo de Campo: Los datos de programación alimentan directamente el módulo de trabajo de campo
•	Toma de Muestras: Las muestras programadas se convierten en registros de toma de muestras
•	Recepción en Laboratorio: Las muestras completadas se preparan para recepción
6.8 Validaciones y Reglas de Negocio
Validaciones del Sistema:
•	Disponibilidad de Recursos: Verificar que brigadistas y vehículos no tengan conflictos de horario
•	Coherencia de Datos: Validar que las actividades correspondan a los conceptos aprobados
•	Límites Operativos: Controlar que no se excedan las capacidades diarias del laboratorio
Reglas de Negocio Específicas:
•	Un brigadista no puede tener más de 3 actividades simultáneas
•	Las programaciones deben crearse con al menos 24 horas de anticipación
•	Las reprogramaciones requieren notificación automática al cliente
•	Los vehículos deben tener mantenimiento al día para ser asignados
6.9 Notificaciones y Alertas
Sistema de Notificaciones Automáticas:
•	Para Brigadistas: Recordatorios de actividades próximas (24h, 2h antes)
•	Para Supervisores: Alertas de actividades vencidas o problemas en campo
•	Para Clientes: Confirmación de programación y cambios (opcional)
Escalamiento de Alertas:
•	Actividades no iniciadas 1 hora después de la hora programada
•	Programaciones sin completar al final del día
•	Recursos sobrecargados o conflictos de asignación
7. MÓDULOS FUTUROS
7.1 Estado Actual
Los siguientes módulos están en proceso de definición y sus requerimientos específicos se concretarán en fases posteriores del proyecto:
Módulos Pendientes:
1.	Trabajo de Campo(anidado a la programacion)
2.	Toma de Muestras
3.	Recepción en Laboratorio
4.	Ensayos de Laboratorio
5.	Generación de Informes
7.2 Consideraciones para el Desarrollo
•	Integración fluida: Cada módulo debe conectarse perfectamente con el anterior y siguiente
•	Trazabilidad completa: Mantener el historial completo del proyecto
•	Flexibilidad: Permitir adaptaciones futuras según necesidades del laboratorio
•	Escalabilidad: Diseño que soporte crecimiento del volumen de trabajo
8. CONSIDERACIONES TÉCNICAS ADICIONALES
8.1 Seguridad y Acceso
•	Autenticación de usuarios robusta
•	Roles y permisos diferenciados
•	Audit trail completo de todas las acciones
•	Backup automático de información


