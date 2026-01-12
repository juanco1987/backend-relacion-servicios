# Arquitectura del Sistema - AAP Web Reportes

## 📐 Visión General

AAP Web Reportes es una aplicación full-stack diseñada con una arquitectura modular y escalable que separa claramente las responsabilidades entre frontend y backend.

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ Components │  │   Hooks    │  │  Services (API)      │  │
│  │  - Layout  │  │ - Analytics│  │  - pdfService        │  │
│  │  - Forms   │  │ - Debounce │  │  - Analytics calls   │  │
│  │  - Charts  │  └────────────┘  └──────────────────────┘  │
│  └────────────┘                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────┐
│                     BACKEND (Flask)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (Routes)                       │  │
│  │  /api/analytics  /api/reports  /api/expenses         │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │           Services Layer (Business Logic)            │  │
│  │  AnalyticsService  │  ReportService                  │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │         Core Layer (Data Processing)                 │  │
│  │  ExcelProcessor  │  PDFGenerator  │  ColumnMapper    │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │            Utils (Cross-cutting Concerns)            │  │
│  │  Validators  │  Decorators  │  TempFileManager       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Capas de la Arquitectura

### 1. Frontend Layer (React)

**Responsabilidad**: Interfaz de usuario y experiencia del usuario

**Componentes Principales**:
- **Pages**: Páginas principales (Dashboard, Analytics)
- **Components**: Componentes reutilizables (KpiCard, CustomButton, Charts)
- **Hooks**: Lógica reutilizable (useAnalyticsData, useDebounce)
- **Services**: Comunicación con API backend
- **Utils**: Utilidades frontend (formatters, validators)

**Optimizaciones**:
- Lazy loading de componentes pesados
- Memoización con React.memo, useMemo, useCallback
- Code splitting automático

### 2. API Layer (Flask Routes)

**Responsabilidad**: Endpoints HTTP y validación de requests

**Módulos**:
- `api/routes/analytics.py`: Endpoints de analytics y KPIs
- `api/routes/reports.py`: Endpoints de generación de reportes
- `api/routes/expenses.py`: Endpoints de gestión de gastos

**Características**:
- Decoradores de validación (`@validate_excel_upload`, `@validate_date_range`)
- Manejo de errores centralizado
- Context managers para archivos temporales

### 3. Services Layer (Business Logic)

**Responsabilidad**: Lógica de negocio y orquestación

**Servicios**:
- **AnalyticsService**: 
  - `get_general_analytics()`: KPIs generales
  - `get_pending_cash_analytics()`: Servicios pendientes en efectivo
  - `get_pending_charges_analytics()`: Servicios pendientes de cobro

- **ReportService**:
  - `generate_services_report()`: Reporte de servicios
  - `generate_pending_report()`: Reporte de pendientes

**Características**:
- Métodos estáticos para facilitar testing
- Procesamiento vectorizado con Pandas
- Separación clara de responsabilidades

### 4. Core Layer (Data Processing)

**Responsabilidad**: Procesamiento de datos y generación de documentos

**Módulos**:
- **ExcelProcessor**: Lectura y filtrado de archivos Excel
  - Vectorización con Pandas para performance
  - Mapeo robusto de columnas
  - Limpieza de datos monetarios

- **PDFGenerator**: Generación de PDFs con ReportLab
  - Templates personalizables
  - Soporte para logos e imágenes
  - Tablas dinámicas

- **ColumnMapper**: Mapeo centralizado de columnas Excel
  - Normalización de nombres
  - Búsqueda flexible de columnas
  - Variantes de nombres

### 5. Utils Layer (Cross-cutting)

**Responsabilidad**: Utilidades y funcionalidades transversales

**Módulos**:
- **TempFileManager**: Manejo seguro de archivos temporales
  - Context managers
  - Limpieza automática
  
- **Validators**: Validación de datos
  - FileValidator: Validación de archivos Excel
  - DateValidator: Validación de rangos de fechas
  
- **Decorators**: Decoradores reutilizables
  - Validación de uploads
  - Extracción de parámetros

## 🔄 Flujo de Datos

### Ejemplo: Generación de Reporte de Servicios

```
1. Usuario sube archivo Excel + selecciona fechas
   ↓
2. Frontend (React)
   - Valida archivo localmente
   - Envía FormData a /api/relacion_servicios
   ↓
3. API Layer (Flask)
   - @validate_excel_upload verifica archivo
   - @validate_date_range valida fechas
   - Pasa a ReportService
   ↓
4. Service Layer
   - ReportService.generate_services_report()
   - Orquesta el procesamiento
   ↓
5. Core Layer
   - ExcelProcessor.extraer_servicios()
     * Lee Excel con Pandas
     * Aplica filtros vectorizados
     * Limpia datos monetarios
   - PDFGenerator.generar_pdf_relacion()
     * Crea PDF con ReportLab
     * Aplica estilos y formato
   ↓
6. Utils Layer
   - TempFileManager maneja archivos temporales
   - Limpieza automática al finalizar
   ↓
7. Response
   - PDF generado se envía al cliente
   - Frontend descarga automáticamente
```

## 🎯 Patrones de Diseño Implementados

### 1. **Separation of Concerns**
Cada capa tiene una responsabilidad única y bien definida.

### 2. **Dependency Injection**
Los servicios reciben dependencias como parámetros, facilitando testing.

### 3. **Context Manager Pattern**
Manejo seguro de recursos con garantía de limpieza.

### 4. **Decorator Pattern**
Validaciones reutilizables sin duplicar código.

### 5. **Service Layer Pattern**
Lógica de negocio separada de la capa de presentación.

### 6. **Repository Pattern** (Implícito)
Servicios abstraen el acceso a datos.

## 🔐 Seguridad

### Validaciones Implementadas

1. **Validación de Archivos**:
   - Tipo de archivo (solo .xlsx, .xls)
   - Tamaño máximo (16MB)
   - Nombre de archivo no vacío

2. **Validación de Fechas**:
   - Formato correcto (YYYY-MM-DD)
   - Rango lógico (inicio < fin)
   - Fechas válidas

3. **Manejo de Archivos Temporales**:
   - Limpieza automática
   - Nombres únicos con mkstemp
   - Permisos restrictivos

### CORS
Configurado para permitir requests desde el frontend en desarrollo y producción.

## 📊 Optimizaciones de Performance

### Backend

1. **Vectorización con Pandas**:
   ```python
   # Antes (lento)
   for _, row in df.iterrows():
       valor = limpiar_valor_monetario(row['VALOR'])
   
   # Después (rápido)
   df['VALOR'] = limpiar_vectorizado(df['VALOR'])
   ```

2. **Filtros Vectorizados**:
   ```python
   # Operaciones en batch
   mask = (df['FORMA_PAGO'] == 'EFECTIVO') & (df['FECHA'].between(inicio, fin))
   df_filtrado = df[mask]
   ```

3. **Context Managers**:
   ```python
   with temporary_excel_file(uploaded_file) as temp_path:
       # Procesamiento
       pass  # Archivo se elimina automáticamente
   ```

### Frontend

1. **Lazy Loading**:
   ```javascript
   const Analytics = lazy(() => import('./Analytics'));
   ```

2. **Memoización**:
   ```javascript
   const MemoizedComponent = React.memo(Component);
   const memoizedValue = useMemo(() => expensiveCalc(), [deps]);
   const memoizedCallback = useCallback(() => {}, [deps]);
   ```

## 🧪 Testing Strategy

### Tests Implementados

1. **Unit Tests**: Funciones individuales
   - `test_analytics_service.py`
   - `test_excel_processor.py`

2. **Integration Tests**: Endpoints completos
   - `test_analytics_endpoint.py`

### Cobertura Objetivo
- Servicios críticos: 80%+
- Procesadores: 70%+
- Endpoints: 60%+

## 📦 Dependencias Principales

### Backend
- **Flask 3.x**: Framework web
- **Pandas 2.x**: Procesamiento de datos
- **ReportLab**: Generación de PDFs
- **Openpyxl**: Lectura de Excel

### Frontend
- **React 18**: UI library
- **Material-UI 7**: Componentes UI
- **Recharts 3**: Gráficos
- **Framer Motion 12**: Animaciones

## 🚀 Escalabilidad

### Consideraciones Futuras

1. **Base de Datos**: Actualmente procesa archivos directamente. Podría agregarse PostgreSQL para persistencia.

2. **Cache**: Redis para cachear resultados de analytics frecuentes.

3. **Queue System**: Celery para procesamiento asíncrono de archivos grandes.

4. **Microservicios**: Separar generación de PDFs en servicio independiente.

## 📝 Convenciones de Código

### Python
- PEP 8 para estilo
- Type hints en funciones públicas
- Docstrings en formato Google

### JavaScript
- ESLint con configuración React
- Componentes funcionales con hooks
- PropTypes o TypeScript (futuro)

## 🔄 Ciclo de Vida de una Request

```
Request → CORS → Decorators → Service → Core → Utils → Response
   ↓        ↓         ↓          ↓       ↓       ↓        ↓
Validar  Permitir  Validar   Lógica  Procesar Helpers Formatear
         origen    datos    negocio   datos           respuesta
```

---

**Última actualización**: Enero 2026  
**Versión de arquitectura**: 2.0 (Post-refactorización)
