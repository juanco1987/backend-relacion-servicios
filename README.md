# AAP Web Reportes

Sistema web profesional para la gestión y generación de reportes de servicios técnicos. Permite procesar archivos Excel, generar análisis detallados y crear reportes PDF personalizados.

## 🚀 Características Principales

- **Procesamiento de Excel**: Carga y procesa archivos Excel con servicios técnicos
- **Analytics Avanzado**: Dashboard interactivo con gráficos y KPIs en tiempo real
- **Generación de PDFs**: Crea reportes profesionales en PDF con logos y firmas
- **Gestión de Gastos**: Registra y genera reportes de gastos con soporte de imágenes
- **Arquitectura Optimizada**: Backend vectorizado con Pandas y frontend con React optimizado

## 📋 Requisitos Previos

- Python 3.11+
- Node.js 18+
- npm 9+

## 🔧 Instalación

### Backend (Flask)

```bash
# Clonar el repositorio
git clone <repository-url>
cd AAP_WEB_REPORTES

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend
```

## 🎯 Uso

### Desarrollo Local

**Terminal 1 - Backend:**
```bash
python app.py
# Servidor corriendo en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Aplicación corriendo en http://localhost:3000
```

### Producción

**Backend:**
```bash
gunicorn app:app
```

**Frontend:**
```bash
cd frontend
npm run build
# Los archivos estáticos estarán en frontend/build/
```

## 📁 Estructura del Proyecto

```
AAP_WEB_REPORTES/
├── api/                    # Endpoints de la API
│   └── routes/            # Rutas organizadas por funcionalidad
│       ├── analytics.py   # Endpoints de analytics
│       ├── reports.py     # Endpoints de reportes
│       └── expenses.py    # Endpoints de gastos
├── core/                  # Lógica de negocio principal
│   ├── excel_processor.py         # Procesamiento de Excel
│   ├── pdf_generator.py           # Generación de PDFs
│   └── column_mapper.py           # Mapeo de columnas
├── services/              # Servicios de negocio
│   ├── analytics_service.py       # Lógica de analytics
│   └── report_service.py          # Lógica de reportes
├── utils/                 # Utilidades y helpers
│   ├── temp_file_manager.py       # Manejo de archivos temporales
│   ├── decorators.py              # Decoradores de validación
│   └── validators/                # Validadores
├── config/                # Configuración
│   ├── config.py          # Clases de configuración
│   └── settings.py        # Constantes y configuraciones
├── frontend/              # Aplicación React
│   └── src/
│       ├── components/    # Componentes React
│       ├── services/      # Servicios de API
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utilidades frontend
└── tests/                 # Tests automatizados
```

## 🔑 Funcionalidades Principales

### 1. Procesamiento de Servicios

Procesa archivos Excel con servicios técnicos y filtra según criterios:
- Forma de pago: Efectivo
- Estado del servicio: Vacío o pendiente
- Rango de fechas personalizable

### 2. Dashboard de Analytics

Visualiza métricas clave:
- Total de servicios por mes
- Distribución por forma de pago (Efectivo/Transferencia)
- Estados de servicios (Ya Relacionado, Pendiente, etc.)
- Servicios pendientes de cobro
- Gráficos interactivos con Recharts

### 3. Generación de Reportes PDF

Crea PDFs profesionales con:
- Logo personalizado
- Tabla de servicios detallada
- Totales y subtotales
- Espacio para firmas
- Notas adicionales
- Imágenes de soporte de pago

### 4. Gestión de Gastos

Registra gastos con:
- Fecha y descripción
- Monto y categoría
- Imágenes adjuntas
- Generación de PDF de comprobante

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask 3.x**: Framework web
- **Pandas**: Procesamiento de datos con vectorización
- **ReportLab**: Generación de PDFs
- **Openpyxl**: Lectura de archivos Excel
- **Python-dotenv**: Gestión de variables de entorno

### Frontend
- **React 18**: Librería UI
- **Material-UI (MUI)**: Componentes UI
- **Recharts**: Gráficos interactivos
- **Framer Motion**: Animaciones
- **Day.js**: Manejo de fechas

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Con coverage
pytest --cov=. --cov-report=html

# Ver reporte de coverage
# Abrir htmlcov/index.html en el navegador
```

## 📊 Optimizaciones Implementadas

### Backend
- ✅ Procesamiento vectorizado con Pandas (30-50% más rápido)
- ✅ Context managers para manejo seguro de archivos temporales
- ✅ Decoradores de validación para endpoints
- ✅ JSON encoder personalizado para tipos NumPy
- ✅ Arquitectura modular con separación de responsabilidades

### Frontend
- ✅ Lazy loading de componentes pesados
- ✅ Memoización con React.memo, useMemo, useCallback
- ✅ Code splitting automático
- ✅ Optimización de re-renders
- ✅ Custom hooks para lógica reutilizable

## 🔒 Seguridad

- Validación de tipos y tamaños de archivos
- Límite de 16MB para uploads
- Limpieza automática de archivos temporales
- Variables de entorno para configuraciones sensibles
- CORS configurado para desarrollo y producción

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Flask
SECRET_KEY=tu-clave-secreta-aqui
FLASK_ENV=development

# Configuración de archivos
MAX_CONTENT_LENGTH=16777216  # 16MB en bytes
UPLOAD_FOLDER=temp

# Frontend (en frontend/.env.local)
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Vercel (Frontend)
Ver instrucciones detalladas en `VERCEL_DEPLOYMENT_INSTRUCTIONS.md`

### Render/Heroku (Backend)
1. Configurar variables de entorno
2. El `Procfile` ya está configurado
3. Deploy automático desde Git

## 📖 Documentación Adicional

- [Arquitectura del Sistema](ARCHITECTURE.md)
- [Instrucciones de Deployment](VERCEL_DEPLOYMENT_INSTRUCTIONS.md)
- [Uso del Backend Local](USAR_BACKEND_LOCAL.md)

## 🤝 Contribución

Este es un proyecto personal, pero sugerencias y mejoras son bienvenidas.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## ✨ Autor

Desarrollado con ❤️ para la gestión eficiente de servicios técnicos
