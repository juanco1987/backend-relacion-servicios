from fpdf import FPDF
from datetime import datetime
import pandas as pd 
import os
import threading    
from tkinter import messagebox

from utils.date_utils import fecha_larga

class PDF(FPDF):
    def header(self):
        # Configuración de colores y fuentes
        self.set_fill_color(0, 102, 204)  # Azul corporativo
        self.set_text_color(255)  # Texto blanco
        
        # Título principal con fondo azul
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 10, 'SERVICIOS PENDIENTES POR PAGAR A JUAN GABRIEL', 0, 1, 'C', True)
        
        # Fecha actual
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0)  # Texto negro
        fecha_actual = datetime.now().strftime("%d/%m/%Y")
        self.cell(0, 10, f'Fecha: {fecha_actual}', 0, 0, 'R')
        self.ln(12)  # Espaciado después del encabezado

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128)  # Texto gris
        
        # Fecha y hora de generación
        fecha_actual = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        self.cell(0, 5, f'Generado el: {fecha_actual}', align="L")
        self.ln(5)
        
        # Número de página centrado
        self.cell(0, 5, f'Página {self.page_no()}', 0, 0, 'C')

    def crear_tabla(self, datos):
        columnas = {
            "FECHA": 25,
            "DIRECCIÓN": 44,
            "CLIENTE": 37,
            "SERVICIO": 59,
            "DÍAS RETRASO": 28
        }
        headers = list(columnas.keys())
        widths = list(columnas.values())

        fecha_inicio = datos['FECHA'].min()
        fecha_fin = datos['FECHA'].max()

        self.set_draw_color(200)
        self.set_line_width(0.3)

        # Dibujar encabezados
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(0, 102, 204)
        self.set_text_color(255)
        for i, header in enumerate(headers):
            self.cell(widths[i], 8, header, 1, 0, 'C', True)
        self.ln()

        # Dibujar filas de datos
        self.set_font('Helvetica', '', 8)
        self.set_text_color(0)
        line_height = 7
        fill = False

        for _, fila in datos.iterrows():
            # Preparar cada campo para evitar mostrar 'NaN' o 'nan'
            fecha = fila['FECHA']
            fecha_str = fecha.strftime('%d/%m/%Y') if not pd.isna(fecha) and str(fecha).lower() != 'nan' and fecha != '' else '-'
            direccion = str(fila['DIRECCION']) if not pd.isna(fila['DIRECCION']) and str(fila['DIRECCION']).lower() != 'nan' and str(fila['DIRECCION']) != '' else '-'
            cliente = str(fila['NOMBRE CLIENTE']) if not pd.isna(fila['NOMBRE CLIENTE']) and str(fila['NOMBRE CLIENTE']).lower() != 'nan' and str(fila['NOMBRE CLIENTE']) != '' else '-'
            servicio = str(fila['SERVICIO REALIZADO']) if not pd.isna(fila['SERVICIO REALIZADO']) and str(fila['SERVICIO REALIZADO']).lower() != 'nan' and str(fila['SERVICIO REALIZADO']) != '' else '-'
            dias_retraso = str(int(fila['DIAS_RETRASO'])) if not pd.isna(fila['DIAS_RETRASO']) and str(fila['DIAS_RETRASO']).lower() != 'nan' and str(fila['DIAS_RETRASO']) != '' else '-'

            datos_fila = [
                fecha_str,
                direccion,
                cliente,
                servicio,
                dias_retraso
            ]
            
            # Cálculo de altura y posicionamiento optimizado
            heights = []
            lines_por_celda = []
            for i, texto in enumerate(datos_fila):
                lines = self.multi_cell(widths[i], line_height, texto, border=0, align='C', split_only=True)
                heights.append(len(lines) * line_height)
                lines_por_celda.append(lines)
            row_height = max(heights)

            # Verificar salto de página
            if self.get_y() + row_height > self.page_break_trigger:
                self.add_page()
                self.set_font('Helvetica', 'B', 10)
                self.set_fill_color(0, 102, 204)
                self.set_text_color(255)
                for i, header in enumerate(headers):
                    self.cell(widths[i], 8, header, 1, 0, 'C', True)
                self.ln()
                self.set_font('Helvetica', '', 8)
                self.set_text_color(0)

            # Imprimir cada celda centrada
            x_start = self.get_x()
            y_start = self.get_y()
            for i, texto in enumerate(datos_fila):
                cell_lines = len(lines_por_celda[i])
                cell_height = cell_lines * line_height
                y_offset = y_start + (row_height - cell_height) / 2
                self.set_xy(x_start + sum(widths[:i]), y_offset)
                self.multi_cell(widths[i], line_height, texto, border=0, align='C')
                
            # Dibujar bordes
            self.set_xy(x_start, y_start)
            for i in range(len(widths)):
                self.cell(widths[i], row_height, '', border=1, ln=0)
            self.ln(row_height)
            fill = not fill

        # Fila de totales
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(220)
        self.cell(sum(widths[:-1]), 8, 'TOTAL SERVICIOS:', 1, 0, 'C', True)
        self.cell(widths[-1], 8, str(len(datos)), 1, 1, 'C', True)

        # Texto periodo analizado con fechas seleccionadas por el usuario
        # (esto se agrega desde la función generate_pdf_report)


def generate_pdf_report(data, base_file_path, fecha_inicio=None, fecha_fin=None, nombre_pdf=None, notas=None):
    """
    Genera un archivo PDF a partir de un DataFrame con datos de servicios pendientes.

    Args:
        data (pd.DataFrame): DataFrame con los datos a incluir en el PDF.
        base_file_path (str): La ruta base (ej. ruta del archivo Excel) para determinar dónde guardar el PDF.
        fecha_inicio (datetime): Fecha de inicio del periodo analizado.
        fecha_fin (datetime): Fecha de fin del periodo analizado.
        nombre_pdf (str): Nombre personalizado para el PDF.
        notas (str): Notas adicionales para incluir en el PDF.

    Returns:
        tuple: Una tupla que contiene:
            - bool: True si el PDF se generó y guardó con éxito, False en caso contrario.
            - str or None: La ruta completa del archivo PDF generado si fue exitoso, None si falló.
            - list: Una lista de diccionarios con mensajes de log ('level', 'text').
    """
    messages = []
    ruta_pdf_generado = None

    try:
        if data is None or data.empty:
            messages.append({'level': 'warning', 'text': "No hay datos para generar el PDF."})
            return False, None, messages

        messages.append({'level': 'info', 'text': "Generando PDF..."})

        # Crear documento PDF
        pdf = PDF()
        pdf.add_page()
        pdf.crear_tabla(data)
        
        # Mostrar periodo analizado con fechas seleccionadas por el usuario
        if fecha_inicio is not None and fecha_fin is not None:
            pdf.ln(5)
            pdf.set_font('Helvetica', 'I', 9)
            pdf.set_text_color(0)
            pdf.cell(0, 5, f'PERIODO ANALIZADO: {fecha_larga(fecha_inicio)} a {fecha_larga(fecha_fin)}', 0, 1, 'C')
        
        # Agregar notas si se proporcionan
        if notas and notas.strip():
            pdf.ln(5)
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(0)
            pdf.cell(0, 5, 'NOTAS:', 0, 1, 'L')
            pdf.set_font('Helvetica', '', 9)
            pdf.multi_cell(0, 5, notas.strip(), 0, 'L')

        # Generar nombre de archivo y ruta
        if nombre_pdf and nombre_pdf.strip():
            nombre_pdf_final = nombre_pdf.strip()
            if not nombre_pdf_final.endswith('.pdf'):
                nombre_pdf_final += '.pdf'
        else:
            nombre_pdf_final = f"Servicios_Pendientes_{datetime.now().strftime('%Y-%m-%d_%H-%M')}.pdf"
        
        # Usar el directorio del archivo base para guardar el PDF
        output_dir = r"C:\Users\usuario\OneDrive\Escritorio\pendientes-de-pago-a-JG"
        ruta_pdf_generado = os.path.join(output_dir, nombre_pdf_final)

        # Asegurarse de que el directorio de salida exista
        os.makedirs(output_dir, exist_ok=True)

        # Guardar archivo con manejo de errores
        try:
            pdf.output(ruta_pdf_generado)
            messages.append({'level': 'success', 'text': f"PDF guardado en: {ruta_pdf_generado}"})
            return True, ruta_pdf_generado, messages
        except PermissionError:
            messages.append({'level': 'error', 'text': f"Error de permisos: El archivo PDF '{os.path.basename(ruta_pdf_generado)}' está siendo utilizado por otro programa."})
            return False, None, messages
        except Exception as e:
            messages.append({'level': 'error', 'text': f"Error al guardar el PDF: {str(e)}"})
            return False, None, messages

    except Exception as e:
        messages.append({'level': 'error', 'text': f"Error al generar el PDF: {str(e)}"})
        return False, None, messages 