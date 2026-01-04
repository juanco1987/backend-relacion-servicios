# src/core/pending_excel_processor.py
import pandas as pd
import os
from datetime import datetime
from config.settings import EXCEL_COLUMNS
from utils.date_utils import parse_fecha_espanol
from unidecode import unidecode
from core.column_mapper import ColumnMapper

def process_excel_file(file_path, fecha_inicio=None, fecha_fin=None):
    """
    Procesa un archivo Excel para extraer servicios pendientes de cobro.
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

        xls = pd.ExcelFile(file_path, engine='openpyxl')
        hojas = xls.sheet_names
        resultados = []

        # Obtener variantes de columnas desde el ColumnMapper
        columnas_variantes = ColumnMapper.get_column_variants()
        
        # Mapeo de columnas requeridas para este procesador específico
        columnas_requeridas_map = {
            EXCEL_COLUMNS['FECHA']: columnas_variantes[EXCEL_COLUMNS['FECHA']],
            EXCEL_COLUMNS['DIRECCION']: columnas_variantes[EXCEL_COLUMNS['DIRECCION']],
            EXCEL_COLUMNS['NOMBRE_CLIENTE']: columnas_variantes[EXCEL_COLUMNS['NOMBRE_CLIENTE']],
            EXCEL_COLUMNS['SERVICIO_REALIZADO']: columnas_variantes[EXCEL_COLUMNS['SERVICIO_REALIZADO']],
            EXCEL_COLUMNS['ESTADO_SERVICIO']: columnas_variantes[EXCEL_COLUMNS['ESTADO_SERVICIO']]
        }

        total_pendientes = 0
        total_registros_en_rango = 0

        # Procesar cada hoja
        for hoja in hojas:
            try:
                messages.append({'level': 'info', 'text': f"Procesando hoja: {hoja}"})

                # Leer datos
                df = pd.read_excel(xls, sheet_name=hoja, dtype={'FECHA': str})

                # Buscar columnas requeridas usando ColumnMapper
                columnas_encontradas = {}
                columnas_faltantes = []
                
                for col_estandar, variantes in columnas_requeridas_map.items():
                    col_real = ColumnMapper.find_column(df, variantes)
                    if col_real:
                        columnas_encontradas[col_estandar] = col_real
                    else:
                        columnas_faltantes.append(col_estandar)

                if columnas_faltantes:
                    # Intentar ser más permisivo o loguear error
                    messages.append({'level': 'debug', 'text': f"Hoja {hoja}: Faltan columnas {columnas_faltantes}. Ignorando hoja."})
                    continue

                # Renombrar columnas encontradas a nombres estándar
                df_renombrado = df.rename(columns=columnas_encontradas)

                # FILTRO ESTRICTO: Buscar FORMA DE PAGO
                # El mapeador devuelve una lista, para find_column necesitamos pasársela
                # Usamos las variantes definidas en ColumnMapper o unas específicas si hace falta
                variantes_pago = columnas_variantes.get('FORMA DE PAGO', ['FORMA DE PAGO', 'FORMA_PAGO']) # Fallback
                col_forma_pago_real = ColumnMapper.find_column(df, variantes_pago)
                
                if col_forma_pago_real:
                    # Vectorización: Normalizar FORMA DE PAGO
                    # Usamos el nombre real encontrados en el df original (antes de renombrar) 
                    # OJO: Al renombrar, ya no existe con el nombre viejo en df_renombrado si estaba en columnas_encontradas
                    # Pero FORMA DE PAGO no estaba en columnas_requeridas_map para ser renombrada a un estándar global
                    # así que probablemente siga con su nombre original o lo agregamos al map.
                    # Para simplificar, usamos el nombre real sobre el df original O lo agregamos al renombrado.
                    # Vamos a trabajar con df_renombrado. La columna de pago NO fue renombrada.
                    
                    df_renombrado['FORMA_PAGO_NORM'] = df_renombrado[col_forma_pago_real].astype(str).str.strip().str.upper().apply(unidecode)
                else:
                    messages.append({'level': 'error', 'text': f"Hoja {hoja}: No se encontró columna 'FORMA DE PAGO'. Hoja ignorada."})
                    continue

                # 1. Convertir fechas
                df_renombrado[EXCEL_COLUMNS['FECHA']] = pd.to_datetime(
                    df_renombrado[EXCEL_COLUMNS['FECHA']],
                    dayfirst=True,
                    format='mixed',
                    errors='coerce'
                )

                # 2. Filtrar por rango
                df_en_rango = df_renombrado.copy()
                if fecha_inicio is not None and fecha_fin is not None:
                    # Vectorización del filtro de fechas
                    mask_fecha = (df_renombrado[EXCEL_COLUMNS['FECHA']] >= fecha_inicio) & (df_renombrado[EXCEL_COLUMNS['FECHA']] <= fecha_fin)
                    df_en_rango = df_renombrado[mask_fecha]
                
                # Conteo vectorizado
                registros_en_rango = df_en_rango[EXCEL_COLUMNS['FECHA']].notna().sum()
                total_registros_en_rango += registros_en_rango
                
                messages.append({'level': 'info', 'text': f"Hoja {hoja}: {registros_en_rango} registros en el rango de fechas"})

                if registros_en_rango == 0:
                    messages.append({'level': 'warning', 'text': f"Hoja {hoja}: No hay datos en el rango de fechas."})
                    continue

                # 3. Filtrar pendientes
                col_estado = EXCEL_COLUMNS['ESTADO_SERVICIO']
                # Vectorización: Normalizar estado
                df_en_rango[col_estado] = df_en_rango[col_estado].astype(str).str.strip().str.lower().apply(unidecode)
                
                estados_pendientes = {'pendiente cobrar', 'pendiente', 'pendiente de cobro', 'no pagado', 'sin pagar'}
                # isIn es vectorizado y rápido
                mask_pendientes = df_en_rango[col_estado].isin(estados_pendientes)
                pendientes = df_en_rango[mask_pendientes].copy()

                messages.append({'level': 'info', 'text': f"Hoja {hoja}: {len(pendientes)} servicios pendientes encontrados"})

                # Filtrar fechas inválidas
                registros_antes = len(pendientes)
                pendientes = pendientes[pendientes[EXCEL_COLUMNS['FECHA']].notna()]
                fechas_invalidas = registros_antes - len(pendientes)

                if fechas_invalidas > 0:
                    messages.append({'level': 'warning', 'text': f"Hoja {hoja}: {fechas_invalidas} registros ignorados por fecha inválida."})

                if pendientes.empty:
                    continue

                # Calcular días de retraso (vectorizado)
                hoy = pd.Timestamp(datetime.now().date())
                pendientes['DIAS_RETRASO'] = (hoy - pendientes[EXCEL_COLUMNS['FECHA']]).dt.days

                # Seleccionar columnas
                col_servicio_real = columnas_encontradas.get(EXCEL_COLUMNS['SERVICIO_REALIZADO'], EXCEL_COLUMNS['SERVICIO_REALIZADO'])
                
                # Como ya renombramos al principio, las columnas en pendientes tienen los nombres estándar
                # EXCEPTO si hubo algún conflicto. Pero usamos rename, así que deberían ser los estándar.
                
                cols_finales = [
                    EXCEL_COLUMNS['FECHA'],
                    EXCEL_COLUMNS['DIRECCION'],
                    EXCEL_COLUMNS['NOMBRE_CLIENTE'],
                    EXCEL_COLUMNS['SERVICIO_REALIZADO'],
                    'DIAS_RETRASO'
                ]
                
                pendientes_seleccionados = pendientes[cols_finales].copy()
                resultados.append(pendientes_seleccionados)
                total_pendientes += len(pendientes_seleccionados)

                messages.append({'level': 'success', 'text': f"Hoja {hoja}: {len(pendientes_seleccionados)} pendientes válidos."})

            except Exception as e:
                messages.append({'level': 'error', 'text': f"Error procesando hoja {hoja}: {str(e)}"})

        # Actualizar info
        info['total_in_range'] = int(total_registros_en_rango)
        info['has_data_in_range'] = total_registros_en_rango > 0
        info['total_filtered'] = total_pendientes
        info['has_filtered_data'] = total_pendientes > 0

        messages.append({'level': 'info', 'text': f"Resumen: {total_registros_en_rango} en rango, {total_pendientes} pendientes totales"})

        if not resultados:
            if messages and not any(m['level'] == 'warning' for m in messages):
                 messages.append({'level': 'warning', 'text': "No se encontraron servicios pendientes."})
            return None, messages, info

        # Consolidar
        df_consolidado = pd.concat(resultados, ignore_index=True)
        
        # Normalizar tipos final (vectorizado)
        df_consolidado[EXCEL_COLUMNS['FECHA']] = pd.to_datetime(df_consolidado[EXCEL_COLUMNS['FECHA']])
        df_consolidado[EXCEL_COLUMNS['DIRECCION']] = df_consolidado[EXCEL_COLUMNS['DIRECCION']].astype(str)
        df_consolidado[EXCEL_COLUMNS['NOMBRE_CLIENTE']] = df_consolidado[EXCEL_COLUMNS['NOMBRE_CLIENTE']].astype(str)
        df_consolidado[EXCEL_COLUMNS['SERVICIO_REALIZADO']] = df_consolidado[EXCEL_COLUMNS['SERVICIO_REALIZADO']].astype(str)
        df_consolidado['DIAS_RETRASO'] = df_consolidado['DIAS_RETRASO'].astype(int)

        df_resultado = df_consolidado
        messages.append({'level': 'success', 'text': f"Proceso finalizado. Total pendientes: {len(df_resultado)}"})

    except Exception as e:
        messages.append({'level': 'error', 'text': f"Error general: {str(e)}"})
        return None, messages, info

    return df_resultado, messages, info