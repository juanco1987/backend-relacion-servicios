import os
import datetime
from fpdf import FPDF
import pandas as pd
from utils.date_utils import  fecha_larga
import base64
import io

# === CLASE PARA PDF (ORIGINAL RESTAURADO) ===
class PDF(FPDF):
    def header(self):
        # Configurar la fuente y colores del encabezado
        self.set_font("Helvetica", 'B', 16)
        self.set_text_color(50, 50, 50)
        # Título centrado en negrita
        self.cell(0, 12, "Relación de Servicios Juan Gabriel - Pagos en Efectivo", ln=True, align="C")
        # Línea después del encabezado
        self.set_draw_color(100, 100, 100)
        self.line(10, 22, self.w - 10, 22)
        self.ln(12)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", 'I', 8)
        self.set_text_color(100, 100, 100)
        # Añadir fecha de generación
        fecha_actual = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        self.cell(0, 5, f'Generado el: {fecha_actual}', align="L")
        self.ln(5)
        # Añadir número de página
        self.cell(0, 5, f'Página {self.page_no()} de {{nb}}', align="C")
        self.set_font("Helvetica", '', 8)
        self.set_text_color(0, 0, 0)

    def tabla_servicios(self, df, notas=None, fecha_inicio_analisis=None, fecha_fin_analisis=None, imagenes=None):
        # Ajuste de anchos de columna
        ancho_fecha = 22
        ancho_direccion = 50
        ancho_servicio = 45
        ancho_materiales = 30
        ancho_valor_materiales = 25
        ancho_valor = 25
        ancho_subtotal = 25
        ancho_iva = 20
        ancho_total = 28

        # Altura base por línea (para multi_cell)
        altura_linea = 6

        # Colores para la tabla
        color_encabezado_bg = (200, 220, 230) # Gris azulado suave
        color_fila_impar_bg = (230, 230, 230) # Gris muy claro
        color_fila_par_bg = (255, 255, 255) # Blanco
        color_borde = (100, 100, 100) # Gris oscuro
        color_texto = (0, 0, 0) # Negro
        color_totales_bg = (180, 200, 210) # Tono ligeramente más oscuro que el encabezado

        # Configurar estilos
        self.set_fill_color(*color_fila_par_bg)
        self.set_text_color(*color_texto)
        self.set_draw_color(*color_borde)
        self.set_line_width(0.2)

        # Encabezado de la tabla
        self.set_font("Helvetica", 'B', 9)
        self.set_fill_color(*color_encabezado_bg)

        # Dibujar encabezados
        y_header_inicial = self.get_y()

        # Usamos cell para encabezados de una línea y multi_cell para los que necesitan salto
        self.cell(ancho_fecha, altura_linea * 2, "Fecha", 1, 0, 'C', True)
        self.cell(ancho_direccion, altura_linea * 2, "Dirección", 1, 0, 'C', True)
        self.cell(ancho_servicio, altura_linea * 2, "Servicio", 1, 0, 'C', True)
        self.cell(ancho_materiales, altura_linea * 2, "Materiales", 1, 0, 'C', True)
        self.cell(ancho_valor_materiales, altura_linea * 2, "Valor Mat.", 1, 0, 'C', True)
        self.cell(ancho_valor, altura_linea * 2, "Valor Servicio", 1, 0, 'C', True)

        # Encabezado Subtotal ABRECAR con salto de línea forzado
        x_subtotal_header = self.get_x()
        self.multi_cell(ancho_subtotal, altura_linea, "Subtotal\nABRECAR", 1, 'C', True)
        # Volver a la posición Y inicial del encabezado para la siguiente celda
        self.set_xy(x_subtotal_header + ancho_subtotal, y_header_inicial)

        # Celdas de encabezado restantes
        self.cell(ancho_iva, altura_linea * 2, "IVA", 1, 0, 'C', True)
        self.cell(ancho_total, altura_linea * 2, "Total\nABRECAR", 1, 1, 'C', True) # ln=1 para ir a la siguiente línea después del encabezado

        self.set_font("Helvetica", '', 8)
        fill = False
        subtotal_sum = 0
        total_sum = 0

        # Filas de datos
        for index, row in df.iterrows():
            # Alternar color de fondo
            bg_color = color_fila_impar_bg if fill else color_fila_par_bg
            self.set_fill_color(*bg_color)

            # Preparar datos
            fecha_str = row['FECHA'].strftime("%d/%m/%Y") if pd.notnull(row['FECHA']) else "-"
            direccion = str(row['DIRECCION_PARA_INFORME']).replace('\n', ' ').replace('\r', ' ').strip()
            servicio = str(row['SERVICIO_PARA_INFORME']).replace('\n', ' ').replace('\r', ' ').strip()
            materiales = str(row['MATERIALES']).replace('\n', ' ').replace('\r', ' ').strip()
            if materiales.lower() == 'nan' or materiales == '':
                materiales = "-"

            # Procesar valores monetarios
            valor_materiales = row['VALOR MATERIALES'] if 'VALOR MATERIALES' in row and pd.notnull(row['VALOR MATERIALES']) else 0
            try:
                valor_materiales = float(str(valor_materiales).replace('$', '').replace(',', '').strip())
            except:
                valor_materiales = 0
            valor_materiales_str = f"$ {valor_materiales:,.0f}".replace(',', '.') if valor_materiales > 0 else "-"

            valor_servicio_original = row['VALOR_ORIGINAL'] if 'VALOR_ORIGINAL' in row else 0
            try:
                valor_servicio_original = float(str(valor_servicio_original).replace('$', '').replace(',', '').strip())
            except:
                valor_servicio_original = 0

            valor_servicio_neto = max(0, valor_servicio_original - valor_materiales)
            valor_original_str = f"$ {valor_servicio_neto:,.0f}".replace(',', '.') if valor_servicio_neto > 0 else "-"

            subtotal = valor_servicio_neto * 0.5
            subtotal_sum += subtotal
            subtotal_str = f"$ {subtotal:,.0f}".replace(',', '.')

            # Procesar valor de IVA de forma robusta
            iva = 0.0
            if 'IVA' in df.columns and pd.notnull(row['IVA']): # Se quita .any() aquí
                try:
                    iva = float(str(row['IVA']).replace('$', '').replace(',', '').strip())
                except ValueError:
                    iva = 0.0
            iva_str = f"$ {iva:,.0f}".replace(',', '.') if iva > 0 else "-"

            total = subtotal + iva
            total_sum += total
            total_str = f"$ {total:,.0f}".replace(',', '.')

            # --- Cálculo de altura de fila basado en contenido ---
            self.set_font("Helvetica", '', 8) # Asegurar la fuente y tamaño correctos para el cálculo

            # Altura base mínima por línea
            altura_base_linea = altura_linea

            # Pre-calcular la altura necesaria para cada celda que podría ser multi-línea
            offset_ancho_calculo = 1 # Un pequeño offset para el cálculo en el cálculo de lineas

            # Calcular las líneas para cada columna multi-línea
            lineas_direccion = self.multi_cell(ancho_direccion - offset_ancho_calculo, altura_base_linea, direccion, border=0, align='C', split_only=True)
            lineas_servicio = self.multi_cell(ancho_servicio - offset_ancho_calculo, altura_base_linea, servicio, border=0, align='C', split_only=True)
            lineas_materiales = self.multi_cell(ancho_materiales - offset_ancho_calculo, altura_base_linea, materiales, border=0, align='C', split_only=True)

            # Calcular la altura máxima requerida por el contenido multi-línea
            altura_multicell_max = max(len(lineas_direccion), len(lineas_servicio), len(lineas_materiales)) * altura_base_linea

            # La altura final de la fila es la máxima entre la altura base y la altura calculada por multi_cell
            altura_fila = max(altura_base_linea, altura_multicell_max)

            # Asegurar que la altura mínima sea al menos altura_base_linea si hay contenido en la fila
            if altura_fila < altura_base_linea and any(texto.strip() for texto in [direccion, servicio, materiales, fecha_str, valor_materiales_str, valor_original_str, subtotal_str, iva_str, total_str]):
                 altura_fila = altura_base_linea
            # Si no hay contenido relevante que fuerce multi_cell, asegurar altura base
            elif altura_fila == altura_base_linea and not any(texto.strip() for texto in [direccion, servicio, materiales]):
                 altura_fila = altura_base_linea


            # --- Salto de página si es necesario (usando la altura_fila calculada) ---
            if self.get_y() + altura_fila > self.h - 15: # 15 es un margen inferior, ajustado para pie de página
                self.add_page()
                # Redibujar encabezado en nueva página
                self.set_font("Helvetica", 'B', 9)
                self.set_fill_color(*color_encabezado_bg)
                y_header_inicial = self.get_y() # Actualizar la posición Y del encabezado en la nueva página

                # Dibujar encabezados (misma lógica que al inicio)
                self.cell(ancho_fecha, altura_linea * 2, "Fecha", 1, 0, 'C', True)
                self.cell(ancho_direccion, altura_linea * 2, "Dirección", 1, 0, 'C', True)
                self.cell(ancho_servicio, altura_linea * 2, "Servicio", 1, 0, 'C', True)
                self.cell(ancho_materiales, altura_linea * 2, "Materiales", 1, 0, 'C', True)
                self.cell(ancho_valor_materiales, altura_linea * 2, "Valor Mat.", 1, 0, 'C', True)
                self.cell(ancho_valor, altura_linea * 2, "Valor Servicio", 1, 0, 'C', True)

                # Encabezado Subtotal ABRECAR
                x_subtotal_header = self.get_x()
                self.multi_cell(ancho_subtotal, altura_linea, "Subtotal\nABRECAR", 1, 'C', True)
                self.set_xy(x_subtotal_header + ancho_subtotal, y_header_inicial) # Volver a la posición para la siguiente celda

                self.cell(ancho_iva, altura_linea * 2, "IVA", 1, 0, 'C', True)
                self.cell(ancho_total, altura_linea * 2, "Total\nABRECAR", 1, 1, 'C', True)

                self.set_font("Helvetica", '', 8)
                # Usar el color de fondo de la fila actual para la nueva página
                self.set_fill_color(*bg_color)
                # El borde superior de la primera fila en la nueva página se dibujará con el borde de la celda


            # --- Dibujar fila: Contenido y Bordes ---
            x_pos_inicial = self.get_x()
            y_pos_inicial = self.get_y()

            # Configurar color de relleno para las celdas
            self.set_fill_color(*bg_color)
            self.set_text_color(*color_texto) # Asegurar color de texto normal

            # Lista de datos de la fila en el orden de las columnas
            datos_fila_ordenados = [
                fecha_str,
                direccion,
                servicio,
                materiales,
                valor_materiales_str,
                valor_original_str,
                subtotal_str,
                iva_str,
                total_str
            ]
            anchos_columnas_ordenados = [
                ancho_fecha, ancho_direccion, ancho_servicio, ancho_materiales,
                ancho_valor_materiales, ancho_valor, ancho_subtotal, ancho_iva, ancho_total
            ]
            # Identificar qué columnas usan multi_cell para el contenido (requieren ajuste de texto)
            usar_multicell_contenido = [
                False, # Fecha
                True,  # Dirección
                True,  # Servicio
                True,  # Materiales
                False, # Valor Mat.
                False, # Valor Servicio
                False, # Subtotal ABRECAR
                False, # IVA
                False  # Total ABRECAR
            ]

            # Verificar que todas las listas tengan la misma longitud
            if not (len(datos_fila_ordenados) == len(anchos_columnas_ordenados) == len(usar_multicell_contenido)):
                # Esto no debería ocurrir si las listas están definidas correctamente, pero es una seguridad
                raise ValueError("Las listas de datos, anchos y configuración de multi_cell deben tener la misma longitud")

            current_x = x_pos_inicial

            # Dibujar el contenido de cada celda con centrado vertical
            for i in range(len(datos_fila_ordenados)):
                texto = datos_fila_ordenados[i]
                ancho_columna = anchos_columnas_ordenados[i]
                usar_multicell = usar_multicell_contenido[i]

                # Calcular la altura real del contenido de esta celda
                content_height = altura_base_linea # Altura por defecto para celdas simples
                if usar_multicell:
                    # Recalcular líneas para esta celda específica para obtener su altura real.
                    # Usamos el ancho original de la columna para el cálculo de contenido y el offset.
                    # Añadimos un pequeño factor de corrección si es necesario.
                    try:
                        lines = self.multi_cell(ancho_columna - offset_ancho_calculo, altura_base_linea, texto, border=0, align='C', split_only=True)
                        content_height = len(lines) * altura_base_linea
                        # Asegurar que si hay texto, la altura sea al menos la base
                        if content_height < altura_base_linea and texto.strip():
                             content_height = altura_base_linea
                        # Añadir un pequeño ajuste si el cálculo es 0 pero hay texto
                        if content_height == 0 and texto.strip():
                             content_height = altura_base_linea

                    except Exception as e:
                        # En caso de error en el cálculo de multi_cell, usar altura base
                        print(f"Error calculando líneas para multi_cell: {e} Texto: {texto}")
                        content_height = altura_base_linea

                # Calcular el offset vertical para centrar el contenido
                # Si la altura de la fila es mayor que la altura del contenido, calculamos el espacio sobrante
                y_offset_vertical = y_pos_inicial
                if altura_fila > content_height:
                     y_offset_vertical = y_pos_inicial + (altura_fila - content_height) / 2

                # Establecer la posición para dibujar el contenido
                self.set_xy(current_x, y_offset_vertical)

                # Dibujar el contenido de la celda (sin borde ni avance de línea)
                if usar_multicell:
                    # Al dibujar, usamos el ancho exacto de la columna
                    self.multi_cell(ancho_columna, altura_base_linea, texto, border=0, align='C', fill=True)
                else:
                    self.cell(ancho_columna, altura_base_linea, texto, border=0, ln=0, align='C', fill=True)

                # Mover la posición X para la siguiente celda de contenido
                current_x += ancho_columna

            # Después de dibujar todo el contenido de la fila, dibujar los bordes
            self.set_xy(x_pos_inicial, y_pos_inicial) 

            for i in range(len(anchos_columnas_ordenados)):
                ancho_columna = anchos_columnas_ordenados[i]
                # Dibujamos celdas vacías con la altura de fila completa y borde
                self.cell(ancho_columna, altura_fila, '', border=1, ln=0, fill=False) # fill=False para no dibujar el fondo de nuevo

            # Mover a la siguiente línea (siguiente fila) después de dibujar los bordes y bordes
            self.set_y(y_pos_inicial + altura_fila)

            # Alternar el estado de relleno para la próxima fila
            fill = not fill

        # Fila de totales
        self.ln(2)
        self.set_font("Helvetica", 'B', 10)
        self.set_fill_color(*color_totales_bg)
        # Ajustar la celda de TOTALES para que ocupe el ancho correcto antes de los valores
        ancho_celda_totales_texto = ancho_fecha + ancho_direccion + ancho_servicio + ancho_materiales + ancho_valor_materiales
        self.cell(ancho_celda_totales_texto, 10, "TOTALES", 1, 0, 'R', True)

        # Asegurarse de que la columna IVA exista antes de intentar acceder a ella y verificar nulos
        iva_sum = df['IVA'].sum() if 'IVA' in df.columns and not df['IVA'].empty else 0 

        # Recalcular el valor total neto sumando los valores netos calculados por fila
        valor_total_neto_sum = df.apply(lambda row: max(0, (row['VALOR_ORIGINAL'] if 'VALOR_ORIGINAL' in row and pd.notnull(row['VALOR_ORIGINAL']) else 0) - (row['VALOR MATERIALES'] if 'VALOR MATERIALES' in row and pd.notnull(row['VALOR MATERIALES']) else 0)), axis=1).sum()
      
        self.cell(ancho_valor, 10, f"$ {valor_total_neto_sum:,.0f}".replace(',', '.'), 1, 0, 'R', True) # Usar el nuevo total neto sumado
        self.cell(ancho_subtotal, 10, f"$ {subtotal_sum:,.0f}".replace(',', '.'), 1, 0, 'R', True)
        self.cell(ancho_iva, 10, f"$ {iva_sum:,.0f}".replace(',', '.'), 1, 0, 'R', True)
        self.cell(ancho_total, 10, f"$ {total_sum:,.0f}".replace(',', '.'), 1, 1, 'R', True)

        self.ln(5)
        self.set_font("Helvetica", '', 10)
        self.cell(0, 6, f"Total de servicios registrados: {len(df)}", 0, 1)
        if fecha_inicio_analisis and fecha_fin_analisis:
            self.cell(
                0, 6,
                f"Período analizado: {fecha_larga(fecha_inicio_analisis)} a {fecha_larga(fecha_fin_analisis)}",
                0, 1
            )
        elif not df.empty and 'FECHA' in df.columns and not df['FECHA'].empty:
            try:
                fecha_inicio_str = fecha_larga(df['FECHA'].min())
                fecha_fin_str = fecha_larga(df['FECHA'].max())
                self.cell(0, 6, f"Período analizado: {fecha_inicio_str} a {fecha_fin_str}", 0, 1)
            except Exception:
                self.cell(0, 6, f"Período analizado: {df['FECHA'].min().strftime('%d/%m/%Y')} al {df['FECHA'].max().strftime('%d/%m/%Y')}", 0, 1)
        else:
            self.cell(0, 6, "Período analizado: Sin datos", 0, 1)

        

        if imagenes and len(imagenes) > 0:
            print(f">>> Imagenes recibidas en PDF: {len(imagenes)}")  # DEBUG
            
            # Mostrar notas si existen
            if notas and notas.strip():
                self.ln(8)
                self.set_font("Helvetica", 'I', 10)
                self.set_text_color(50, 50, 50)
                self.multi_cell(0, 8, f"NOTAS:\n{notas.strip()}")
                self.set_text_color(0, 0, 0)

            # CONFIGURACIÓN PROFESIONAL FIJA
            img_width = 90   # Ancho fijo
            img_height = 70  # Alto fijo  
            margin_x = 15    # Margen horizontal entre imágenes
            margin_y = 15    # Margen vertical entre filas
            imagenes_por_fila = 2  # Máximo 2 por fila para que se vean bien
            espacio_etiqueta = 12   # Espacio para etiqueta debajo de cada imagen

            # Calcular dimensiones totales por fila
            ancho_fila = (img_width * imagenes_por_fila) + (margin_x * (imagenes_por_fila - 1))
            alto_por_fila = img_height + espacio_etiqueta

            # Verificar si cabe al menos una fila completa
            espacio_disponible_ancho = self.w - 40  # Márgenes laterales
            espacio_disponible_alto = self.h - self.get_y() - 20  # Margen inferior

            print(f"🔍 Total imágenes: {len(imagenes)}")
            print(f"🔍 Imágenes por fila: {imagenes_por_fila}")
            print(f"🔍 Filas necesarias: {(len(imagenes) + imagenes_por_fila - 1) // imagenes_por_fila}")

            # Si no cabe ni una fila, crear nueva página
            if (espacio_disponible_ancho < ancho_fila or 
                espacio_disponible_alto < alto_por_fila + 30):  # 30 para título
                print("⚠️ No hay suficiente espacio, creando nueva página...")
                self.add_page()

            # Agregar título de la sección
            self.set_font("Helvetica", 'B', 12)
            self.cell(0, 8, "SOPORTE DE PAGO DE LOS SERVICIOS", ln=True, align="L")
            self.ln(3)

            import tempfile, os, base64

            # Procesar TODAS las imágenes
            fila_actual = 0
            y_inicial_fila = self.get_y()

            for idx, img_b64 in enumerate(imagenes):
                try:
                    print(f"📸 Procesando imagen {idx + 1}/{len(imagenes)}")

                    # Calcular en qué fila y columna va esta imagen
                    fila = idx // imagenes_por_fila
                    columna = idx % imagenes_por_fila

                    # Si empezamos una nueva fila, verificar si cabe
                    if fila > fila_actual:
                        # Verificar si hay espacio para otra fila
                        espacio_restante = self.h - self.get_y() - 20
                        if espacio_restante < alto_por_fila + margin_y:
                            print(f"⚠️ No hay espacio para fila {fila + 1}, creando nueva página...")
                            self.add_page()
                            # Redibujar título en nueva página
                            self.set_font("Helvetica", 'B', 12)
                            self.cell(0, 8, "SOPORTE DE PAGO DE LOS SERVICIOS (Continuación)", ln=True, align="L")
                            self.ln(3)
                            y_inicial_fila = self.get_y()
                            fila_actual = fila
                        else:
                            # Mover a la siguiente fila en la misma página
                            y_inicial_fila = self.get_y() + margin_y
                            fila_actual = fila

                    # Calcular posición específica de esta imagen
                    start_x = 20  # Margen izquierdo fijo
                    x_pos = start_x + (columna * (img_width + margin_x))
                    y_pos = y_inicial_fila + ((fila - fila_actual) * (alto_por_fila + margin_y))

                    print(f"📍 Imagen {idx + 1}: Fila {fila + 1}, Columna {columna + 1} → Pos ({x_pos}, {y_pos})")

                    # Limpiar y decodificar imagen
                    if "," in img_b64:
                        img_b64 = img_b64.split(",")[1]

                    img_bytes = base64.b64decode(img_b64)

                    # Crear archivo temporal
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
                        tmp_file.write(img_bytes)
                        tmp_path = tmp_file.name

                    # Insertar imagen
                    self.image(tmp_path, x=x_pos, y=y_pos, w=img_width, h=img_height)

                    # Agregar borde profesional
                    self.set_draw_color(150, 150, 150)
                    self.set_line_width(0.3)
                    self.rect(x_pos, y_pos, img_width, img_height)

                    # Agregar etiqueta
                    self.set_xy(x_pos, y_pos + img_height + 2)
                    self.set_font("Helvetica", '', 9)
                    self.set_text_color(80, 80, 80)
                    self.cell(img_width, 4, f"Soporte {idx + 1}", align='C')

                    # Si es la última imagen de la fila, actualizar posición Y
                    if columna == imagenes_por_fila - 1 or idx == len(imagenes) - 1:
                        nueva_y = y_pos + alto_por_fila
                        if nueva_y > self.get_y():
                            self.set_y(nueva_y)

                    # Limpiar archivo temporal
                    os.remove(tmp_path)
                    print(f"✅ Imagen {idx + 1} insertada correctamente")

                except Exception as e:
                    print(f"❌ Error con imagen {idx + 1}: {e}")
                    continue

            # Restablecer configuración y agregar espacio final
            self.set_text_color(0, 0, 0)
            self.ln(10)

            print(f"🏁 Sección de imágenes completada. Total procesadas: {len(imagenes)}")

        # Si NO hay imágenes pero sí hay notas
        elif notas and notas.strip():
            self.ln(8)
            self.set_font("Helvetica", 'I', 10)
            self.set_text_color(50, 50, 50)
            self.multi_cell(0, 8, f"NOTAS:\n{notas.strip()}")
            self.set_text_color(0, 0, 0)


        

def generar_pdf(df_servicios, ruta_pdf, notas="", fecha_inicio_analisis=None, fecha_fin_analisis=None, imagenes=None):
    """
    Genera un PDF con los datos de servicios procesados
    """
    if df_servicios.empty:
        return False, "No hay datos para generar el informe"

    try:
        # Verificar si podemos escribir en la carpeta
        carpeta = os.path.dirname(ruta_pdf)
        if not os.access(carpeta, os.W_OK):
            return False, f"No hay permisos de escritura en la carpeta: {carpeta}"

        # Crear PDF con orientación horizontal (landscape) para tener más espacio
        pdf = PDF(orientation='L')
        pdf.alias_nb_pages()

        # Configurar márgenes (izquierda, superior, derecha)
        pdf.set_margins(10, 10, 10)

        # Configurar auto page break
        pdf.set_auto_page_break(True, margin=15)

        # Agregar primera página
        pdf.add_page()

        # Agregar tabla de servicios
        pdf.tabla_servicios(df_servicios, notas, fecha_inicio_analisis, fecha_fin_analisis, imagenes=imagenes)

        # Generar archivo
        pdf.output(ruta_pdf)

        return True, f"PDF generado exitosamente: {ruta_pdf}"
    except Exception as e:
        print(f"Error detallado al generar PDF: {str(e)}")  # Para depuración
        return False, f"Error al generar el PDF: {str(e)}"


def generar_pdf_modular(df, nombre_pdf, notas, fecha_inicio_analisis=None, fecha_fin_analisis=None, log_callback=None, imagenes=None):
    try:
        desktop = os.path.expanduser("~/OneDrive/Escritorio")
        carpeta_pdf = os.path.join(desktop, "pdf-relacion-servicios-en-efectivo")
        ruta_pdf = os.path.join(carpeta_pdf, nombre_pdf)
        if log_callback:
            log_callback(f"📄 Intentando guardar PDF en: {ruta_pdf}", "info")

        # Llama a la función real que crea el PDF
        exito, mensaje = generar_pdf(df, ruta_pdf, notas, fecha_inicio_analisis, fecha_fin_analisis, imagenes=imagenes)

        if log_callback:
            if exito:
                log_callback("✅ PDF generado exitosamente! - Listo para abrir", "success")
            else:
                log_callback(f"❌ {mensaje}", "error")
        return exito, mensaje

    except Exception as e:
        if log_callback:
            log_callback(f"❌ Error al generar PDF: {e}", "error")
        return False, str(e)
        
def _abrir_pdf(ruta_pdf, log_callback=None):
    try:
        if not os.path.exists(ruta_pdf):
            if log_callback:
                log_callback(f"❌ No se encontró el archivo PDF en: {ruta_pdf}", "error")
            return False
        os.startfile(ruta_pdf)
        if log_callback:
            log_callback("👁️ Abriendo archivo PDF...", "success")
        return True
    except Exception as e:
        if log_callback:
            log_callback(f"❌ Error al abrir PDF: {e}", "error")
        return False 