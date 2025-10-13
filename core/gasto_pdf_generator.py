import io
import os
import tempfile
import locale
import traceback
import base64
from pathlib import Path
from datetime import datetime
import logging
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter, A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import ( SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak,)
from reportlab.pdfgen import canvas    

# ===  IMPORTS PARA FUENTES ===
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# === REGISTRO DE FUENTES ROBOTO CONDENSED ===
# NOTA: Debes asegurar que los archivos .ttf estén en la carpeta 'fonts/' de tu proyecto.
pdfmetrics.registerFont(TTFont('Roboto-Cond', 'fonts/RobotoCondensed-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Roboto-Cond-Bold', 'fonts/RobotoCondensed-Bold.ttf'))
# ============================================

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    locale.setlocale(locale.LC_ALL, "")
except:
    locale.setlocale(locale.LC_ALL, "en_US.UTF-8")


def guardar_imagen_base64_temp(base64_data):
    """Decodifica una cadena Base64 y la guarda en un archivo temporal."""
    if not isinstance(base64_data, str) or len(base64_data) < 100:
        return None 

    try:
        if "data:" in base64_data and "," in base64_data:
            header, encoded_data = base64_data.split(",", 1)
        else:
            encoded_data = base64_data
            header = ""
             
        data = base64.b64decode(encoded_data)
        
        if 'image/jpeg' in header:
            extension = '.jpg'
        elif 'image/png' in header:
            extension = '.png'
        else:
            extension = '.png' 
            
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
        temp_file.close() 

        with open(temp_file.name, 'wb') as f:
            f.write(data)
            
        logger.info(f"Imagen decodificada: {temp_file.name}") 
        return temp_file.name
    except Exception as e:
        logger.error(f"Error decodificando Base64: {e}")
        return None


class PDFGastoSideBySide:
    def __init__(self, filename):
        self.filename = filename
        self.elements = []
        self.styles = getSampleStyleSheet()
        
        # --- ESTILOS ACTUALIZADOS CON ROBOTO CONDENSED ---
        self.estilo_titulo = ParagraphStyle(
            "Titulo",
            parent=self.styles["Heading1"],
            alignment=1,
            textColor=colors.HexColor("#1565C0"),
            fontName="Roboto-Cond-Bold", # FUENTE ROBOTO CONDENSED
            fontSize=16,
            spaceAfter=12,
        )
        self.estilo_subtitulo = ParagraphStyle(
            "Subtitulo",
            parent=self.styles["Heading2"],
            alignment=1, # Corregido a Centrado
            textColor=colors.HexColor("#0D47A1"),
            fontName="Roboto-Cond-Bold", # FUENTE ROBOTO CONDENSED
            fontSize=12,
            spaceAfter=8,
        )
        self.estilo_normal = ParagraphStyle(
            "Normal",
            parent=self.styles["BodyText"],
            fontName="Roboto-Cond", # FUENTE ROBOTO CONDENSED
            fontSize=10,
            leading=14,
        )
        self.estilo_titulo_seccion = ParagraphStyle(
            "TituloSeccion",
            parent=self.styles["Heading3"],
            alignment=1, # CORREGIDO: 1 (Centrado)
            textColor=colors.HexColor("#0D47A1"),
            fontName="Roboto-Cond-Bold", # FUENTE ROBOTO CONDENSED
            fontSize=10,
            spaceAfter=6, 
        )
        # ------------------------------------------------

    def formatear_moneda(self, valor):
        try:
            # Asegura que el texto dentro de la tabla también use la fuente Condensed
            return f"$ {float(valor):,.0f}".replace(",", ".")
        except:
            return "$ 0"

    def header(self):
        fecha = datetime.now().strftime("%d/%m/%Y")
        titulo = f"RELACIÓN DE GASTOS Y CONSIGNACIONES – {fecha}"
        self.elements.append(Paragraph(titulo, self.estilo_titulo))
        self.elements.append(Spacer(1, 10))
    
    def tabla_consignaciones(self, consignaciones):
        """Tabla con consignaciones"""
        self.elements.append(Paragraph("DETALLE DE CONSIGNACIONES", self.estilo_subtitulo))

        data = [["Fecha", "Entregado Por", "Descripción", "Valor"]]
        total_consignaciones = 0
        
        for c in consignaciones:
            fecha = c.get("fecha", "")
            entregado_por = c.get("entregadoPor", "N/A") 
            descripcion = c.get("descripcion", "") 
            monto = float(c.get("monto", 0))
            total_consignaciones += monto
            
            data.append([fecha, entregado_por, descripcion, self.formatear_moneda(monto)])

        data.append([
            "", "", 
            Paragraph("<b>TOTAL CONSIGNADO</b>", self.estilo_normal),
            Paragraph(
                f"<b>{self.formatear_moneda(total_consignaciones)}</b>",
                ParagraphStyle("ValorTotal", parent=self.estilo_normal,
                    textColor=colors.HexColor("#1565C0"), alignment=2, fontName="Roboto-Cond"), # FUENTE ROBOTO CONDENSED
            ),
        ])

        tabla = Table(data, colWidths=[1.2*inch, 1.8*inch, 3*inch, 1.2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), "Roboto-Cond-Bold"), # FUENTE ROBOTO CONDENSED
            ("FONTNAME", (0, 1), (-1, -2), "Roboto-Cond"), # FUENTE ROBOTO CONDENSED para contenido
            ("ALIGN", (-1, 1), (-1, -1), "RIGHT"),
            ("ALIGN", (1, 1), (1, -1), "CENTER"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#90CAF9")),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        self.elements.append(tabla)
        self.elements.append(Spacer(1, 15))
        return total_consignaciones

    def tabla_gastos(self, gastos):
        """Tabla con gastos"""
        self.elements.append(Paragraph("GASTOS REGISTRADOS", self.estilo_subtitulo))
        
        data = [["Fecha", "Categoría", "Descripción", "Valor"]]
        total_gastos = 0
        
        for g in gastos:
            fecha = g.get("fecha", "")
            categoria = g.get("categoria", "")
            descripcion = g.get("descripcion", "")
            monto = float(g.get("monto", 0))
            total_gastos += monto
            data.append([fecha, categoria, descripcion, self.formatear_moneda(monto)])

        data.append([
            "", "",
            Paragraph("<b>TOTAL GASTOS</b>", self.estilo_normal),
            Paragraph(
                f"<b>{self.formatear_moneda(total_gastos)}</b>",
                ParagraphStyle("ValorTotal", parent=self.estilo_normal,
                    textColor=colors.HexColor("#C62828"), alignment=2, fontName="Roboto-Cond"), # FUENTE ROBOTO CONDENSED
            ),
        ])

        tabla = Table(data, colWidths=[1.2*inch, 1.5*inch, 3.5*inch, 1.2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), "Roboto-Cond-Bold"), # FUENTE ROBOTO CONDENSED
            ("FONTNAME", (0, 1), (-1, -2), "Roboto-Cond"), # FUENTE ROBOTO CONDENSED para contenido
            ("ALIGN", (3, 1), (3, -1), "RIGHT"),
            ("ALIGN", (0, 0), (1, -1), "LEFT"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#90CAF9")),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        self.elements.append(tabla)
        self.elements.append(Spacer(1, 15))
        return total_gastos

    def tabla_balance(self, gastos, consignaciones):
        """Tabla de balance"""
        total_gastos = sum(float(g.get("monto", 0)) for g in gastos)
        total_consignaciones = sum(float(c.get("monto", 0)) for c in consignaciones)

        if total_gastos < total_consignaciones:
            vueltas_abrecar = total_consignaciones - total_gastos
            excedente_jg = 0
        else:
            vueltas_abrecar = 0
            excedente_jg = total_gastos - total_consignaciones

        data = [
            ["RESUMEN", "MONTO"],
            ["Total consignado", self.formatear_moneda(total_consignaciones)],
            ["Total gastos", self.formatear_moneda(total_gastos)],
            [
                "Vueltas a favor de ABRECAR",
                Paragraph(
                    f"<b>{self.formatear_moneda(vueltas_abrecar)}</b>",
                    ParagraphStyle("Abrecar", parent=self.estilo_normal,
                        textColor=colors.HexColor("#1565C0"), alignment=2, fontName="Roboto-Cond"), # FUENTE ROBOTO CONDENSED
                ),
            ],
            [
                "Excedente a favor de JG",
                Paragraph(
                    f"<b>{self.formatear_moneda(excedente_jg)}</b>",
                    ParagraphStyle("JG", parent=self.estilo_normal,
                        textColor=colors.HexColor("#C62828"), alignment=2, fontName="Roboto-Cond"), # FUENTE ROBOTO CONDENSED
                ),
            ],
        ]

        tabla = Table(data, colWidths=[4*inch, 2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), "Roboto-Cond-Bold"), # FUENTE ROBOTO CONDENSED
            ("FONTNAME", (0, 1), (0, -1), "Roboto-Cond"), # FUENTE ROBOTO CONDENSED para etiquetas
            ("ALIGN", (1, 1), (1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        self.elements.append(Paragraph("BALANCE FINAL", self.estilo_subtitulo))
        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))

    # ====================================================================
    # FUNCIÓN CORREGIDA PARA ALINEACIÓN Y DISEÑO 1X2 / 1X1 CENTRADO
    # ====================================================================
    def seccion_imagenes_sidebyside(self, imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones):
        """Muestra miniaturas de imágenes con distribución 1x2 y 1x1 centrado, forzando la alineación."""
        
        # 1. Función auxiliar para crear un bloque de contenido (Título + Imagenes)
        def crear_bloque_imagen(titulo, lista_rutas, ancho_bloque):
            bloque = []
            
            # Título: Usa el estilo corregido que ahora es centrado y multilínea
            bloque.append(Paragraph(titulo, self.estilo_titulo_seccion))
            
            if not lista_rutas:
                 bloque.append(Spacer(1, 15)) # Espacio para que el bloque no se colapse
                 bloque.append(Paragraph("No hay soportes.", self.estilo_normal))
                 return bloque

            # Mostrar las imágenes en filas, limitando a 2 miniaturas por fila visual
            img_width = 1.6 * inch  
            img_height = 1.2 * inch 
            
            content_row = []
            
            for img_path in lista_rutas:
                try:
                    img = Image(img_path, width=img_width, height=img_height)
                    img.hAlign = 'CENTER' 
                    content_row.append(img)
                    
                    if len(content_row) == 2: # Máximo 2 imágenes por fila visual dentro del bloque
                        # Añadimos la tabla de 2 imágenes, centrada
                        bloque.append(Table([content_row], hAlign="CENTER", spaceBefore=3))
                        content_row = []
                except Exception as e:
                    error_text = Paragraph("ERROR: No se pudo cargar la imagen", self.estilo_normal)
                    logger.error(f"Falló ReportLab al intentar cargar {img_path}. Error: {e}") 
                    content_row.append(error_text) 
                    
                    if len(content_row) == 2:
                        bloque.append(Table([content_row], hAlign="CENTER", spaceBefore=3))
                        content_row = []

            # Añadir las imágenes restantes
            if content_row:
                bloque.append(Table([content_row], hAlign="CENTER", spaceBefore=3))

            return bloque

        
        # 2. Definir el ancho disponible (horizontal: landscape(letter))
        ancho_util = landscape(letter)[0] - 2.5 * inch # Ancho total - márgenes
        ancho_columna = ancho_util / 2
        
        # 3. Crear los bloques de contenido con los títulos multilínea
        bloque_consignaciones = crear_bloque_imagen("ABRECAR DIO PARA<br/>MATERIALES", imagenes_consignaciones, ancho_columna)
        bloque_gastos = crear_bloque_imagen("SOPORTE DE PAGO<br/>DE GASTOS", imagenes_gastos, ancho_columna)
        bloque_devoluciones = crear_bloque_imagen("SOPORTE DEVOLUCIÓN VUELTAS<br/>PARA ABRECAR", imagenes_devoluciones, ancho_util) 

        
        # Agregar página si es necesario
        if self.elements:
            self.elements.append(PageBreak())
        
        self.elements.append(Paragraph("SOPORTES DE OPERACIONES", self.estilo_subtitulo))
        self.elements.append(Spacer(1, 10))

        # 4. TABLA 1: Consignaciones y Gastos (uno al lado del otro)
        tabla_fila1 = Table(
            [[bloque_consignaciones, bloque_gastos]], 
            colWidths=[ancho_columna, ancho_columna],
            hAlign='CENTER' # Centra la tabla entera en la página
        )

        tabla_fila1.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'), # Crucial: Centra el contenido de las celdas
        ]))
        
        self.elements.append(tabla_fila1)
        self.elements.append(Spacer(1, 20))


        # 5. BLOQUE 2: Devoluciones (Centrado debajo)
        tabla_fila2 = Table(
            [[bloque_devoluciones]], 
            colWidths=[ancho_util], # Columna única que usa todo el ancho disponible
            hAlign='CENTER'
        )
        
        tabla_fila2.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'), # Crucial: Centra el contenido de la celda
        ]))
        
        self.elements.append(tabla_fila2)
        self.elements.append(Spacer(1, 20))
    # ====================================================================
    # FIN FUNCIÓN DE IMÁGENES CORREGIDA
    # ====================================================================


    def generar_pdf(self, data):
        gastos = data.get("gastos", [])
        consignaciones = data.get("consignaciones", [])
        imagenes_gastos = data.get("imagenesGastos", [])
        imagenes_consignaciones = data.get("imagenesConsignaciones", [])
        imagenes_devoluciones = data.get("imagenesDevoluciones", [])

        doc = SimpleDocTemplate(
            self.filename,
            pagesize=landscape(letter),
            leftMargin=40,
            rightMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        self.header()
        self.tabla_consignaciones(consignaciones)
        self.tabla_gastos(gastos)
        self.tabla_balance(gastos, consignaciones)
        # Se llama a la función corregida
        self.seccion_imagenes_sidebyside(imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones)

        self._borrar_imagenes_temp(imagenes_gastos + imagenes_consignaciones + imagenes_devoluciones)
        doc.build(self.elements)
        
    def _borrar_imagenes_temp(self, rutas):
        """Función auxiliar para borrar las imágenes decodificadas"""
        for ruta in rutas:
            try:
                os.remove(ruta)
            except Exception:
                pass


def generar_pdf_gasto(gasto_data_formateado, calculos, imagenes, nombre_pdf):
    """
    Función principal llamada desde routes_excel.py
    Retorna (exito, pdf_bytes)
    """
    rutas_temp_generadas = [] 

    try:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp_path = tmp.name
        tmp.close()
        # Aseguramos que se borre el PDF temporal
        rutas_temp_generadas.append(tmp_path) 

        if isinstance(gasto_data_formateado, list):
            gastos = gasto_data_formateado
            consignaciones = []
        else:
            gastos = gasto_data_formateado.get("gastos", [])
            consignaciones = gasto_data_formateado.get("consignaciones", [])

        def decodificar_y_guardar(lista_base64):
            rutas = []
            for b64_str in lista_base64:
                ruta = guardar_imagen_base64_temp(b64_str)
                if ruta:
                    rutas.append(ruta)
            return rutas

        imagenes_dict = {}
        if isinstance(imagenes, dict):
            imagenes_dict = imagenes
        
        # 1. Decodificar y guardar las imágenes de Gastos
        imagenes_gastos_b64 = imagenes_dict.get("imagenesGastos", [])
        logger.info(f"Recibidas {len(imagenes_gastos_b64)} imágenes para Gastos")
        imagenes_gastos = decodificar_y_guardar(imagenes_gastos_b64)
        # NO AGREGAMOS LAS IMÁGENES A rutas_temp_generadas aquí, la clase PDFGastoSideBySide se encarga
        
        # 2. Decodificar y guardar las imágenes de Consignaciones
        imagenes_consignaciones_b64 = imagenes_dict.get("imagenesConsignaciones", [])
        logger.info(f"Recibidas {len(imagenes_consignaciones_b64)} imágenes para Consignaciones")
        imagenes_consignaciones = decodificar_y_guardar(imagenes_consignaciones_b64)
        
        # 3. Decodificar y guardar las imágenes de Devoluciones
        imagenes_devoluciones_b64 = imagenes_dict.get("imagenesDevoluciones", [])
        logger.info(f"Recibidas {len(imagenes_devoluciones_b64)} imágenes para Devoluciones")
        imagenes_devoluciones = decodificar_y_guardar(imagenes_devoluciones_b64)

        data = {
            "gastos": gastos,
            "consignaciones": consignaciones,
            "imagenesGastos": imagenes_gastos,
            "imagenesConsignaciones": imagenes_consignaciones,
            "imagenesDevoluciones": imagenes_devoluciones,
        }

        pdf = PDFGastoSideBySide(tmp_path)
        pdf.generar_pdf(data)

        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()

        logger.info(f"PDF generado exitosamente: {len(imagenes_gastos) + len(imagenes_consignaciones) + len(imagenes_devoluciones)} imágenes")
        return True, pdf_bytes

    except Exception as e:
        traceback.print_exc()
        logger.error(f"Error en generar_pdf_gasto: {e}")
        return False, None
        
    finally:
        # Solo necesitamos limpiar el archivo PDF temporal aquí, 
        # las imágenes las limpia el método _borrar_imagenes_temp
        for ruta in rutas_temp_generadas:
            try:
                os.remove(ruta)
            except Exception:
                pass