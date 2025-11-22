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
    
# === IMPORTS NECESARIOS PARA FUENTES ===
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont, TTFError 
# =======================================

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# === CONFIGURACIÓN DE RUTAS Y REGISTRO DE FUENTES ===

# 1. Definir la base: la carpeta donde se encuentra este script (gasto_pdf_generator.py)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FONTS_DIR = os.path.join(SCRIPT_DIR, 'fonts') 

ROBOTO_REGULAR_PATH = os.path.join(FONTS_DIR, 'RobotoCondensed-Regular.ttf')
ROBOTO_BOLD_PATH = os.path.join(FONTS_DIR, 'RobotoCondensed-Bold.ttf')

FONTE_PRINCIPAL_BOLD = "Helvetica-Bold" 
FONTE_PRINCIPAL_REGULAR = "Helvetica"

try:
    # 2. Intentar registrar las fuentes. 
    pdfmetrics.registerFont(TTFont('Roboto-Cond', ROBOTO_REGULAR_PATH))
    pdfmetrics.registerFont(TTFont('Roboto-Cond-Bold', ROBOTO_BOLD_PATH))
    
    # 3. Si tiene éxito, actualizamos las variables de la fuente
    FONTE_PRINCIPAL_BOLD = "Roboto-Cond-Bold"
    FONTE_PRINCIPAL_REGULAR = "Roboto-Cond"
    logger.info("Fuentes Roboto Condensed registradas exitosamente.")

except (TTFError, FileNotFoundError) as e:
    # 4. Fallback: Si falla, la aplicación NO se rompe y usa fuentes por defecto
    logger.error(f"FALLO CRÍTICO DE FUENTE: No se pudo abrir el archivo de fuente en '{ROBOTO_REGULAR_PATH}'. {e}")
    logger.error("Asegúrese de que los archivos TTF estén en la carpeta 'core/fonts/'.")
    pass
# =========================================================================


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
        
        # --- ESTILOS USANDO LAS VARIABLES DE FUENTE ---
        self.estilo_titulo = ParagraphStyle(
            "Titulo",
            parent=self.styles["Heading1"],
            alignment=1,
            textColor=colors.HexColor("#1565C0"),
            fontName=FONTE_PRINCIPAL_BOLD, 
            fontSize=16,
            spaceAfter=12,
        )
        self.estilo_subtitulo = ParagraphStyle(
            "Subtitulo",
            parent=self.styles["Heading2"],
            alignment=1,
            textColor=colors.HexColor("#0D47A1"),
            fontName=FONTE_PRINCIPAL_BOLD, 
            fontSize=12,
            spaceAfter=8,
        )
        self.estilo_normal = ParagraphStyle(
            "Normal",
            parent=self.styles["BodyText"],
            fontName=FONTE_PRINCIPAL_REGULAR, 
            fontSize=10,
            leading=14,
        )
        self.estilo_titulo_seccion = ParagraphStyle(
            "TituloSeccion",
            parent=self.styles["Heading3"],
            alignment=1,
            textColor=colors.HexColor("#0D47A1"),
            fontName=FONTE_PRINCIPAL_BOLD, 
            fontSize=10,
            spaceAfter=4,
        )
        # ------------------------------------------------

    def formatear_moneda(self, valor):
        try:
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
            
            # Envolver la descripción en Paragraph para que haga salto de línea automático
            descripcion_paragraph = Paragraph(descripcion, self.estilo_normal)
            data.append([fecha, entregado_por, descripcion_paragraph, self.formatear_moneda(monto)])

        data.append([
            "", "", 
            Paragraph("<b>TOTAL CONSIGNADO</b>", self.estilo_normal),
            Paragraph(
                f"<b>{self.formatear_moneda(total_consignaciones)}</b>",
                ParagraphStyle("ValorTotal", parent=self.estilo_normal,
                    textColor=colors.HexColor("#1565C0"), alignment=2, fontName=FONTE_PRINCIPAL_REGULAR), 
            ),
        ])

        tabla = Table(data, colWidths=[1.2*inch, 1.8*inch, 3*inch, 1.2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), FONTE_PRINCIPAL_BOLD), 
            ("FONTNAME", (0, 1), (-1, -2), FONTE_PRINCIPAL_REGULAR), 
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
            # Envolver la descripción en Paragraph para que haga salto de línea automático
            descripcion_paragraph = Paragraph(descripcion, self.estilo_normal)
            data.append([fecha, categoria, descripcion_paragraph, self.formatear_moneda(monto)])

        data.append([ 
            "", "",
            Paragraph("<b>TOTAL GASTOS</b>", self.estilo_normal),
            Paragraph(
                f"<b>{self.formatear_moneda(total_gastos)}</b>",
                ParagraphStyle("ValorTotal", parent=self.estilo_normal,
                    textColor=colors.HexColor("#C62828"), alignment=2, fontName=FONTE_PRINCIPAL_REGULAR), 
            ),
        ])

        tabla = Table(data, colWidths=[1.2*inch, 1.5*inch, 3.5*inch, 1.2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), FONTE_PRINCIPAL_BOLD), 
            ("FONTNAME", (0, 1), (-1, -2), FONTE_PRINCIPAL_REGULAR), 
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
        
        # Separar consignaciones por origen del dinero
        consignaciones_empresa = [c for c in consignaciones if c.get("entregadoPor", "") != "DINERO DE JG (TÉCNICO)"]
        consignaciones_jg = [c for c in consignaciones if c.get("entregadoPor", "") == "DINERO DE JG (TÉCNICO)"]
        
        total_consignaciones_empresa = sum(float(c.get("monto", 0)) for c in consignaciones_empresa)
        total_consignaciones_jg = sum(float(c.get("monto", 0)) for c in consignaciones_jg)
        
        # Calcular balance para dinero de la empresa
        if total_gastos < total_consignaciones_empresa:
            vueltas_abrecar = total_consignaciones_empresa - total_gastos
            excedente_jg_empresa = 0
        else:
            vueltas_abrecar = 0
            excedente_jg_empresa = total_gastos - total_consignaciones_empresa
        
        # El dinero de JG siempre va a favor de JG
        excedente_jg_total = excedente_jg_empresa + total_consignaciones_jg

        data = [
            ["RESUMEN", "MONTO"],
            ["Total consignado", self.formatear_moneda(total_consignaciones)],
            ["Total gastos", self.formatear_moneda(total_gastos)],
            [
                "Vueltas a favor de ABRECAR",
                Paragraph(
                    f"<b>{self.formatear_moneda(vueltas_abrecar)}</b>",
                    ParagraphStyle("Abrecar", parent=self.estilo_normal,
                        textColor=colors.HexColor("#1565C0"), alignment=2, fontName=FONTE_PRINCIPAL_REGULAR), 
                ),
            ],
            [
                "Excedente a favor de JG",
                Paragraph(
                    f"<b>{self.formatear_moneda(excedente_jg_total)}</b>",
                    ParagraphStyle("JG", parent=self.estilo_normal,
                        textColor=colors.HexColor("#C62828"), alignment=2, fontName=FONTE_PRINCIPAL_REGULAR), 
                ),
            ],
        ]

        tabla = Table(data, colWidths=[4*inch, 2*inch])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
            ("FONTNAME", (0, 0), (-1, 0), FONTE_PRINCIPAL_BOLD), 
            ("FONTNAME", (0, 1), (0, -1), FONTE_PRINCIPAL_REGULAR), 
            ("ALIGN", (1, 1), (1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        self.elements.append(Paragraph("BALANCE FINAL", self.estilo_subtitulo))
        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))

    def seccion_imagenes_sidebyside(self, imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones):
        """
        Posiciona imágenes lado a lado.
        """
        
        # Agregar página si es necesario
        if self.elements:
            self.elements.append(PageBreak())
        
        self.elements.append(Paragraph("ARCHIVOS ADJUNTOS", self.estilo_subtitulo))
        self.elements.append(Spacer(1, 10))
        
        img_width = 0.95 * inch  # reducido para imágenes más angostas
        img_height = 1.6 * inch
        
        # ========== ROW 1: IZQUIERDA Y DERECHA ==========
        
        # Imágenes IZQUIERDA (Gastos)
        gastos_row = []
        for idx, img_path in enumerate(imagenes_gastos or []):
            try:
                img = Image(img_path, width=img_width, height=img_height)
                img.hAlign = 'CENTER'
                gastos_row.append(img)
            except Exception as e:
                logger.error(f"Error cargando imagen gasto: {e}")
                gastos_row.append(Paragraph(f"Error img {idx+1}", self.estilo_normal))
        
        # Imágenes DERECHA (Consignaciones)
        consignaciones_row = []
        for idx, img_path in enumerate(imagenes_consignaciones or []):
            try:
                img = Image(img_path, width=img_width, height=img_height)
                img.hAlign = 'CENTER'
                consignaciones_row.append(img)
            except Exception as e:
                logger.error(f"Error cargando imagen consignación: {e}")
                consignaciones_row.append(Paragraph(f"Error img {idx+1}", self.estilo_normal))
        
        # Si no hay imágenes en ninguna columna, mostrar mensaje
        if len(gastos_row) + len(consignaciones_row) == 0:
            self.elements.append(Paragraph("No se adjuntaron comprobantes de pago", self.estilo_normal))
            self.elements.append(Spacer(1, 20))
        else:
            # No rellenamos las listas con Spacers aquí; cada columna se gestiona y centra por separado
            pass
            
            # Crear los títulos
            titulo_gastos = Paragraph("SOPORTE DE PAGO DE GASTOS", self.estilo_titulo_seccion)
            titulo_consignaciones = Paragraph("ABRECAR DIO PARA MATERIALES", self.estilo_titulo_seccion)

            # Crear las tablas de imágenes para cada sección (3 por fila)
            # Usamos tablas anidadas por fila para poder centrar correctamente filas con 1, 2 o 3 imágenes.
            gap = 0.15 * inch
            image_col_w = img_width * 0.9
            max_row_width = image_col_w * 3 + gap * 2

            filas_gastos_nested = []
            if not gastos_row:
                # fila vacía con un placeholder centrado
                nested = Table([[Spacer(image_col_w, img_height)]], colWidths=[max_row_width], hAlign='CENTER')
                filas_gastos_nested.append([nested])
            else:
                # agrupar en filas de hasta 3
                fila_actual = []
                for img in gastos_row:
                    fila_actual.append(img)
                    if len(fila_actual) == 3:
                        # construir nested table para 3 imágenes con gutters
                        row = [fila_actual[0], Spacer(gap, img_height), fila_actual[1], Spacer(gap, img_height), fila_actual[2]]
                        nested = Table([row], colWidths=[image_col_w, gap, image_col_w, gap, image_col_w], hAlign='CENTER')
                        nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                        # envolver en una celda de ancho máximo para que quede centrado en la columna
                        wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                        wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                        filas_gastos_nested.append([wrapper])
                        fila_actual = []

                if fila_actual:
                    k = len(fila_actual)
                    if k == 1:
                        row = [fila_actual[0]]
                        nested = Table([row], colWidths=[image_col_w], hAlign='CENTER')
                    else:  # k == 2
                        # colocar las dos imágenes juntas (adjuntas) y centrar este bloque
                        row = [fila_actual[0], Spacer(gap, img_height), fila_actual[1]]
                        nested = Table([row], colWidths=[image_col_w, gap, image_col_w], hAlign='CENTER')

                    nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                    wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                    wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                    filas_gastos_nested.append([wrapper])

            tabla_gastos = Table(filas_gastos_nested, colWidths=[max_row_width], hAlign='CENTER')
            tabla_gastos.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0,0), (-1,-1), 6),
                ("RIGHTPADDING", (0,0), (-1,-1), 6),
                ("TOPPADDING", (0,0), (-1,-1), 6),
                ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ]))

            # Tabla derecha (Consignaciones) - mismo enfoque anidado que Gastos
            filas_consig_nested = []
            if not consignaciones_row:
                nested = Table([[Spacer(image_col_w, img_height)]], colWidths=[max_row_width], hAlign='CENTER')
                filas_consig_nested.append([nested])
            else:
                fila_actual = []
                for img in consignaciones_row:
                    fila_actual.append(img)
                    if len(fila_actual) == 3:
                        row = [fila_actual[0], Spacer(gap, img_height), fila_actual[1], Spacer(gap, img_height), fila_actual[2]]
                        nested = Table([row], colWidths=[image_col_w, gap, image_col_w, gap, image_col_w], hAlign='CENTER')
                        nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                        wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                        wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                        filas_consig_nested.append([wrapper])
                        fila_actual = []

                if fila_actual:
                    k = len(fila_actual)
                    if k == 1:
                        row = [fila_actual[0]]
                        nested = Table([row], colWidths=[image_col_w], hAlign='CENTER')
                    else:  # k == 2
                        row = [fila_actual[0], Spacer(gap, img_height), fila_actual[1]]
                        nested = Table([row], colWidths=[image_col_w, gap, image_col_w], hAlign='CENTER')

                    nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                    wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                    wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                    filas_consig_nested.append([wrapper])

            tabla_consig = Table(filas_consig_nested, colWidths=[max_row_width], hAlign='CENTER')
            tabla_consig.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0,0), (-1,-1), 6),
                ("RIGHTPADDING", (0,0), (-1,-1), 6),
                ("TOPPADDING", (0,0), (-1,-1), 6),
                ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ]))
            
            # Crear una tabla que combine las dos secciones lado a lado
            combined_data = [[titulo_gastos, titulo_consignaciones],
                           [tabla_gastos, tabla_consig]]
            
            tabla_combinada = Table(combined_data,
                                  colWidths=[4*inch, 4*inch],
                                  hAlign='CENTER')
            tabla_combinada.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            
            self.elements.append(tabla_combinada)
            
            self.elements.append(Spacer(1, 20))
        
        # ========== ROW 2: DEVOLUCIONES (CENTRADO ABAJO) ==========
        
        if imagenes_devoluciones:
            self.elements.append(Paragraph("SOPORTE DEVOLUCIÓN VUELTAS PARA ABRECAR", self.estilo_titulo_seccion))  # Ahora centrado por el estilo
            self.elements.append(Spacer(1, 6))

            devoluciones_row = []
            for idx, img_path in enumerate(imagenes_devoluciones):
                try:
                    img = Image(img_path, width=img_width, height=img_height)
                    img.hAlign = 'CENTER'
                    devoluciones_row.append(img)
                except Exception as e:
                    logger.error(f"Error cargando imagen devolución: {e}")
                    devoluciones_row.append(Paragraph(f"Error img {idx+1}", self.estilo_normal))

            # Usar mismo enfoque anidado que para las columnas superiores: permite centrar 1 o 2 imágenes
            gap = 0.15 * inch
            image_col_w = img_width * 0.9
            max_row_width = image_col_w * 3 + gap * 2

            filas_dev_nested = []
            if not devoluciones_row:
                nested = Table([[Spacer(image_col_w, img_height)]], colWidths=[max_row_width], hAlign='CENTER')
                filas_dev_nested.append([nested])
            else:
                fila_actual = []
                for img in devoluciones_row:
                    fila_actual.append(img)
                    if len(fila_actual) == 3:
                        row = [fila_actual[0], Spacer(gap, img_height), fila_actual[1], Spacer(gap, img_height), fila_actual[2]]
                        nested = Table([row], colWidths=[image_col_w, gap, image_col_w, gap, image_col_w], hAlign='CENTER')
                        nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                        wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                        wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                        filas_dev_nested.append([wrapper])
                        fila_actual = []

                if fila_actual:
                    k = len(fila_actual)
                    if k == 1:
                        nested = Table([[fila_actual[0]]], colWidths=[image_col_w], hAlign='CENTER')
                    else:  # k == 2
                        nested = Table([[fila_actual[0], Spacer(gap, img_height), fila_actual[1]]], colWidths=[image_col_w, gap, image_col_w], hAlign='CENTER')

                    nested.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
                    wrapper = Table([[nested]], colWidths=[max_row_width], hAlign='CENTER')
                    wrapper.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER")]))
                    filas_dev_nested.append([wrapper])

            tabla_devoluciones = Table(filas_dev_nested, colWidths=[max_row_width], hAlign='CENTER')
            tabla_devoluciones.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0,0), (-1,-1), 4),
                ("RIGHTPADDING", (0,0), (-1,-1), 4),
            ]))
            self.elements.append(tabla_devoluciones)

    def generar_pdf(self, data):
        # AQUI NO DEBEMOS BORRAR LAS IMÁGENES. ESO SE HACE EN EL 'FINALLY' DE generar_pdf_gasto.
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
        self.seccion_imagenes_sidebyside(imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones)
        
        # Línea de borrado de imágenes eliminada.
        doc.build(self.elements)
        
    # MÉTODO _borrar_imagenes_temp ELIMINADO DE LA CLASE
    

def generar_pdf_gasto(gasto_data_formateado, calculos, imagenes, nombre_pdf):
    """
    Función principal llamada desde routes_excel.py
    Retorna (exito, pdf_bytes)
    """
    logger.info(f"Iniciando generar_pdf_gasto con: gastos={len(gasto_data_formateado.get('gastos', []))}, consignaciones={len(gasto_data_formateado.get('consignaciones', []))}")
    logger.info(f"Imágenes recibidas: {imagenes}")
    rutas_temp_generadas = [] 

    try:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp_path = tmp.name
        tmp.close()
        rutas_temp_generadas.append(tmp_path) 

        # --- Obtener Gastos y Consignaciones ---
        if isinstance(gasto_data_formateado, list):
            gastos = gasto_data_formateado
            consignaciones = []
        else:
            gastos = gasto_data_formateado.get("gastos", [])
            consignaciones = gasto_data_formateado.get("consignaciones", [])

        # --- Funciones de Manejo de Imágenes ---
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
        
        # Decodificar y guardar GASTOS
        imagenes_gastos_b64 = imagenes_dict.get("imagenesGastos", [])
        logger.info(f"Recibidas {len(imagenes_gastos_b64)} imágenes para Gastos")
        imagenes_gastos = decodificar_y_guardar(imagenes_gastos_b64)
        rutas_temp_generadas.extend(imagenes_gastos) # <--- AÑADIDO A LA LISTA DE BORRADO FINAL
        
        # Decodificar y guardar CONSIGNACIONES
        imagenes_consignaciones_b64 = imagenes_dict.get("imagenesConsignaciones", [])
        logger.info(f"Recibidas {len(imagenes_consignaciones_b64)} imágenes para Consignaciones")
        imagenes_consignaciones = decodificar_y_guardar(imagenes_consignaciones_b64)
        rutas_temp_generadas.extend(imagenes_consignaciones) # <--- AÑADIDO A LA LISTA DE BORRADO FINAL
        
        # Decodificar y guardar DEVOLUCIONES
        imagenes_devoluciones_b64 = imagenes_dict.get("imagenesDevoluciones", [])
        logger.info(f"Recibidas {len(imagenes_devoluciones_b64)} imágenes para Devoluciones")
        imagenes_devoluciones = decodificar_y_guardar(imagenes_devoluciones_b64)
        rutas_temp_generadas.extend(imagenes_devoluciones) # <--- AÑADIDO A LA LISTA DE BORRADO FINAL

        data = {
            "gastos": gastos,
            "consignaciones": consignaciones,
            "imagenesGastos": imagenes_gastos,
            "imagenesConsignaciones": imagenes_consignaciones,
            "imagenesDevoluciones": imagenes_devoluciones,
        }

        # Generar PDF
        pdf = PDFGastoSideBySide(tmp_path)
        pdf.generar_pdf(data)

        # Leer PDF en memoria
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()

        logger.info(f"PDF generado exitosamente: {len(imagenes_gastos) + len(imagenes_consignaciones) + len(imagenes_devoluciones)} imágenes")
        return True, pdf_bytes

    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Error en generar_pdf_gasto: {e}")
        logger.error(f"Traceback completo: {error_trace}")
        print(f"ERROR en generar_pdf_gasto: {e}")
        print(f"Traceback: {error_trace}")
        return False, None
        
    finally:
        # AQUI SE GARANTIZA EL BORRADO DE TODOS LOS ARCHIVOS TEMPORALES CREADOS
        for ruta in rutas_temp_generadas:
            try:
                os.remove(ruta)
            except Exception:
                pass