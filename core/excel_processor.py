import pandas as pd
import numpy as np
from utils.validation_utils import limpiar_valor_monetario
from config.settings import EXCEL_COLUMNS, FILTER_CRITERIA
from core.column_mapper import ColumnMapper
from unidecode import unidecode

def extraer_servicios(excel_path, fecha_inicio, fecha_fin, log_callback=None):
    """
    Extrae los servicios del archivo Excel que cumplan con los criterios:
    1. FORMA DE PAGO = "EFECTIVO"
    2. ESTADO DEL SERVICIO = VACÍO
    3. En el rango de fechas especificado
    
    Returns:
        tuple: (DataFrame, dict)
    """
    if log_callback is None:
        log_callback = print

    log_callback("Procesando datos del archivo Excel...")
    
    info = {
        'has_data_in_range': False,
        'has_filtered_data': False, 
        'total_in_range': 0,
        'total_filtered': 0
    }

    try:
        xls = pd.ExcelFile(excel_path)
    except Exception as e:
        log_callback(f"Error al abrir el archivo Excel: {str(e)}", 'error')
        return pd.DataFrame(), info

    frames = []
    total_registros_en_rango = 0

    # Obtener variantes de columnas
    columnas_variantes = ColumnMapper.get_column_variants()

    for hoja in xls.sheet_names:
        try:
            log_callback(f"\nAnalizando hoja: {hoja}")
            df = xls.parse(hoja)

            # Mapear columnas requeridas usando ColumnMapper
            col_fecha = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS["FECHA"]])
            col_forma_pago = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS["FORMA_PAGO"]])
            col_estado_servicio = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS["ESTADO_SERVICIO"]])

            if not col_fecha:
                log_callback(f"Hoja {hoja} no tiene columna de Fecha. Saltando...")
                continue

            # 1. Filtrar filas con fecha no nula y convertir
            df = df[df[col_fecha].notnull()]
            df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce', dayfirst=True)
            
            # 2. Filtrar por rango (Vectorizado)
            mask_rango = df[col_fecha].between(fecha_inicio, fecha_fin)
            df_en_rango = df[mask_rango].copy()
            
            registros_en_rango = len(df_en_rango)
            total_registros_en_rango += registros_en_rango
            
            log_callback(f"Registros después de filtrar por fecha: {registros_en_rango}")
            
            if registros_en_rango == 0:
                log_callback(f"No hay datos en el rango de fechas en hoja {hoja}. Saltando...")
                continue
            
            # Trabajar con datos filtrados
            df = df_en_rango

            if not col_forma_pago:
                log_callback(f"No se encontró columna para Forma de Pago en hoja {hoja}. Saltando...")
                continue

            if not col_estado_servicio:
                log_callback(f"No se encontró columna para Estado del Servicio en hoja {hoja}. Saltando...")
                continue

            # 3. Filtrar por forma de pago = EFECTIVO (Vectorizado)
            # Primero normalizamos la columna completa de una vez
            df['FORMA_PAGO_CLEAN'] = df[col_forma_pago].astype(str).str.upper().str.strip()
            # Luego filtramos
            df = df[df['FORMA_PAGO_CLEAN'] == FILTER_CRITERIA["FORMA_PAGO_EFECTIVO"]]
            log_callback(f"Registros después de filtrar por forma de pago: {len(df)}")

            # 4. Filtrar por estado del servicio vacío (Vectorizado)
            # Normalizar estado
            estado_series = df[col_estado_servicio].astype(str).str.strip()
            mascara_estado = (df[col_estado_servicio].isna()) | \
                             (estado_series == 'nan') | \
                             (estado_series == 'None') | \
                             (estado_series == FILTER_CRITERIA["ESTADO_SERVICIO_VACIO"])
            
            registros_excluidos = df[~mascara_estado]
            if not registros_excluidos.empty:
                log_callback(f"Registros excluidos por tener estado: {len(registros_excluidos)}")
            
            df = df[mascara_estado].copy()
            log_callback(f"Registros después de filtrar por estado: {len(df)}")

            # Buscar columnas adicionales de forma robusta
            col_direccion = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['DIRECCION']])
            col_servicio = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['SERVICIO_REALIZADO']])
            col_valor = ColumnMapper.find_column(df, columnas_variantes['VALOR_SERVICIO'])
            col_domicilio = ColumnMapper.find_column(df, columnas_variantes['DOMICILIO'])
            col_iva = ColumnMapper.find_column(df, columnas_variantes['IVA'])
            
            # Columnas de materiales (lógica custom que requiere búsqueda manual parcial)
            col_materiales = None
            col_valor_materiales = None
            for col in df.columns:
                col_upper = str(col).upper()
                if 'MATERIAL' in col_upper and 'VALOR' not in col_upper:
                    col_materiales = col
                if 'VALOR' in col_upper and 'MATERIAL' in col_upper:
                    col_valor_materiales = col

            # Si no hay valor de servicio ni columna de domicilio, no podemos calcular
            if not col_valor and not col_domicilio:
                log_callback(f"No se encontraron columnas de valor en hoja {hoja}. Saltando...")
                continue

            # Preparar columnas para informe
            df['DIRECCION_PARA_INFORME'] = df[col_direccion].fillna('').astype(str) if col_direccion else ''
            df['SERVICIO_PARA_INFORME'] = df[col_servicio].fillna('').astype(str) if col_servicio else ''
            
            # Limpieza vectorizada de valores monetarios
            def limpiar_vectorizado(series):
                if series is None:
                    return pd.Series([0.0] * len(df), index=df.index)
                # Convertir a string, quitar $ y , y convertir a float de forma segura
                clean_series = (series.astype(str)
                        .str.replace('$', '', regex=False)
                        .str.replace(',', '', regex=False)
                        .str.strip()
                        .replace({'nan': '0', 'None': '0', '': '0'}))
                return pd.to_numeric(clean_series, errors='coerce').fillna(0.0)

            # Inicializar valores
            df['VALOR_COMBINADO'] = 0.0
            df['VALOR_ORIGINAL'] = 0.0

            # Procesar valor servicio
            valores_servicio = pd.Series(0.0, index=df.index)
            if col_valor:
                try:
                    valores_servicio = limpiar_vectorizado(df[col_valor])
                except:
                    # Fallback a método lento si falla vectorización
                    valores_servicio = df[col_valor].apply(limpiar_valor_monetario)

            # Procesar domicilio
            valores_domicilio = pd.Series(0.0, index=df.index)
            if col_domicilio:
                try:
                    valores_domicilio = limpiar_vectorizado(df[col_domicilio])
                except:
                    valores_domicilio = df[col_domicilio].apply(limpiar_valor_monetario)

            # Lógica vectorizada para valor combinado
            # 1. Usar valor servicio donde sea > 0
            mask_servicio = valores_servicio > 0
            df.loc[mask_servicio, 'VALOR_COMBINADO'] = valores_servicio[mask_servicio]
            df.loc[mask_servicio, 'VALOR_ORIGINAL'] = valores_servicio[mask_servicio]
            
            # 2. Usar domicilio donde valor combinado sea 0 y domicilio > 0
            mask_domicilio = (df['VALOR_COMBINADO'] == 0) & (valores_domicilio > 0)
            df.loc[mask_domicilio, 'VALOR_COMBINADO'] = valores_domicilio[mask_domicilio]
            df.loc[mask_domicilio, 'VALOR_ORIGINAL'] = valores_domicilio[mask_domicilio]

            log_callback(f"Registros con valor combinado > 0: {len(df[df['VALOR_COMBINADO'] > 0])}")

            # Materiales
            if col_materiales:
                df['MATERIALES'] = df[col_materiales].fillna('').astype(str)
            else:
                df['MATERIALES'] = ''

            if col_valor_materiales:
                try:
                    df['VALOR MATERIALES'] = limpiar_vectorizado(df[col_valor_materiales])
                except:
                    df['VALOR MATERIALES'] = 0
            else:
                df['VALOR MATERIALES'] = 0

            # Cálculos financieros vectorizados
            df['SUBTOTAL'] = df['VALOR_COMBINADO'] * 0.5
            
            if col_iva:
                try:
                    df['IVA'] = limpiar_vectorizado(df[col_iva])
                except:
                    df['IVA'] = df[col_iva].apply(limpiar_valor_monetario)
            else:
                df['IVA'] = 0.0
                
            df['TOTAL EMPRESA'] = df['SUBTOTAL'] + df['IVA']

            # Filtro final vectorizado
            df = df[df['VALOR_COMBINADO'] > 0]
            log_callback(f"Registros finales después de todos los filtros: {len(df)}")

            # Limpieza final
            df.dropna(axis=1, how='all', inplace=True)
            df = df.reset_index(drop=True)
            
            log_callback(f"Servicios encontrados en '{hoja}': {len(df)}", 'info')
            frames.append(df)
            
        except Exception as e:
            log_callback(f"Error al procesar hoja {hoja}: {str(e)}", 'error')
            continue

    # Actualizar info
    info['total_in_range'] = int(total_registros_en_rango)
    info['has_data_in_range'] = total_registros_en_rango > 0
    
    result = pd.concat(frames) if frames else pd.DataFrame()
    info['total_filtered'] = len(result)
    info['has_filtered_data'] = len(result) > 0
    
    log_callback(f"\nResumen del procesamiento:", 'info')
    log_callback(f"- Registros en rango de fechas: {info['total_in_range']}", 'info')
    log_callback(f"- Registros que cumplen filtro: {info['total_filtered']}", 'info')
    
    return result, info