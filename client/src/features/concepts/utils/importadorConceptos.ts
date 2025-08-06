import { areasJerarquicasService } from "../services/areasJerarquicasService";
import { conceptosJerarquicosService } from "../services/conceptosJerarquicosService";

interface ConceptoImportacion {
  codigo: string;
  descripcion: string;
  tipo?: string;
  porcentaje?: number;
  precio?: number;
  unidad?: string;
}

interface AreaImportacion {
  codigo: string;
  nombre: string;
  nivel: number;
  conceptos?: ConceptoImportacion[];
  hijos?: AreaImportacion[];
}

export class ImportadorConceptos {
  private static lineasTextoOriginal: string[] = [];
  
  /**
   * Procesa texto pegado y lo convierte en estructura jerárquica
   */
  static procesarTextoPegado(texto: string): AreaImportacion[] {
    // Primero, reconstruir líneas que se rompieron por descripciones multi-línea
    const lineasRaw = texto.split('\n');
    const lineasLimpias: string[] = [];
    
    let lineaActual = '';
    for (const linea of lineasRaw) {
      const lineaLimpia = linea.trim();
      if (!lineaLimpia) continue;
      
      // Si la línea empieza con un código (número.número), es una nueva línea
      const empiezaConCodigo = /^\d+(\.\d+)*(\s*\(\+\))?\s/.test(lineaLimpia);
      
      // Si la línea es solo "INCLUYE:" o empieza con "INCLUYE:", es continuación
      const esLineaIncluye = /^(INCLUYE:|Se incluye:|incluye:)/i.test(lineaLimpia);
      
      // Si la línea empieza con guión o asterisco, es una lista (continuación)
      const esLineaLista = /^[-*•]\s/.test(lineaLimpia);
      
      // Si la línea no empieza con código y no es claramente una nueva sección, es continuación
      const esLineaContinuacion = !empiezaConCodigo && (
        esLineaIncluye ||
        esLineaLista ||
        lineaLimpia.startsWith('(') ||  // Métodos como "(Método no acreditado)"
        lineaLimpia.includes('determinación') ||
        lineaLimpia.includes('análisis') ||
        lineaLimpia.includes('reporte') ||
        lineaLimpia.includes('laboratorio') ||
        lineaLimpia.includes('horario') ||
        lineaLimpia.includes('Personal y equipo') ||
        lineaLimpia.includes('Informe de resultados') ||
        lineaLimpia.includes('granulométrico') ||
        lineaLimpia.includes('volumétrica') ||
        lineaLimpia.includes('Método acreditado') ||
        lineaLimpia.includes('Método no acreditado') ||
        /^[a-z]/.test(lineaLimpia) || // Empieza con minúscula (continuación)
        lineaLimpia.length < 50 // Líneas más cortas probablemente son continuación
      );
      
      if (empiezaConCodigo && lineaActual) {
        // Guardar la línea anterior y empezar una nueva
        lineasLimpias.push(lineaActual);
        lineaActual = lineaLimpia;
      } else if (empiezaConCodigo) {
        // Primera línea con código
        lineaActual = lineaLimpia;
      } else if (lineaActual && esLineaContinuacion) {
        // Continuar la línea anterior (descripción multi-línea)
        lineaActual += ' ' + lineaLimpia;
      } else if (lineaActual) {
        // Línea independiente que podría ser un área
        lineasLimpias.push(lineaActual);
        lineaActual = lineaLimpia;
      } else {
        // Primera línea sin código
        lineaActual = lineaLimpia;
      }
    }
    
    // No olvidar la última línea
    if (lineaActual) {
      lineasLimpias.push(lineaActual);
    }
    
    // Guardar las líneas para búsqueda de nombres
    this.lineasTextoOriginal = lineasLimpias;
    
    console.log('📋 Líneas reconstruidas:', lineasLimpias.length);
    console.log('🔍 Primeras 3 líneas:', lineasLimpias.slice(0, 3));
    
    const estructura: AreaImportacion[] = [];
    const pilaAreas: AreaImportacion[] = [];
    const areasCreadas = new Map<string, AreaImportacion>(); // Mapa de áreas ya creadas

    for (const linea of lineasLimpias) {
      console.log('🔍 Procesando línea completa:', linea.substring(0, 100) + '...');

      // Detectar si es área o concepto
      if (this.esArea(linea)) {
        const area = this.parsearArea(linea);
        console.log('📁 Área detectada:', area);
        this.insertarArea(area, estructura, pilaAreas);
        areasCreadas.set(area.codigo, area);
      } else if (this.esConcepto(linea)) {
        const concepto = this.parsearConcepto(linea);
        console.log('📄 Concepto detectado:', concepto);
        
        // Verificar si necesitamos crear áreas padre faltantes
        this.crearAreaspadresFaltantes(concepto.codigo, estructura, pilaAreas, areasCreadas);
        
        this.agregarConceptoAArea(concepto, pilaAreas);
      } else {
        console.log('⚠️ Línea no reconocida como área ni concepto:', linea.substring(0, 50) + '...');
      }
    }

    console.log('🏗️ Estructura final generada:', estructura);
    return estructura;
  }

  /**
   * Crea áreas padre faltantes para un concepto basándose en su código
   */
  private static crearAreaspadresFaltantes(
    codigoConcepto: string, 
    estructura: AreaImportacion[], 
    pilaAreas: AreaImportacion[], 
    areasCreadas: Map<string, AreaImportacion>
  ) {
    // Extraer las partes del código (ej: "1.1.17" -> necesita áreas "1" y "1.1")
    const partescodigo = codigoConcepto.split('.');
    const codigosPadre: string[] = [];
    
    // IMPORTANTE: Empezar desde i=0 para crear TODAS las áreas padre necesarias
    for (let i = 1; i < partescodigo.length; i++) {
      const codigoPadre = partescodigo.slice(0, i).join('.');
      codigosPadre.push(codigoPadre);
    }
    
    console.log(`🔧 Verificando áreas padre para concepto ${codigoConcepto}:`, codigosPadre);
    
    // Crear cada área padre que no exista
    for (const codigoPadre of codigosPadre) {
      if (!areasCreadas.has(codigoPadre)) {
        console.log(`📁 Creando área padre faltante: ${codigoPadre}`);
        
        const areaPadre: AreaImportacion = {
          codigo: codigoPadre,
          nombre: this.buscarNombreAreaEnTexto(codigoPadre) || this.generarNombreAreaAutomatica(codigoPadre),
          nivel: (codigoPadre.match(/\./g) || []).length + 1,
          conceptos: [],
          hijos: []
        };
        
        this.insertarArea(areaPadre, estructura, pilaAreas);
        areasCreadas.set(codigoPadre, areaPadre);
      }
    }
    
    // Asegurar que la pila esté en el estado correcto para el concepto
    // El concepto debe ir en el área padre inmediato
    const codigoPadreConcepto = partescodigo.slice(0, -1).join('.');
    if (codigoPadreConcepto && areasCreadas.has(codigoPadreConcepto)) {
      const areaPadre = areasCreadas.get(codigoPadreConcepto)!;
      
      // Ajustar la pila para que el área padre esté en el tope
      while (pilaAreas.length > 0 && pilaAreas[pilaAreas.length - 1].codigo !== codigoPadreConcepto) {
        pilaAreas.pop();
      }
      
      // Si el área padre no está en la pila, añadirla
      if (pilaAreas.length === 0 || pilaAreas[pilaAreas.length - 1].codigo !== codigoPadreConcepto) {
        // Reconstruir la pila hasta el área padre
        const nivelesNecesarios = areaPadre.nivel;
        pilaAreas.length = 0; // Limpiar pila
        
        // Añadir todas las áreas desde la raíz hasta el padre
        let codigoActual = '';
        const partesCompletas = codigoPadreConcepto.split('.');
        for (let i = 0; i < partesCompletas.length; i++) {
          codigoActual = partesCompletas.slice(0, i + 1).join('.');
          if (areasCreadas.has(codigoActual)) {
            pilaAreas.push(areasCreadas.get(codigoActual)!);
          }
        }
      }
    }
  }

  /**
   * Busca el nombre de un área en el texto original basándose en su código
   */
  private static buscarNombreAreaEnTexto(codigo: string): string | null {
    // Buscar en las líneas una que empiece con el código y tenga un nombre
    for (const linea of this.lineasTextoOriginal) {
      const partes = linea.split('\t');
      if (partes.length >= 2) {
        const codigoLinea = partes[0]?.trim();
        const nombreLinea = partes[1]?.trim();
        
        // Si el código coincide exactamente y tiene un nombre válido
        if (codigoLinea === codigo && nombreLinea && 
            !nombreLinea.includes('$') && 
            !nombreLinea.includes('INCLUYE:') &&
            nombreLinea.length < 100 &&
            !/^["']/.test(nombreLinea)) {
          console.log(`✅ Nombre encontrado para área ${codigo}: "${nombreLinea}"`);
          return nombreLinea;
        }
      }
    }
    
    console.log(`⚠️ No se encontró nombre explícito para área ${codigo}, usando nombre automático`);
    return null;
  }

  /**
   * Genera un nombre automático para áreas creadas implícitamente
   */
  private static generarNombreAreaAutomatica(codigo: string): string {
    const nivel = (codigo.match(/\./g) || []).length + 1;
    const nombres = {
      1: 'ÁREA PRINCIPAL',
      2: 'CATEGORÍA',
      3: 'SUBCATEGORÍA'
    };
    
    return nombres[nivel as keyof typeof nombres] || `ÁREA ${codigo}`;
  }
  /**
   * Determina si una línea es un área (solo áreas explícitas con 1-2 niveles)
   */
  private static esArea(linea: string): boolean {
    const partes = linea.split('\t');
    if (partes.length < 2) return false;
    
    const codigo = partes[0]?.trim();
    const nombre = partes[1]?.trim();
    
    // Si empieza con "INCLUYE:" o "Se incluye:" definitivamente NO es área
    if (codigo.startsWith('INCLUYE:') || nombre.startsWith('INCLUYE:') ||
        codigo.startsWith('Se incluye:') || nombre.startsWith('Se incluye:') ||
        codigo.startsWith('incluye:') || nombre.startsWith('incluye:')) return false;
    
    // Verificar que el código sea numérico con puntos
    const codigoValido = /^\d+(\.\d+)*$/.test(codigo);
    
    // Contar niveles en el código (puntos + 1)
    const niveles = (codigo?.match(/\./g) || []).length + 1;
    
    // Solo áreas explícitas con 1-2 niveles (como "2", "2.1")
    // Los conceptos siempre tienen 3+ niveles
    const esNivelArea = niveles <= 2;
    
    // Verificar que el nombre sea texto sin indicadores de concepto
    const nombreValido = nombre && 
                        nombre.length > 0 && 
                        !nombre.includes('$') &&
                        !nombre.includes('INCLUYE:') &&
                        !nombre.includes('Se incluye:') &&
                        !nombre.includes('incluye:') &&
                        nombre.length < 100 && // Áreas tienen nombres cortos
                        !/^["']/.test(nombre); // No empieza con comillas
    
    const esArea = codigoValido && esNivelArea && !!nombreValido;
    console.log(`🔍 Verificando si es área: "${codigo}" (${niveles} niveles) + "${nombre}" = ${esArea}`);
    
    return esArea;
  }

  /**
   * Determina si una línea es un concepto
   */
  private static esConcepto(linea: string): boolean {
    const partes = linea.split('\t');
    if (partes.length < 2) return false;
    
    const codigo = partes[0]?.trim();
    const descripcion = partes[1]?.trim();
    
    // Si la línea empieza solo con "INCLUYE:" sin código, NO es concepto
    if (codigo.startsWith('INCLUYE:') || !codigo) return false;
    
    // Verificar que tenga un código válido 
    const codigoMatch = codigo?.match(/^(\d+(\.\d+)*)/);
    if (!codigoMatch) return false;
    
    const codigoLimpio = codigoMatch[1];
    const niveles = (codigoLimpio.match(/\./g) || []).length + 1;
    
    // Criterios para identificar conceptos:
    
    // 1. Tiene 3+ niveles de código (como 1.1.17, 2.1.1.1) - AUTOMÁTICAMENTE es concepto
    const esNivelConcepto = niveles >= 3;
    
    // 2. Tiene indicadores explícitos de concepto
    const tieneIndicadores = linea.includes('(+)') || 
                           linea.includes('$') || 
                           linea.includes('PRUEBA') || 
                           linea.includes('ENSAYE') || 
                           linea.includes('VISITA') ||
                           linea.includes('MUESTRA') ||
                           linea.includes('POZO') ||
                           linea.includes('CÁRCAMO') ||
                           linea.includes('ESTACIÓN') ||
                           linea.includes('ESTUDIO') ||
                           (linea.includes('INCLUYE:') && !!codigo.match(/^\d+(\.\d+)*/)) || // Solo si tiene código válido
                           (linea.includes('Se incluye:') && !!codigo.match(/^\d+(\.\d+)*/)) || // Variante de "Se incluye"
                           (linea.includes('incluye:') && !!codigo.match(/^\d+(\.\d+)*/)) || // Variante minúscula
                           /^["']/.test(descripcion); // Empieza con comillas

    // 3. Tiene descripción detallada (más de 50 caracteres sugiere concepto detallado)
    const tieneDescripcionDetallada = descripcion && descripcion.length > 50;
    
    // 4. Contiene palabras técnicas específicas
    const tienePalabrasTecnicas = descripcion && (
      descripcion.includes('PROFUNDIDAD') ||
      descripcion.includes('DIÁMETRO') ||
      descripcion.includes('COMPACTACIÓN') ||
      descripcion.includes('EXCAVACIÓN') ||
      descripcion.includes('MUESTREO') ||
      descripcion.includes('PERFORACIÓN') ||
      descripcion.includes('TRASLADO') ||
      descripcion.includes('DESGASTE') ||
      descripcion.includes('AGREGADO') ||
      descripcion.includes('CONCRETO') ||
      descripcion.includes('HIDRÁULICO') ||
      descripcion.includes('GRANULOMÉTRICO') ||
      descripcion.includes('VOLUMÉTRICA') ||
      descripcion.includes('ATTERBERG') ||
      descripcion.includes('DENSIDAD') ||
      descripcion.includes('ABSORCIÓN') ||
      descripcion.includes('COLORIMETRÍA') ||
      descripcion.includes('Personal y equipo') ||
      descripcion.includes('Informe de resultados') ||
      descripcion.includes('Método acreditado') ||
      descripcion.includes('Método no acreditado')
    );    // REGLA PRINCIPAL: 3+ niveles SIEMPRE es concepto
    // REGLA SECUNDARIA: 2 niveles + indicadores/descripción detallada también es concepto
    const esConcepto = esNivelConcepto || 
                      (niveles >= 2 && (tieneIndicadores || tieneDescripcionDetallada || !!tienePalabrasTecnicas));
    
    console.log(`📄 Verificando si es concepto: "${codigo}" (${niveles} niveles) automático=${esNivelConcepto} indicadores=${tieneIndicadores} = ${esConcepto}`);
    
    return esConcepto;
  }

  /**
   * Parsea una línea de área
   */
  private static parsearArea(linea: string): AreaImportacion {
    const partes = linea.split('\t').filter(p => p.trim());
    const codigo = partes[0]?.trim() || '';
    const nombre = partes[1]?.trim() || '';
    
    const nivel = (codigo.match(/\./g) || []).length + 1;

    return {
      codigo,
      nombre,
      nivel,
      conceptos: [],
      hijos: []
    };
  }

  /**
   * Parsea una línea de concepto
   */
  private static parsearConcepto(linea: string): ConceptoImportacion {
    const partes = linea.split('\t').filter(p => p.trim());
    
    let codigo = '';
    let descripcion = '';
    let tipo = '';
    let porcentaje = 0;
    let precio = 0;

    // Buscar código (primera parte con patrón de números y puntos, con o sin (+))
    if (partes[0]) {
      // Mejorado: busca código con o sin (+) al final
      const codigoMatch = partes[0].match(/^(\d+(?:\.\d+)*)\s*(?:\(\+\))?/);
      if (codigoMatch) {
        codigo = codigoMatch[1];
      }
    }

    // Buscar descripción (puede estar en varias columnas)
    const descripcionPartes = [];
    let unidadDetectada = '';
    
    for (let i = 1; i < partes.length; i++) {
      const parte = partes[i].trim();
      
      // Si es un precio, porcentaje o tipo identificado, no incluir en descripción
      if (parte.match(/\$/) || parte.match(/\d+%/) || parte.match(/#\w+/)) {
        continue;
      }
      
      // Detectar unidades específicas en columnas separadas (lista completa del laboratorio)
      const unidadesValidas = [
        'POZO', 'MUESTRA', 'PRUEBA', 'VISITA', 'ENSAYE', 'CÁRCAMO', 'ESTACIÓN', 'VIAJE', 'ESTUDIO',
        'LOTE', 'MES', 'CÁLCULO', 'DISEÑO', 'ANÁLISIS', 'INFORME', 'SERVICIO', 'JUEGO', 'PERMISO',
        'ESPÉCIMEN', 'PIEZA', 'JORNAL', 'SPOT', 'PROBETA', 'SEMANA', 'DÍA', 'TOPOGRAFÍA', 'HOJA',
        'SERIE', 'ENSAYO', 'm', 'cm', 'mm', 'm²', 'm2', 'm³', 'm3', 'h', 'mL', 'EQ', 'AFORO', 
        'CALCULO', 'PROY', 'RECOMEND', 'REPORTE', 'PZA', 'km',
        // También versiones en minúsculas
        'pozo', 'muestra', 'prueba', 'visita', 'ensaye', 'cárcamo', 'estación', 'viaje', 'estudio',
        'lote', 'mes', 'cálculo', 'diseño', 'análisis', 'informe', 'servicio', 'juego', 'permiso',
        'espécimen', 'pieza', 'jornal', 'spot', 'probeta', 'semana', 'día', 'topografía', 'hoja',
        'serie', 'ensayo', 'pza', 'kg', 'g', 'mg', 's', 'min', 'L'
      ];
      
      if (unidadesValidas.includes(parte)) {
        unidadDetectada = parte;
        continue;
      }
      
      // Si es un tipo identificado, no incluir en descripción pero guardarlo
      const tiposValidos = [
        'VISITA', 'PRUEBA', 'ENSAYE', 'MUESTRA', 'ESTUDIO', 'POZO', 'CÁRCAMO', 'ESTACIÓN',
        'VIAJE', 'LOTE', 'MES', 'CÁLCULO', 'CALCULO', 'DISEÑO', 'ANÁLISIS', 'INFORME', 'SERVICIO',
        'JUEGO', 'PERMISO', 'ESPÉCIMEN', 'PIEZA', 'JORNAL', 'SPOT', 'PROBETA',
        'SEMANA', 'DÍA', 'TOPOGRAFÍA', 'HOJA', 'SERIE', 'ENSAYO', 'PROY', 'RECOMEND', 'REPORTE', 'PZA'
      ];
      
      if (tiposValidos.some(t => parte.includes(t))) {
        if (!tipo) tipo = parte.trim(); // Mantener en mayúscula como aparece en el texto
        continue;
      }
      
      // Agregar a descripción
      if (parte) {
        descripcionPartes.push(parte);
      }
    }
    
    // Unir todas las partes de la descripción
    descripcion = descripcionPartes.join(' ').replace(/^"/, '').replace(/"$/, '').trim();

    // Si no encontró descripción, buscar en la segunda columna directamente
    if (!descripcion && partes[1]) {
      descripcion = partes[1].replace(/^"/, '').replace(/"$/, '').trim();
    }

    // Buscar tipo (VISITA, PRUEBA, etc.) - búsqueda adicional si no se encontró antes
    if (!tipo) {
      for (const parte of partes) {
        if (['VISITA', 'PRUEBA', 'ENSAYE', 'MUESTRA', 'ESTUDIO', 'POZO', 'CÁRCAMO', 'ESTACIÓN',
             'VIAJE', 'LOTE', 'MES', 'CÁLCULO', 'DISEÑO', 'ANÁLISIS', 'INFORME', 'SERVICIO',
             'JUEGO', 'PERMISO', 'ESPÉCIMEN', 'PIEZA', 'JORNAL', 'SPOT', 'PROBETA',
             'SEMANA', 'DÍA', 'TOPOGRAFÍA', 'HOJA', 'SERIE', 'ENSAYO'].some(t => parte.includes(t))) {
          tipo = parte.trim();
          break;
        }
      }
    }

    // Buscar porcentaje
    for (const parte of partes) {
      const porcentajeMatch = parte.match(/(\d+)%/);
      if (porcentajeMatch) {
        porcentaje = parseInt(porcentajeMatch[1]);
        break;
      }
    }

    // Buscar precio
    for (const parte of partes) {
      const precioMatch = parte.match(/\$\s*([\d,]+\.?\d*)/);
      if (precioMatch) {
        precio = parseFloat(precioMatch[1].replace(/,/g, ''));
        break;
      }
    }

    const concepto = {
      codigo,
      descripcion,
      tipo,
      porcentaje,
      precio,
      unidad: unidadDetectada || this.determinarUnidad(tipo, descripcion)
    };
    
    console.log(`📋 Concepto parseado:`, concepto);
    return concepto;
  }

  /**
   * Determina la unidad basada en el tipo y descripción (lista exacta del laboratorio)
   */
  private static determinarUnidad(tipo: string, descripcion: string): string {
    // Lista exacta de unidades del laboratorio
    const unidadesValidas = [
      'POZO', 'MUESTRA', 'PRUEBA', 'VISITA', 'ENSAYE', 'CÁRCAMO', 'ESTACIÓN', 'VIAJE', 'ESTUDIO',
      'LOTE', 'MES', 'CÁLCULO', 'DISEÑO', 'ANÁLISIS', 'INFORME', 'SERVICIO', 'JUEGO', 'PERMISO',
      'ESPÉCIMEN', 'PIEZA', 'JORNAL', 'SPOT', 'PROBETA', 'SEMANA', 'DÍA', 'TOPOGRAFÍA', 'HOJA',
      'SERIE', 'ENSAYO', 'm', 'cm', 'mm', 'm²', 'm2', 'm³', 'm3', 'h', 'mL', 'EQ', 'AFORO', 
      'CALCULO', 'PROY', 'RECOMEND', 'REPORTE', 'PZA', 'km'
    ];

    // Si el tipo ya es una unidad válida, usarla directamente
    if (tipo && unidadesValidas.includes(tipo.toUpperCase())) {
      return tipo.toUpperCase();
    }

    // Mapeo específico para tipos conocidos
    const mapeoTipos: { [key: string]: string } = {
      'VISITA': 'VISITA',
      'PRUEBA': 'PRUEBA', 
      'MUESTRA': 'MUESTRA',
      'POZO': 'POZO',
      'CÁRCAMO': 'CÁRCAMO',
      'ESTACIÓN': 'ESTACIÓN',
      'ENSAYE': 'ENSAYE',
      'VIAJE': 'VIAJE',
      'LOTE': 'LOTE',
      'MES': 'MES',
      'CÁLCULO': 'CÁLCULO',
      'CALCULO': 'CALCULO',
      'DISEÑO': 'DISEÑO',
      'ANÁLISIS': 'ANÁLISIS',
      'INFORME': 'INFORME',
      'ESTUDIO': 'ESTUDIO',
      'SERVICIO': 'SERVICIO',
      'JUEGO': 'JUEGO',
      'PERMISO': 'PERMISO',
      'ESPÉCIMEN': 'ESPÉCIMEN',
      'PIEZA': 'PIEZA',
      'JORNAL': 'JORNAL',
      'SPOT': 'SPOT',
      'PROBETA': 'PROBETA',
      'SEMANA': 'SEMANA',
      'DÍA': 'DÍA',
      'TOPOGRAFÍA': 'TOPOGRAFÍA',
      'HOJA': 'HOJA',
      'SERIE': 'SERIE',
      'ENSAYO': 'ENSAYO',
      'PROY': 'PROY',
      'RECOMEND': 'RECOMEND',
      'REPORTE': 'REPORTE',
      'PZA': 'PZA'
    };

    // Buscar en el mapeo
    if (tipo && mapeoTipos[tipo.toUpperCase()]) {
      return mapeoTipos[tipo.toUpperCase()];
    }

    // Unidades físicas básicas
    if (descripcion?.includes('metro cúbico') || descripcion?.includes('m³') || descripcion?.includes('m3')) return 'm3';
    if (descripcion?.includes('metro cuadrado') || descripcion?.includes('m²') || descripcion?.includes('m2')) return 'm2';
    if (descripcion?.includes('centímetro') || descripcion?.includes('cm')) return 'cm';
    if (descripcion?.includes('mililitro') || descripcion?.includes('mL')) return 'mL';
    if (descripcion?.includes('kilómetro') || descripcion?.includes('km')) return 'km';
    if (descripcion?.includes('metro') || descripcion?.includes(' m ')) return 'm';
    if (descripcion?.includes('hora') || descripcion?.includes(' h ')) return 'h';

    // Unidad por defecto
    return 'SERVICIO';
  }

  /**
   * Inserta un área en la estructura jerárquica
   */
  private static insertarArea(area: AreaImportacion, estructura: AreaImportacion[], pila: AreaImportacion[]) {
    // Ajustar la pila según el nivel
    while (pila.length >= area.nivel) {
      pila.pop();
    }

    if (pila.length === 0) {
      // Es área raíz
      estructura.push(area);
    } else {
      // Es subárea
      const padre = pila[pila.length - 1];
      if (!padre.hijos) padre.hijos = [];
      padre.hijos.push(area);
    }

    pila.push(area);
  }

  /**
   * Agrega un concepto al área más reciente en la pila
   */
  private static agregarConceptoAArea(concepto: ConceptoImportacion, pila: AreaImportacion[]) {
    if (pila.length > 0) {
      const areaActual = pila[pila.length - 1];
      if (!areaActual.conceptos) areaActual.conceptos = [];
      areaActual.conceptos.push(concepto);
    }
  }

  /**
   * Guarda la estructura en la base de datos
   */
  static async guardarEstructura(estructura: AreaImportacion[]): Promise<void> {
    try {
      console.log('🚀 Iniciando guardado de estructura:', estructura.length, 'áreas principales');
      
      // Obtener áreas existentes
      const areasExistentes = await areasJerarquicasService.obtenerLista();
      const mapaAreasExistentes = new Map<string, number>();
      
      // Crear mapa de áreas existentes por código
      areasExistentes.forEach(area => {
        mapaAreasExistentes.set(area.codigo, area.id);
      });

      // Obtener conceptos existentes para evitar duplicados
      const conceptosExistentes = await conceptosJerarquicosService.obtenerLista();
      const codigosConceptosExistentes = new Set(conceptosExistentes.map(c => c.codigo));
      
      for (const area of estructura) {
        try {
          await this.guardarAreaRecursiva(area, null, mapaAreasExistentes, codigosConceptosExistentes);
        } catch (error) {
          console.error(`❌ Error guardando área ${area.codigo}:`, error);
          // Continuar con las siguientes áreas aunque una falle
        }
      }
      
      console.log('✅ Estructura guardada exitosamente');
    } catch (error) {
      console.error('❌ Error general en guardarEstructura:', error);
      throw error;
    }
  }

  /**
   * Guarda un área y sus hijos recursivamente
   */
  private static async guardarAreaRecursiva(
    area: AreaImportacion, 
    padreId: number | null, 
    areasExistentes: Map<string, number>,
    conceptosExistentes: Set<string>
  ): Promise<number> {
    let areaId: number;
    
    try {
      // Verificar si el área ya existe
      if (areasExistentes.has(area.codigo)) {
        areaId = areasExistentes.get(area.codigo)!;
        console.log(`✅ Área existente encontrada: ${area.codigo} - ${area.nombre}`);
      } else {
        // Crear el área solo si no existe
        console.log(`📝 Creando nueva área: ${area.codigo} - ${area.nombre}`);
        
        // Validar datos del área antes de crear
        if (!area.codigo || !area.nombre) {
          throw new Error(`Datos de área incompletos: código="${area.codigo}", nombre="${area.nombre}"`);
        }
        
        const areaCreada = await areasJerarquicasService.crear({
          codigo: area.codigo,
          nombre: area.nombre,
          padreId,
          nivel: area.nivel
        });
        areaId = areaCreada.id;
        areasExistentes.set(area.codigo, areaId);
      }

      // Crear los conceptos de esta área (solo los que no existen)
      if (area.conceptos && area.conceptos.length > 0) {
        console.log(`📋 Procesando ${area.conceptos.length} conceptos para área ${area.codigo}`);
        
        for (const concepto of area.conceptos) {
          try {
            if (conceptosExistentes.has(concepto.codigo)) {
              console.log(`✅ Concepto existente encontrado: ${concepto.codigo} - ${concepto.descripcion.substring(0, 50)}...`);
              continue;
            }
            
            // Validar datos del concepto antes de crear
            if (!concepto.codigo || !concepto.descripcion) {
              console.warn(`⚠️ Concepto con datos incompletos: código="${concepto.codigo}", descripción="${concepto.descripcion}"`);
              continue;
            }
            
            console.log(`📝 Creando nuevo concepto: ${concepto.codigo} - ${concepto.descripcion.substring(0, 50)}...`);
            await conceptosJerarquicosService.crear({
              codigo: concepto.codigo,
              descripcion: concepto.descripcion,
              unidad: concepto.unidad || 'servicio',
              precioUnitario: concepto.precio?.toString() || '0',
              areaId: areaId
            });
            conceptosExistentes.add(concepto.codigo);
          } catch (error) {
            console.error(`❌ Error creando concepto ${concepto.codigo}:`, error);
            // Continuar con los siguientes conceptos aunque uno falle
          }
        }
      }

      // Crear las subareas recursivamente
      if (area.hijos && area.hijos.length > 0) {
        console.log(`📁 Procesando ${area.hijos.length} subareas para área ${area.codigo}`);
        
        for (const hijo of area.hijos) {
          try {
            await this.guardarAreaRecursiva(hijo, areaId, areasExistentes, conceptosExistentes);
          } catch (error) {
            console.error(`❌ Error guardando subarea ${hijo.codigo}:`, error);
            // Continuar con las siguientes subareas aunque una falle
          }
        }
      }

      return areaId;
    } catch (error) {
      console.error(`❌ Error en guardarAreaRecursiva para área ${area.codigo}:`, error);
      throw error;
    }
  }

  /**
   * Función de demostración con los datos que proporcionaste
   */
  static async importarDatosDemostracion(): Promise<void> {
    const datosDemo = `2	CONTROL DE CALIDAD
2.1	TERRACERÍAS
2.1.1	TRABAJOS DE CAMPO
2.1.1.1 (+)	"VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR (CALAS) Y GRADO DE COMPACTACIÓN. INCLUYE: determinación del contenido de agua en laboratorio, análisis y reporte, con un máximo de 5 ensayes (calas) y traslados. No incluye determinación de masa volumétrica seca máxima. Horario diurno de 8:00 a 17:00 h. (Método acreditado)"	VISITA	3%	$1,231.53
2.1.1.2 (+)	ENSAYE ADICIONAL PARA LA DETERMINACIÓN DEL GRADO DE COMPACTACIÓN (LA MASA VOLUMÉTRICA SECA DEL LUGAR) (CALAS). INCLUYE: determinación del contenido de agua (humedad) en laboratorio, análisis y reporte. con una permanencia máxima de una hora. no incluye la determinación de la masa volumétrica seca máxima. (Método acreditado)	PRUEBA	59%	$183.77
2.1.1.3 (+)	"VISITA A OBRA O BANCOS DE PRÉSTAMO DE MATERIALES PARA RECOLECCIÓN DE MUESTREO, EN HORARIO DIURNO DE 8:00 A 17:00 h. INCLUYE: Muestreo, traslado de 30 minutos o 10 km como máximo, en horario de 8:00 a 17:00 h. (Método acreditado)"	VISITA	39%	$777.30
2.1.1.4	VISITA PARA ASESORÍA en procedimiento constructivo y/o materiales utilizados en actividades de obra, en horario diurno de 8:00 a 17:00 h.	VISITA	4%	$1,060.02`;

    const estructura = this.procesarTextoPegado(datosDemo);
    await this.guardarEstructura(estructura);
  }
}

export default ImportadorConceptos;
