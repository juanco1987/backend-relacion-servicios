// frontend/src/config/logMessages.js

export const LOG_MESSAGES = {
  // Mensajes de bienvenida del sistema
  "WELCOME_MESSAGE_1": "🚀 Sistema de Relacion de Servicios en Efectivo",
  "WELCOME_MESSAGE_2": "================================================",
  "WELCOME_MESSAGE_3": "💻 Terminal iniciado correctamente",
  "WELCOME_MESSAGE_4": "📡 Conexión establecida",
  "WELCOME_MESSAGE_5": "🔧 Todos los sistemas operativos",
  "WELCOME_MESSAGE_6": "📋 Esperando instrucciones...",
  
  // Mensajes de estado del sistema
  "SYSTEM_READY": "🟢 Sistema listo para procesar",
  "BACKEND_CONNECTED": "🔗 Conexión con backend establecida",
  "BACKEND_ERROR": "❌ Error de conexión con backend",
  "TERMINAL_STATUS_ONLINE": " EN LINEA",
  "LOG_CLEARED": "🧹 Log limpiado",
  
  // Mensajes de archivos
  "FILE_UPLOADED": "📁 Archivo cargado: {}",
  "FILE_PROCESSING": "⚙️ Procesando archivo Excel...",
  "FILE_PROCESSED": "✅ Archivo procesado exitosamente",
  "ERROR_FILE_REQUIRED": "❌ Error: Debe seleccionar un archivo",
  "ERROR_FILE_INVALID": "❌ Error: Formato de archivo inválido",
  
  // Mensajes de fechas
  "DATE_RANGE_UPDATED": "📅 Rango de fechas actualizado: {} - {}",
  "DATE_SELECTED": "📅 Fecha seleccionada: {}",
  "DATE_INICIO_UPDATED": "📅 Fecha de inicio actualizada: {}",
  "DATE_FIN_UPDATED": "📅 Fecha final actualizada: {}",
  "MONTH_SELECTED": "📅 Mes seleccionado: {}",
  "YEAR_SELECTED": "📅 Año seleccionado: {}",
  "ERROR_DATES_REQUIRED": "❌ Error: Debe seleccionar fechas válidas",
  "ERROR_DATE_FORMAT": "❌ Error: Formato de fecha inválido",
  
  // Mensajes de notas
  "NOTES_ADDED": "📝 Notas ingresadas",
  "NOTES_UPDATED": "📝 Notas ingresadas",
  "NOTES_CLEARED": "📝 Notas limpiadas",
  "NOTES_STARTED": "📝 Notas ingresadas",
  
  // Mensajes de procesamiento
  "PROCESSING_STARTED": "⚙️ Iniciando procesamiento de datos...",
  "PROCESSING_COMPLETED": "✅ Procesamiento completado exitosamente",
  "PROCESSING_ERROR": "❌ Error durante el procesamiento: {}",
  "DATA_FILTERED": "🔍 Datos filtrados: {} registros encontrados",
  
  // Mensajes de PDF
  "PDF_GENERATION_STARTED": "📄 Generando PDF...",
  "PDF_GENERATED_SUCCESS": "✅ PDF generado exitosamente",
  "PDF_DOWNLOADED": "⬇️ PDF descargado: {}",
  "PDF_OPENED": "👁️ PDF abierto en nueva pestaña",
  "ERROR_PDF_GENERATION": "❌ Error al generar PDF: {}",
  "ERROR_PDF_DOWNLOAD": "❌ Error al descargar PDF: {}",
  
  // Mensajes de PDF Pendientes
  "PDF_PENDIENTES_GENERATION_STARTED": "📄 Generando PDF de Pendientes...",
  "PDF_PENDIENTES_GENERATED_SUCCESS": "✅ PDF de Pendientes generado exitosamente",
  "PDF_PENDIENTES_DOWNLOADED": "⬇️ PDF de Pendientes descargado: {}",
  "PDF_PENDIENTES_OPENED": "👁️ PDF de Pendientes abierto en nueva pestaña",
  "ERROR_PDF_PENDIENTES_GENERATION": "❌ Error al generar PDF de Pendientes: {}",
  "ERROR_PDF_PENDIENTES_DOWNLOAD": "❌ Error al descargar PDF de Pendientes: {}",
  
  // Mensajes de procesamiento de pendientes
  "PENDIENTES_PROCESSING_STARTED": "⚙️ Iniciando procesamiento de pendientes...",
  "PENDIENTES_PROCESSING_COMPLETED": "✅ Procesamiento de pendientes completado",
  "PENDIENTES_DATA_FILTERED": "🔍 Pendientes filtrados: {} registros encontrados",
  "PENDIENTES_NO_DATA": "⚠️ No se encontraron servicios pendientes en el rango de fechas",
  "PENDIENTES_VALIDATION_STARTED": "🔍 Validando pendientes en el rango de fechas...",
  
  // Mensajes de validación
  "VALIDATION_PASSED": "✅ Validación completada",
  "VALIDATION_ERROR": "❌ Error de validación: {}",
  "NO_DATA_IN_RANGE": "⚠️ No se encontraron datos en el rango de fechas seleccionado",
  "DATA_FOUND": "✅ Datos encontrados en el rango de fechas",
  "DATA_FOUND_WITH_WARNINGS": "⚠️ Datos encontrados (con advertencias de formato)",
  "RANGE_VALIDATION_STARTED": "🔍 Validando datos en el rango de fechas...",
  
  // Mensajes de conexión
  "CONNECTION_ESTABLISHED": "📡 Conexión establecida",
  "CONNECTION_LOST": "❌ Conexión perdida",
  "CONNECTION_RESTORED": "🔄 Conexión restaurada",
  
  // Mensajes de interfaz
  "INTERFACE_READY": "🖥️ Interfaz lista",
  "THEME_UPDATED": "🎨 Tema actualizado: {}",
  "LANGUAGE_UPDATED": "🌐 Idioma actualizado: {}",
  
  // Mensajes de error generales
  "ERROR_GENERAL": "❌ Error: {}",
  "ERROR_NETWORK": "🌐 Error de red: {}",
  "ERROR_TIMEOUT": "⏰ Error de tiempo de espera",
  "ERROR_UNKNOWN": "❓ Error desconocido",
  
  // Mensajes informativos
  "INFO_LOADING": "⏳ Cargando...",
  "INFO_SAVING": "💾 Guardando...",
  "INFO_UPDATING": "🔄 Modo de Trabajo Actualizado...",
  "INFO_COMPLETED": "✅ Completado",
  
  // Mensajes de advertencia
  "WARNING_LARGE_FILE": "⚠️ Archivo grande detectado, puede tomar más tiempo",
  "WARNING_OLD_DATA": "⚠️ Datos antiguos detectados",
  "WARNING_LIMIT_REACHED": "⚠️ Límite alcanzado",
  
  // Mensajes de éxito
  "SUCCESS_OPERATION": "✅ Operación completada exitosamente",
  "SUCCESS_SAVED": "✅ Guardado exitosamente",
  "SUCCESS_UPDATED": "✅ Actualizado exitosamente",
  "SUCCESS_DELETED": "✅ Eliminado exitosamente"
};

// Función helper para formatear mensajes con parámetros
export const formatLogMessage = (messageKey, ...params) => {
  const message = LOG_MESSAGES[messageKey] || messageKey;
  return params.reduce((msg, param, index) => {
    return msg.replace(`{}`, param);
  }, message);
};

// Función helper para crear timestamp
export const createTimestamp = () => {
  return new Date().toLocaleTimeString();
};

// Función helper para crear entrada de log completa
export const createLogEntry = (messageKey, ...params) => {
  const timestamp = createTimestamp();
  const message = formatLogMessage(messageKey, ...params);
  return `[${timestamp}] ${message}`;
}; 