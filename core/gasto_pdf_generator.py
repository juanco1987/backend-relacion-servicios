import io
import os
import tempfile
import locale
import traceback
import base64
from pathlib import Path
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image,
)

# Asegurar formato de moneda local
try:
    locale.setlocale(locale.LC_ALL, "")
except:
    locale.setlocale(locale.LC_ALL, "en_US.UTF-8")


# =========================================================================
# FUNCIÓN AUXILIAR PARA MANEJO DE IMÁGENES BASE64 (DECODIFICACIÓN)
# =========================================================================

def guardar_imagen_base64_temp(base64_data):
    """Decodifica una cadena Base64 y la guarda en un archivo temporal. Retorna la ruta."""
    if not isinstance(base64_data, str) or "," not in base64_data:
        return None 

    try:
        # Extraer header (para tipo de archivo) y data
        if "data:" in base64_data:
             header, encoded_data = base64_data.split(",", 1)
        else:
             # Si falta el header, asumimos que es una cadena Base64 pura (menos probable)
             encoded_data = base64_data
             header = ""
             
        data = base64.b64decode(encoded_data)
        
        # Determinar la extensión del archivo
        if 'image/jpeg' in header:
            extension = '.jpg'
        elif 'image/png' in header:
            extension = '.png'
        else:
            # Si el tipo no es claro, usamos png por defecto ya que tu JSON indica png
            extension = '.png'

        # Crear un archivo temporal
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
        temp_file.close() # Cerrar el descriptor para que otros procesos puedan acceder
        
        with open(temp_file.name, 'wb') as f:
            f.write(data)
            
        print(f"DEBUG: Imagen temporal creada en: {temp_file.name}") # <- LÍNEA DE DEBUG CLAVE
        return temp_file.name
    except Exception as e:
        print(f"ERROR CRÍTICO decodificando Base64: {e}. Data: {base64_data[:50]}...")
        return None


# =========================================================================
# CLASE PDF GASTO
# =========================================================================

class PDFGasto:
    def __init__(self, filename):
        self.filename = filename
        self.elements = []
        self.styles = getSampleStyleSheet()
        
        # --- ESTILOS ---
        self.estilo_titulo = ParagraphStyle(
            "Titulo",
            parent=self.styles["Heading1"],
            alignment=1,
            textColor=colors.HexColor("#1565C0"),
            fontName="Helvetica-Bold",
            fontSize=16,
            spaceAfter=12,
        )
        self.estilo_subtitulo = ParagraphStyle(
            "Subtitulo",
            parent=self.styles["Heading2"],
            alignment=1,
            textColor=colors.HexColor("#0D47A1"),
            fontName="Helvetica-Bold",
            fontSize=12,
            spaceAfter=8,
        )
        self.estilo_normal = ParagraphStyle(
            "Normal",
            parent=self.styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
        )
        # Estilo para títulos de imagen
        self.estilo_imagen_titulo = ParagraphStyle(
            "ImagenTitulo",
            parent=self.styles["Heading3"],
            alignment=1,
            textColor=colors.HexColor("#0D47A1"),
            fontName="Helvetica-Bold",
            fontSize=11,
            spaceAfter=6,
        )

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
        """Dibuja la tabla con todas las consignaciones registradas, incluyendo el tipo."""
        self.elements.append(Paragraph("BALANCE CONSIGNACIÓN Y GASTOS (Detalle de Consignaciones)", self.estilo_subtitulo))

        # Se agregó la columna "Entregado o Transferido" usando 'entregadoPor'
        data = [["Fecha", "Entregado o Transferido", "Descripción (Nota)", "Valor"]]
        total_consignaciones = 0
        for c in consignaciones:
            fecha = c.get("fecha", "")
            entregado_por = c.get("entregadoPor", "N/A") # USANDO EL CAMPO CORRECTO
            descripcion = c.get("descripcion", "") 
            monto = float(c.get("monto", 0))
            total_consignaciones += monto
            
            data.append([fecha, entregado_por, descripcion, self.formatear_moneda(monto)])

        # Fila total
        data.append(
            [
                "",
                "", 
                Paragraph("<b>TOTAL CONSIGNADO</b>", self.estilo_normal),
                Paragraph(
                    f"<b>{self.formatear_moneda(total_consignaciones)}</b>",
                    ParagraphStyle(
                        "ValorTotal",
                        parent=self.estilo_normal,
                        textColor=colors.HexColor("#1565C0"),
                        alignment=2,
                    ),
                ),
            ]
        )

        # Se ajustó el ancho de las columnas (ahora son 4)
        tabla = Table(data, colWidths=[1.3 * inch, 2.0 * inch, 3.2 * inch, 1.3 * inch])
        tabla.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (-1, 1), (-1, -1), "RIGHT"),
                    ("ALIGN", (1, 1), (1, -1), "CENTER"),
                    ("ALIGN", (0, 0), (0, -1), "LEFT"),
                    ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#90CAF9")),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )

        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))
        
        return total_consignaciones


    def tabla_gastos(self, gastos):
        """Dibuja la tabla con todos los gastos registrados"""
        data = [["Fecha", "Categoría", "Descripción", "Valor"]]

        total_gastos = 0
        for g in gastos:
            fecha = g.get("fecha", "")
            categoria = g.get("categoria", "")
            descripcion = g.get("descripcion", "")
            monto = float(g.get("monto", 0))
            total_gastos += monto
            data.append([fecha, categoria, descripcion, self.formatear_moneda(monto)])

        # Fila total
        data.append(  # type: ignore
            [
                "",
                "",
                Paragraph("<b>TOTAL GASTOS</b>", self.estilo_normal),
                Paragraph(
                    f"<b>{self.formatear_moneda(total_gastos)}</b>",
                    ParagraphStyle(
                        "ValorTotal",
                        parent=self.estilo_normal,
                        textColor=colors.HexColor("#C62828"),
                        alignment=2,
                    ),
                ),
            ]
        )

        # Estilo visual de la tabla
        tabla = Table(data, colWidths=[1.3 * inch, 1.5 * inch, 4.5 * inch, 1.3 * inch])
        tabla.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                    ("ALIGN", (0, 0), (1, -1), "LEFT"),
                    ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#90CAF9")),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )

        self.elements.append(Paragraph("GASTOS REGISTRADOS", self.estilo_subtitulo))
        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))

        return total_gastos

    def tabla_balance(self, gastos, consignaciones):
        """Calcula totales y genera tabla de balance"""
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
                    ParagraphStyle(
                        "Abrecar",
                        parent=self.estilo_normal,
                        textColor=colors.HexColor("#1565C0"),
                        alignment=2,
                    ),
                ),
            ],
            [
                "Excedente a favor de JG",
                Paragraph(
                    f"<b>{self.formatear_moneda(excedente_jg)}</b>",
                    ParagraphStyle(
                        "JG",
                        parent=self.estilo_normal,
                        textColor=colors.HexColor("#C62828"),
                        alignment=2,
                    ),
                ),
            ],
        ]

        tabla = Table(data, colWidths=[4 * inch, 2 * inch])
        tabla.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3F2FD")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )

        self.elements.append(Paragraph("BALANCE CONSIGNACIÓN Y GASTOS (Resumen)", self.estilo_subtitulo))
        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))

    def seccion_imagenes(self, imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones):
        """Muestra miniaturas de imágenes por categoría con los títulos solicitados."""
        
        # Función auxiliar para construir la sección de imágenes
        def build_imagenes(titulo, lista):
            self.elements.append(Paragraph(titulo, self.estilo_imagen_titulo))
            self.elements.append(Spacer(1, 6))
            
            fila = []
            img_width = 1.8 * inch  
            img_height = 1.4 * inch 

            if not lista:
                 self.elements.append(Paragraph("No se adjuntaron comprobantes para esta sección.", self.estilo_normal))
            
            content_row = []

            for idx, img_path in enumerate(lista):
                try:
                    img = Image(img_path, width=img_width, height=img_height)
                    img.hAlign = 'CENTER'
                    content_row.append(img)
                    
                    if len(content_row) == 4: 
                        self.elements.append(Table([content_row], hAlign="CENTER", spaceBefore=6))
                        content_row = []
                except Exception as e:
                    error_text = Paragraph(
                        f"ERROR: No se pudo cargar la imagen desde la ruta temporal: {img_path}",
                        ParagraphStyle(
                            "ErrorImage",
                            parent=self.estilo_normal,
                            textColor=colors.red,
                            fontSize=8
                        )
                    )
                    content_row.append(error_text) 
                    
                    if len(content_row) == 4:
                        self.elements.append(Table([content_row], hAlign="CENTER", spaceBefore=6))
                        content_row = []


            if content_row:
                self.elements.append(Table([content_row], hAlign="CENTER"))
            
            self.elements.append(Spacer(1, 20))

        build_imagenes("ABRECAR DIO PARA MATERIALES", imagenes_consignaciones)
        build_imagenes("SOPORTE DE PAGOS DE MATERIALES", imagenes_gastos)
        build_imagenes("SOPORTE DEVOLUCIÓN VUELTAS PARA ABRECAR", imagenes_devoluciones)


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
        self.seccion_imagenes(imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones)

        doc.build(self.elements)
        # print(f"✅ PDF generado correctamente: {self.filename}") # Se evita este print para evitar duplicados


# =========================================================================
# FUNCIÓN DE ENTRADA (COMPATIBLE CON FLASK ROUTE)
# =========================================================================

def generar_pdf_gasto(gasto_data_formateado, calculos, imagenes, nombre_pdf):
    """
    Función principal llamada desde routes_excel.py
    Retorna (exito, pdf_bytes)
    """
    rutas_temp_generadas = [] 

    try:
        # Crear archivo temporal para el PDF
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp_path = tmp.name
        tmp.close()
        rutas_temp_generadas.append(tmp_path) 

        # --- Detección de gastos y consignaciones ---
        if isinstance(gasto_data_formateado, list):
            gastos = gasto_data_formateado
            consignaciones = []
        else:
            gastos = gasto_data_formateado.get("gastos", [])
            consignaciones = gasto_data_formateado.get("consignaciones", [])

        # --- FUNCIÓN AUXILIAR DE DECODIFICACIÓN ---
        def decodificar_y_guardar(lista_base64):
            rutas = []
            for b64_str in lista_base64:
                ruta = guardar_imagen_base64_temp(b64_str)
                if ruta:
                    rutas.append(ruta)
            return rutas

        # --- Detección y DECODIFICACIÓN de imágenes BASE64 ---
        imagenes_dict = {}
        if isinstance(imagenes, dict):
            imagenes_dict = imagenes
        
        # 1. Decodificar y guardar: Gastos
        imagenes_gastos_b64 = imagenes_dict.get("imagenesGastos", [])
        imagenes_gastos = decodificar_y_guardar(imagenes_gastos_b64)
        rutas_temp_generadas.extend(imagenes_gastos)
        
        # 2. Decodificar y guardar: Consignaciones
        imagenes_consignaciones_b64 = imagenes_dict.get("imagenesConsignaciones", [])
        imagenes_consignaciones = decodificar_y_guardar(imagenes_consignaciones_b64)
        rutas_temp_generadas.extend(imagenes_consignaciones)
        
        # 3. Decodificar y guardar: Devoluciones
        imagenes_devoluciones_b64 = imagenes_dict.get("imagenesDevoluciones", [])
        imagenes_devoluciones = decodificar_y_guardar(imagenes_devoluciones_b64)
        rutas_temp_generadas.extend(imagenes_devoluciones)


        # --- Estructura de datos final para el PDF ---
        data = {
            "gastos": gastos,
            "consignaciones": consignaciones,
            "imagenesGastos": imagenes_gastos, # Ahora contiene RUTAS TEMPORALES
            "imagenesConsignaciones": imagenes_consignaciones, # Ahora contiene RUTAS TEMPORALES
            "imagenesDevoluciones": imagenes_devoluciones, # Ahora contiene RUTAS TEMPORALES
            "calculos": calculos,
        }

        # --- Generar PDF ---
        pdf = PDFGasto(tmp_path)
        pdf.generar_pdf(data)

        # --- Leer PDF en memoria ---
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()

        return True, pdf_bytes

    except Exception as e:
        traceback.print_exc()
        print(f"❌ Error grave al generar el PDF ({nombre_pdf}):", e)
        return False, None
        
    finally:
        # --- Limpiar TODOS los archivos temporales (PDF e Imágenes) ---
        for ruta in rutas_temp_generadas:
            try:
                os.remove(ruta)
            except Exception:
                pass