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
from datetime import datetime
import locale

# Asegurar formato de moneda local
try:
    locale.setlocale(locale.LC_ALL, "")
except:
    locale.setlocale(locale.LC_ALL, "en_US.UTF-8")


class PDFGasto:
    def __init__(self, filename):
        self.filename = filename
        self.elements = []
        self.styles = getSampleStyleSheet()
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
            alignment=0,
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
            data.append(
                [
                    fecha,
                    categoria,
                    descripcion,
                    self.formatear_moneda(monto),
                ]
            )

        # Fila total
        data.append(  # typo: ignore
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

        # Lógica contable según lo que definiste
        if total_gastos < total_consignaciones:
            vueltas_abrecar = total_consignaciones - total_gastos
            excedente_jg = 0
        else:
            vueltas_abrecar = 0
            excedente_jg = total_gastos - total_consignaciones

        data = [
            ["", "MONTO"],
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

        self.elements.append(Paragraph("BALANCE CONSIGNACIÓN Y GASTOS", self.estilo_subtitulo))
        self.elements.append(tabla)
        self.elements.append(Spacer(1, 20))

    def seccion_imagenes(self, imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones):
        """Muestra miniaturas de imágenes por categoría"""
        def build_imagenes(titulo, lista):
            self.elements.append(Paragraph(titulo, self.estilo_subtitulo))
            fila = []
            for idx, img_path in enumerate(lista):
                try:
                    img = Image(img_path, width=1.8 * inch, height=1.4 * inch)
                    fila.append(img)
                    if len(fila) == 4:
                        self.elements.append(Table([fila], hAlign="CENTER", spaceBefore=6))
                        fila = []
                except Exception as e:
                    print("Error cargando imagen:", e)
            if fila:
                self.elements.append(Table([fila], hAlign="CENTER"))
            self.elements.append(Spacer(1, 12))

        if imagenes_gastos:
            build_imagenes("Comprobantes de Gastos", imagenes_gastos)
        if imagenes_consignaciones:
            build_imagenes("Comprobantes de Consignaciones", imagenes_consignaciones)
        if imagenes_devoluciones:
            build_imagenes("Comprobantes de Devoluciones", imagenes_devoluciones)

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

        # Secciones del PDF
        self.header()
        self.tabla_gastos(gastos)
        self.tabla_balance(gastos, consignaciones)
        self.seccion_imagenes(imagenes_gastos, imagenes_consignaciones, imagenes_devoluciones)

        doc.build(self.elements)
        print(f"✅ PDF generado correctamente: {self.filename}")


# Ejemplo de uso directo
if __name__ == "__main__":
    data_demo = {
        "gastos": [
            {"fecha": "2025-10-12", "categoria": "Transporte", "descripcion": "Taxi aeropuerto", "monto": 45000},
            {"fecha": "2025-10-12", "categoria": "Alimentación", "descripcion": "Almuerzo equipo", "monto": 80000},
        ],
        "consignaciones": [
            {"fecha": "2025-10-12", "entregadoPor": "NEQUI", "descripcion": "Consignación principal", "monto": 120000},
        ],
        "imagenesGastos": [],
        "imagenesConsignaciones": [],
        "imagenesDevoluciones": [],
    }

    pdf = PDFGasto("demo_relacion_gastos.pdf")
    pdf.generar_pdf(data_demo)

import tempfile
import os
import io

def generar_pdf_gasto(gasto_data_formateado, calculos, imagenes, nombre_pdf):
    """
    Compatible con routes_excel.py
    Retorna (exito, pdf_bytes)
    """
    try:
        # Crear archivo temporal
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp_path = tmp.name
        tmp.close()

        # Preparar estructura esperada por PDFGasto
        data = {
            "gastos": gasto_data_formateado.get("gastos", []),
            "consignaciones": gasto_data_formateado.get("consignaciones", []),
            "imagenesGastos": imagenes.get("imagenesGastos", []),
            "imagenesConsignaciones": imagenes.get("imagenesConsignaciones", []),
            "imagenesDevoluciones": imagenes.get("imagenesDevoluciones", []),
            "calculos": calculos,
        }

        # Generar PDF
        pdf = PDFGasto(tmp_path)
        pdf.generar_pdf(data)

        # Leer PDF en memoria
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()

        # Limpiar archivo temporal
        try:
            os.remove(tmp_path)
        except Exception:
            pass

        return True, pdf_bytes

    except Exception as e:
        print(f"❌ Error generando PDF ({nombre_pdf}):", e)
        return False, None    
