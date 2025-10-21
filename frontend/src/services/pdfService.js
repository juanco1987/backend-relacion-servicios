// Servicio para generar PDF de servicios en efectivo
import { API_CONFIG } from '../config/appConfig';

const API_BASE = API_CONFIG.BASE_URL;

export async function generarPDFServiciosEfectivo({ archivo, fechaInicio, fechaFin, notas, imagenes, nombrePDF }) {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('fecha_inicio', fechaInicio); // formato: YYYY-MM-DD
  formData.append('fecha_fin', fechaFin);       // formato: YYYY-MM-DD
  formData.append('notas', notas || '');
  formData.append('nombre_pdf', nombrePDF || '');

  

  if (imagenes && imagenes.length > 0) {
    formData.append('imagenes', JSON.stringify(imagenes));
  }

  const response = await fetch(`${API_BASE}/api/pdf_relacion_servicios`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al generar el PDF');
  }

  // Recibe el PDF como blob para descargar o mostrar
  const blob = await response.blob();
  return blob;
}

// Servicio para generar PDF de servicios pendientes de pago

export async function generarPDFPendientes({ archivo, fechaInicio, fechaFin, notas, imagenes, nombrePDF }) {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('fecha_inicio', fechaInicio); // formato: YYYY-MM-DD
  formData.append('fecha_fin', fechaFin);       // formato: YYYY-MM-DD
  formData.append('notas', notas || '');
  formData.append('nombre_pdf', nombrePDF || '');

  if (imagenes && imagenes.length > 0) {
    formData.append('imagenes', JSON.stringify(imagenes));
  }

  const response = await fetch(`${API_BASE}/api/pdf_pendientes`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al generar el PDF de pendientes');
  }

  // Recibe el PDF como blob para descargar o mostrar
  const blob = await response.blob();
  return blob;
} 