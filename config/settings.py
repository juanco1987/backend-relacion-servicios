# backend/config/settings.py

import os
"""
Archivo de configuración para centralizar constantes, nombres de columnas,
criterios de filtro y rutas de recursos de la aplicación.
"""

EXCEL_COLUMNS = {
    "FECHA": "FECHA",
    "DIRECCION": "DIRECCION",
    "NOMBRE_CLIENTE": "NOMBRE CLIENTE",
    "SERVICIO_REALIZADO": "SERVICIO REALIZADO",
    "VALOR_SERVICIO": "VALOR SERVICIO",
    "VALOR_DOMICILIO": "VALOR DOMICILIO",
    "VALOR_MATERIALES": "VALOR MATERIALES",
    "FORMA_PAGO": "FORMA DE PAGO",
    "ESTADO_SERVICIO": "ESTADO DEL SERVICIO",
    "IVA": "IVA",
    "SUBTOTAL": "SUBTOTAL",        # Columna calculada
    "TOTAL_EMPRESA": "TOTAL EMPRESA", # Columna calculada
    "VALOR_COMBINADO": "VALOR_COMBINADO", # Columna calculada
    "TORRE_APTO": "TORRE/APTO" # Columna para categorización de clientes
}

# --- Criterios de Filtrado ---
# Valores exactos que se usarán para filtrar los datos.
FILTER_CRITERIA = {
    "FORMA_PAGO_EFECTIVO": "EFECTIVO",
    "ESTADO_SERVICIO_VACIO": "", # Se asume que celdas vacías son cadenas vacías, o puedes usar None/pd.NA
}

# --- Configuración del PDF ---
PDF_CONFIG = {
    "DEFAULT_NAME": "Informe_Servicios.pdf",
    
}

# --- Rutas de Recursos (Icons, Logos) ---
# Centraliza los nombres de archivo para los recursos.
# La función resource_path de src.utils se encargará de encontrar la ruta absoluta.
RESOURCE_PATHS = {
    "APP_ICON": "recursos/mi_logo.ico",
    "HEADER_LOGO": "recursos/icono.png",
    "EXCEL_ICON": "recursos/document_microsoft_excel.png",
    "FOLDER_ICON": "recursos/carpeta.png",
    "CALENDAR_ICON": "recursos/calendario.png",
    "CALENDAR_ICON_2": "recursos/calendario_2.png", # Si tienes dos iconos de calendario diferentes
    "NOTES_ICON": "recursos/document_write.png",
    "PROCESS_ICON": "recursos/proceso.png",
    "PDF_GENERATE_ICON": "recursos/icono_pdf.png",
    "PDF_OPEN_ICON": "recursos/OJO.png",
    "TERMINAL_STATUS_ICON": "recursos/punto.png", # Si existe y se usa en terminal_componet
    "TERMINAL_ICON": "recursos/konsole.png", # <--- NUEVA
    "TRASH_ICON": "recursos/papelera.png",
    "ARROW_CLICK_ICON": "recursos/arrow_click.png",
    "NOTE_PAD_ICON": "recursos/notepad.png",
    "QUIK_ICON":"recursos/flechas_circulo.png"
}

# --- Mensajes de la Aplicación ---
# Mensajes comunes que se muestran en la UI o en los logs.
APP_MESSAGES = {
    "APP_TITLE": "Sistema de Relacion de Servicios",
    "APP_TITLE_SHORT": "Relaciones de Servicios",
    "FILE_SELECT_TITLE": "Seleccionar archivo Excel",
    "FILE_TYPES": [("Archivos Excel", "*.xlsx *.xls"), ("Todos los archivos", "*.*")],
    "FILE_SELECTED": "📁 Archivo seleccionado:",
    "FILE_LOADED": "Archivo cargado - Listo para procesar",
    "PROCESS_START": "⏳ Iniciando procesamiento de datos...",
    "NO_RECORDS_FOUND": "No se encontraron registros que cumplan con los criterios",
    "RECORDS_FOUND": "Se encontraron {} registros",
    "PROCESS_ERROR": "❌ Error durante el procesamiento:",
    "PROCESS_COMPLETE": "✅ Procesamiento completado",
    "PDF_NOT_EXIST": "❌ El archivo PDF no existe o la ruta es incorrecta",
    "ERROR_TITLE": "Error",
    "TERMINAL_TITLE": "Conosola de Procesamiento", # <--- NUEVA
    "TERMINAL_ICON_WARNING_NAME": "consola", # <--- NUEVA para warning del icono
    "TERMINAL_STATUS_ONLINE": " EN LINEA", # <--- NUEVA
    "TERMINAL_STATUS_ICON_WARNING_NAME": "punto de estado", # <--- NUEVA
    "BUTTON_CLEAR_TEXT": " Limpiar", # <--- NUEVA
    "TRASH_ICON_WARNING_NAME": "papelera", # <--- NUEVA
    "WELCOME_MESSAGE_1": "🚀 Sistema de Relacion de Servicios en Efectivo", # <--- NUEVA
    "WELCOME_MESSAGE_2": "=" * 40, # <--- NUEVA (o puedes generar la cadena aquí dinámicamente)
    "WELCOME_MESSAGE_3": "💻 Terminal iniciado correctamente", # <--- NUEVA
    "WELCOME_MESSAGE_4": "📡 Conexión establecida", # <--- NUEVA
    "WELCOME_MESSAGE_5": "🔧 Todos los sistemas operativos", # <--- NUEVA
    "WELCOME_MESSAGE_6": "📋 Esperando instrucciones...", # <--- NUEVA
    # Iconos para los mensajes de log (pueden ser emojis directamente o rutas a imágenes si prefieres)
    "LOG_ICON_INFO": "ℹ️",
    "LOG_ICON_SUCCESS": "✅",
    "LOG_ICON_ERROR": "❌",
    "LOG_ICON_WARNING": "⚠️",
    "EXIT_CONFIRM_TITLE": "Salir",
    "EXIT_CONFIRM_MESSAGE": "¿Deseas salir de la aplicación?",
    "LOADING_APP": "Cargando aplicación...",
    "LOADING_SYSTEM": "Iniciando sistema...",
    "LOADING_COMPONENTS": "Cargando componentes...",
    "LOADING_INTERFACE": "Preparando interfaz...",
    "LOADING_SERVICES": "Configurando servicios...",
    "READY_TO_WORK": "¡Listo para trabajar!",
    "TERMINAL_INIT": "💻 Terminal iniciado correctamente",
    "CONNECTION_ESTABLISHED": "📡 Conexión establecida",
    "SYSTEMS_OPERATIONAL": "🔧 Todos los sistemas operativos",
    "WAITING_INSTRUCTIONS": "📋 Esperando instrucciones...",
    "LOG_CLEARED": "🧹 Log limpiado",
    "THEME_UPDATED": "🎨 Tema actualizado",
    "THEME_CHANGED": "🎨 Tema cambiado a:",
    "WARNING_ICON_NOT_FOUND": "Advertencia: No se pudo cargar el icono de {}: {}",
    "WARNING_LOGO_NOT_FOUND": "Advertencia: No se encontró el logo en '{}. Usando logo por defecto.",
    "BUTTON_BROWSE_TEXT": "  Examinar",
    "FILE_ENTRY_PLACEHOLDER": "Arrastra un archivo aquí o haz clic en Examinar...",
    "DATE_RANGE_CARD_TITLE": "Período de Tiempo",
    "CALENDAR_ICON_WARNING_NAME": "calendario",
    "QUICK_SELECT_LABEL": "Selección Rápida:",
    "MONTH_LABEL": "Mes:",
    "YEAR_LABEL": "Año:",
    "DATE_FROM_LABEL": " Desde:",
    "DATE_TO_LABEL": " Hasta:",
    "DATE_ENTRY_PLACEHOLDER": "DD/MM/YYYY",
    "CALENDAR_POPUP_TITLE": "Seleccionar Fecha",
    "CALENDAR_SELECT_BUTTON": "Seleccionar Fecha",
    "DATE_PERIOD_UPDATED": "📅 Período actualizado: {}",
    "DATE_SELECTED_FOR": "Fecha seleccionada para {}: {}",
    "DATE_SELECT_ERROR": "Error al seleccionar fecha del calendario:",
    "DATE_UPDATE_MONTH_ERROR": "❌ Error al actualizar fechas por mes:",
    "MONTHS_NAMES": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], # Para el combobox de meses
    "DEFAULT_DATE_FORMAT": "%d/%m/%Y", # Formato de fecha para strftime/strptime
    "APP_ICON_WARNING_NAME": "aplicación", # Para el nombre del icono de la ventana principal en los logs
    "APP_STARTED_SUCCESSFULLY": "🚀 Aplicación iniciada correctamente", # Para el mensaje de inicio
    "THEME_UPDATED_LOG": "🎨 Tema actualizado", # Mensaje de log al actualizar el tema
    "THEME_CHANGED_TO_LOG": "🎨 Tema cambiado a: {}", # Mensaje de log al cambiar el tema (con formato)
    "TERMINAL_CREATE_ERROR": "Error al crear terminal: {}", # Mensaje de error para la terminal
    "CLEAR_LOG_MESSAGE": "🧹 Log limpiado", # Mensaje de log para limpiar terminal
    "ERROR_MESSAGE_PREFIX": "❌ ", # Prefijo para mensajes de error en el log
    # Formato de timestamp para el log de fallback (opcional, pero útil para consistencia)
    "LOG_FALLBACK_TIMESTAMP_FORMAT": "%Y-%m-%d %H:%M:%S",
    "ACTION_CARD_TITLE": "Centro de Acciones",
    "PDF_NAME_LABEL": "Nombre del informe:",
    "PDF_NAME_PLACEHOLDER": "Escribe el nombre del archivo PDF...",
    "BUTTON_PROCESS_TEXT": " Procesar Datos",
    "BUTTON_PROCESSING_TEXT": "⏳ Procesando...", # Para el estado de "procesando"
    "BUTTON_GENERATE_PDF_TEXT": " Generar PDF",
    "BUTTON_OPEN_PDF_TEXT": " Abrir PDF",
    "ACTION_CARD_ICON_NAME": "acciones", # Nombre para el warning del icono "🎯"
    "PROCESS_ICON_WARNING_NAME": "proceso",
    "PDF_GENERATE_ICON_WARNING_NAME": "icono_pdf",
    "PDF_OPEN_ICON_WARNING_NAME": "OJO",
    "EXCEL_ICON_WARNING_NAME": "excel", # Para el icono de Excel
    "FOLDER_ICON_WARNING_NAME": "carpeta",
    "HEADER_SUBTITLE": "Genera informes de servicios pagados con tecnología avanzada", # Nuevo
    "HEADER_STATUS_LABEL": "Estado:", # Nuevo, para el prefijo del badge de estado
    "HEADER_STATUS_NORMAL": "Normal", # Nuevo, para el estado inicial
    "MENU_BUTTON_TEXT": "☰", # Nuevo, para el botón de menú
    "HEADER_ICON_WARNING_NAME": "encabezado",
    "MENU_OPTIONS_TITLE": "Opciones", # Título del menú lateral
    "THEME_LABEL": "Tema:", # Etiqueta para el selector de tema
    "THEME_VALUES_CLARO": "Claro",
    "THEME_VALUES_OSCURO": "Oscuro",
    "THEME_VALUES_SISTEMA": "Sistema",
    "MENU_CLOSE_BUTTON": "Cerrar",
    "NOTES_CARD_TITLE": "Notas del Informe", # Título del card de notas
    "NOTES_ICON_WARNING_NAME": "notas", # Nombre para el warning del icono de notas
    "NOTES_ENTRY_PLACEHOLDER": "Escribe tus notas aquí...",
}


