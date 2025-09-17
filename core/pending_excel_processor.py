# src/core/pending_excel_processor.py
import pandas as pd
import os
from datetime import datetime
from config.settings import EXCEL_COLUMNS
from utils.date_utils import parse_fecha_espanol
from unidecode import unidecode

def normalize_column_name(col_name):
    """Normaliza el nombre de una columna para hacer comparaciones más flexibles"""
    if pd.isna(col_name):
        return ""
    return str(col_name).strip().upper().replace(' ', '').replace('_', '')

def find_column_variant(df, target_variants):
    """Busca una columna que coincida con alguna de las variantes del nombre"""
    df_columns_normalized = {normalize_column_name(col): col for col in df.columns}
    
    for variant in target_variants:
        normalized_variant = normalize_column_name(variant)
        if normalized_variant in df_columns_normalized:
            return df_columns_normalized[normalized_variant]
    
    return None

def process_excel_file(file_path, fecha_inicio=None, fecha_fin=None):
    """
    Procesa un archivo Excel para extraer servicios pendientes de cobro.

    Args:
        file_path (str): La ruta al archivo Excel.
        fecha_inicio (datetime): Fecha de inicio del rango de fechas.
        fecha_fin (datetime): Fecha de fin del rango de fechas.

    Returns:
        tuple: Una tupla que contiene:
            - pandas.DataFrame: DataFrame consolidado de servicios pendientes, o None si hay errores.
            - list: Una lista de diccionarios con mensajes de log ('level', 'text').
            - dict: Información sobre el procesamiento con las claves:
                - 'has_data_in_range': bool - Si hay datos en el rango de fechas
                - 'has_filtered_data': bool - Si hay datos que cumplen el filtro
                - 'total_in_range': int - Total de registros en el rango de fechas
                - 'total_filtered': int - Total de registros que pasan el filtro
    """
    messages = []
    df_resultado = None
    
    # Información de seguimiento
    info = {
        'has_data_in_range': False,
        'has_filtered_data': False, 
        'total_in_range': 0,
        'total_filtered': 0
    }

    try:
        if not file_path or not os.path.exists(file_path):
            messages.append({'level': 'error', 'text': f"El archivo no existe o no es accesible: {os.path.basename(file_path) if file_path else 'None'}"})
            return None, messages, info

        messages.append({'level': 'info', 'text': f"Leyendo archivo Excel: {os.path.basename(file_path)}"})

        # Asegúrate de tener la librería 'openpyxl' instalada (pip install openpyxl)
        xls = pd.ExcelFile(file_path, engine='openpyxl')
        hojas = xls.sheet_names
        resultados = []

        # Variantes de nombres de columnas que aceptamos (usando settings para los nombres estándar)
        columnas_variantes = {
            EXCEL_COLUMNS['FECHA']: ['FECHA', 'Fecha', 'fecha', 'FECHA SERVICIO', 'Fecha Servicio'],
            EXCEL_COLUMNS['DIRECCION']: ['DIRECCION', 'Direccion', 'direccion', 'DIRECCIÓN', 'Dirección', 'DIRECCION CLIENTE'],
            EXCEL_COLUMNS['NOMBRE_CLIENTE']: ['NOMBRE CLIENTE', 'Nombre Cliente', 'nombre cliente', 'CLIENTE', 'Cliente', 'NOMBRE'],
            EXCEL_COLUMNS['SERVICIO_REALIZADO']: ['SERVICIO REALIZADO', 'Servicio Realizado', 'servicio realizado', 'SERVICIO', 'Servicio', 'DESCRIPCION', 'Descripción'],
            EXCEL_COLUMNS['ESTADO_SERVICIO']: ['ESTADO DEL SERVICIO', 'Estado del Servicio', 'estado del servicio', 'ESTADO', 'Estado', 'STATUS', 'Status']
        }

        total_pendientes = 0
        total_registros_en_rango = 0  # ✅ NUEVA VARIABLE PARA TRACKING

        # Procesar cada hoja
        for hoja in hojas:
            try:
                messages.append({'level': 'info', 'text': f"Procesando hoja: {hoja}"})

                # Leer datos con manejo de tipos
                df = pd.read_excel(xls, sheet_name=hoja, dtype={'FECHA': str})

                # --- LOG DE DEPURACIÓN: Nombres de columnas normalizados ---
                col_norms = {col: normalize_column_name(col) for col in df.columns}
                messages.append({'level': 'debug', 'text': f"Columnas originales y normalizadas: {col_norms}"})

                # Buscar columnas con variantes de nombres
                columnas_encontradas = {}
                columnas_faltantes = []
                for col_requerida, variantes in columnas_variantes.items():
                    # LOG DE DEPURACIÓN: variantes normalizadas
                    variantes_norm = [normalize_column_name(v) for v in variantes]
                    messages.append({'level': 'debug', 'text': f"Buscando '{col_requerida}' con variantes normalizadas: {variantes_norm}"})
                    col_encontrada = find_column_variant(df, variantes)
                    if col_encontrada:
                        columnas_encontradas[col_requerida] = col_encontrada
                    else:
                        columnas_faltantes.append(col_requerida)

                if columnas_faltantes:
                    messages.append({'level': 'error', 'text': f"Hoja {hoja}: Faltan columnas requeridas: {', '.join(columnas_faltantes)}. Hoja ignorada."})
                    continue

                # Renombrar columnas para usar nombres estándar
                df_renombrado = df.rename(columns=columnas_encontradas)

                # --- FILTRO ESTRICTO SEGÚN REQUERIMIENTO DEL CLIENTE ---
                # Normalizar columna FORMA DE PAGO
                col_forma_pago = find_column_variant(df_renombrado, ['FORMA DE PAGO', 'FORMA_PAGO', 'FORMA PAGO'])
                if col_forma_pago:
                    df_renombrado[col_forma_pago] = (
                        df_renombrado[col_forma_pago].astype(str).str.strip().str.upper().apply(unidecode)
                    )
                else:
                    messages.append({'level': 'error', 'text': f"Hoja {hoja}: No se encontró columna 'FORMA DE PAGO'. Hoja ignorada."})
                    continue

                # ✅ PASO 1: Convertir fechas ANTES de filtrar por rango
                df_renombrado['FECHA'] = pd.to_datetime(
                    df_renombrado['FECHA'],
                    dayfirst=True,
                    format='mixed',
                    errors='coerce'
                )

                # ✅ PASO 2: Filtrar por rango de fechas PRIMERO (para saber si hay datos en el rango)
                df_en_rango = df_renombrado.copy()
                if fecha_inicio is not None and fecha_fin is not None:
                    df_en_rango = df_renombrado[(df_renombrado['FECHA'] >= fecha_inicio) & (df_renombrado['FECHA'] <= fecha_fin)]
                
                registros_en_rango = len(df_en_rango[df_en_rango['FECHA'].notna()])
                total_registros_en_rango += registros_en_rango
                
                messages.append({'level': 'info', 'text': f"Hoja {hoja}: {registros_en_rango} registros en el rango de fechas"})

                if registros_en_rango == 0:
                    messages.append({'level': 'warning', 'text': f"Hoja {hoja}: No hay datos en el rango de fechas. Hoja ignorada."})
                    continue

                # ✅ PASO 3: AHORA filtrar por estado pendiente (solo los que están en el rango)
                col_estado_servicio = EXCEL_COLUMNS['ESTADO_SERVICIO']
                df_en_rango[col_estado_servicio] = df_en_rango[col_estado_servicio].astype(str).str.strip().str.lower().apply(unidecode)
                estados_pendientes = ['pendiente cobrar', 'pendiente', 'pendiente de cobro', 'no pagado', 'sin pagar']
                pendientes = df_en_rango[df_en_rango[col_estado_servicio].isin(estados_pendientes)].copy()

                messages.append({'level': 'info', 'text': f"Hoja {hoja}: {len(pendientes)} servicios pendientes encontrados después del filtro"})

                # Filtrar fechas inválidas y contar cuántas se ignoraron
                registros_antes = len(pendientes)
                pendientes = pendientes[pendientes[EXCEL_COLUMNS['FECHA']].notna()]
                fechas_invalidas = registros_antes - len(pendientes)

                if fechas_invalidas > 0:
                    messages.append({'level': 'warning', 'text': f"Hoja {hoja}: {fechas_invalidas} registros con fechas inválidas fueron ignorados."})

                if pendientes.empty:
                    messages.append({'level': 'warning', 'text': f"Hoja {hoja}: No se encontraron servicios pendientes válidos."})
                    continue

                # Calcular días de retraso de forma robusta
                hoy = pd.Timestamp(datetime.now().date())
                fechas = pd.to_datetime(pendientes[EXCEL_COLUMNS['FECHA']], errors='coerce')
                pendientes['DIAS_RETRASO'] = (hoy - fechas).dt.days

                # Seleccionar columnas para el reporte usando los nombres originales encontrados
                columnas_para_reporte = [
                    EXCEL_COLUMNS['FECHA'],
                    EXCEL_COLUMNS['DIRECCION'],
                    EXCEL_COLUMNS['NOMBRE_CLIENTE'],
                    columnas_encontradas[EXCEL_COLUMNS['SERVICIO_REALIZADO']],  # Usar el nombre original encontrado
                    'DIAS_RETRASO'
                ]
                pendientes_seleccionados = pendientes[columnas_para_reporte].copy()
                # Renombrar la columna de servicio para que sea estándar
                pendientes_seleccionados = pendientes_seleccionados.rename(columns={
                    columnas_encontradas[EXCEL_COLUMNS['SERVICIO_REALIZADO']]: EXCEL_COLUMNS['SERVICIO_REALIZADO']
                })

                resultados.append(pendientes_seleccionados)
                total_pendientes += len(pendientes_seleccionados)

                messages.append({'level': 'success', 'text': f"Hoja {hoja}: {len(pendientes_seleccionados)} servicios pendientes encontrados."})

            except Exception as e:
                messages.append({'level': 'error', 'text': f"Error procesando hoja {hoja}: {str(e)}"})

        # ✅ ACTUALIZAR INFORMACIÓN DE SEGUIMIENTO
        info['total_in_range'] = total_registros_en_rango
        info['has_data_in_range'] = total_registros_en_rango > 0
        info['total_filtered'] = total_pendientes
        info['has_filtered_data'] = total_pendientes > 0

        messages.append({'level': 'info', 'text': f"Resumen: {total_registros_en_rango} registros en rango, {total_pendientes} servicios pendientes"})

        # Consolidar resultados
        if not resultados:
            messages.append({'level': 'warning', 'text': "No se encontraron servicios pendientes en ninguna hoja."})
            return None, messages, info

        # Asegurar que todos los DataFrames tengan las mismas columnas y tipos de datos
        columnas_finales = [
            EXCEL_COLUMNS['FECHA'],
            EXCEL_COLUMNS['DIRECCION'],
            EXCEL_COLUMNS['NOMBRE_CLIENTE'],
            EXCEL_COLUMNS['SERVICIO_REALIZADO'],
            'DIAS_RETRASO'
        ]
        
        # Normalizar cada DataFrame antes de la concatenación
        resultados_normalizados = []
        for df in resultados:
            # Asegurar que todas las columnas existan
            for col in columnas_finales:
                if col not in df.columns:
                    df[col] = pd.NA
            # Convertir tipos de datos
            df['FECHA'] = pd.to_datetime(df['FECHA'])
            df['DIRECCION'] = df['DIRECCION'].astype(str)
            df['NOMBRE CLIENTE'] = df['NOMBRE CLIENTE'].astype(str)
            df['SERVICIO REALIZADO'] = df['SERVICIO REALIZADO'].astype(str)
            df['DIAS_RETRASO'] = df['DIAS_RETRASO'].astype(int)
            # Seleccionar solo las columnas necesarias en el orden correcto
            df_normalizado = df[columnas_finales].copy()
            resultados_normalizados.append(df_normalizado)

        # Concatenar los DataFrames normalizados
        df_consolidado = pd.concat(resultados_normalizados, ignore_index=True)
        messages.append({'level': 'success', 'text': f"Procesamiento completo: {len(df_consolidado)} servicios pendientes encontrados."})
        df_resultado = df_consolidado

    except FileNotFoundError:
        messages.append({'level': 'error', 'text': "Error: El archivo seleccionado no existe o no es accesible."})
        df_resultado = None
    except Exception as e:
        messages.append({'level': 'error', 'text': f"Error general procesando el archivo: {str(e)}"})
        df_resultado = None

    return df_resultado, messages, info