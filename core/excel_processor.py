import pandas as pd
from utils.validation_utils import limpiar_valor_monetario
from config.settings import EXCEL_COLUMNS, FILTER_CRITERIA

def extraer_servicios(excel_path, fecha_inicio, fecha_fin, log_callback=None):
    """
    Extrae los servicios del archivo Excel que cumplan con los criterios:
    1. FORMA DE PAGO = "EFECTIVO"
    2. ESTADO DEL SERVICIO = VACÍO
    3. En el rango de fechas especificado
    
    Returns:
        tuple: (DataFrame, dict) donde dict contiene información sobre el proceso:
            - 'has_data_in_range': bool - Si hay datos en el rango de fechas
            - 'has_filtered_data': bool - Si hay datos que cumplen el filtro
            - 'total_in_range': int - Total de registros en el rango de fechas
            - 'total_filtered': int - Total de registros que pasan el filtro
    """
    if log_callback is None:
        log_callback = print

    log_callback("Procesando datos del archivo Excel...")
    
    # Información de seguimiento
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

    for hoja in xls.sheet_names:
        try:
            log_callback(f"\nAnalizando hoja: {hoja}")
            df = xls.parse(hoja)

            # Limpiar nombres de columnas (eliminar espacios al final)
            df.columns = df.columns.str.strip()

            # Mostrar todas las columnas que existen en la hoja
            log_callback(f"Columnas en la hoja {hoja}:")
            for col in df.columns:
                log_callback(f"  - '{col}'")

            # Usar nombres de columnas desde settings
            col_fecha = EXCEL_COLUMNS["FECHA"]
            col_forma_pago = EXCEL_COLUMNS["FORMA_PAGO"]
            col_estado_servicio = EXCEL_COLUMNS["ESTADO_SERVICIO"]

            if col_fecha not in df.columns:
                log_callback(f"Hoja {hoja} no tiene columna {col_fecha}. Saltando...")
                continue

            # Filtrar filas con fecha no nula
            df = df[df[col_fecha].notnull()]
            df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce', dayfirst=True)
            
            # ✅ PUNTO CLAVE: Contar datos en el rango de fechas
            df_en_rango = df[df[col_fecha].between(fecha_inicio, fecha_fin)]
            registros_en_rango = len(df_en_rango)
            total_registros_en_rango += registros_en_rango
            
            log_callback(f"Registros después de filtrar por fecha: {registros_en_rango}")
            
            if registros_en_rango == 0:
                log_callback(f"No hay datos en el rango de fechas en hoja {hoja}. Saltando...")
                continue
            
            # Si llegamos aquí, hay datos en el rango
            df = df_en_rango

            # Buscar exactamente la columna FORMA DE PAGO (ignorando espacios al final)
            columna_pago = None
            for col in df.columns:
                if col.strip() == col_forma_pago:
                    columna_pago = col
                    break

            if not columna_pago:
                log_callback(f"No se encontró columna exacta '{col_forma_pago}' en hoja {hoja}. Saltando...")
                continue

            # Buscar exactamente la columna ESTADO DEL SERVICIO (ignorando espacios al final)
            columna_estado = None
            for col in df.columns:
                if col.strip() == col_estado_servicio:
                    columna_estado = col
                    break

            if not columna_estado:
                log_callback(f"No se encontró columna exacta '{col_estado_servicio}' en hoja {hoja}. Saltando...")
                continue

            # Mostrar valores únicos en ambas columnas antes de filtrar
            log_callback(f"Valores únicos en {columna_pago}: {df[columna_pago].astype(str).str.upper().unique()}")
            log_callback(f"Valores únicos en {columna_estado}: {df[columna_estado].astype(str).str.upper().unique()}")

            # Filtrar por forma de pago = EFECTIVO (desde settings)
            df['FORMA_PAGO_CLEAN'] = df[columna_pago].astype(str).str.upper().str.strip()
            df = df[df['FORMA_PAGO_CLEAN'] == FILTER_CRITERIA["FORMA_PAGO_EFECTIVO"]]
            log_callback(f"Registros después de filtrar por forma de pago: {len(df)}")

            # Filtrar por estado del servicio vacío (desde settings)
            mascara_estado = df[columna_estado].isna() | (df[columna_estado].astype(str).str.strip() == FILTER_CRITERIA["ESTADO_SERVICIO_VACIO"])
            df = df[mascara_estado]

            # Mostrar los registros que fueron excluidos (usando loc para evitar la advertencia)
            registros_excluidos = df.loc[~mascara_estado]
            if not registros_excluidos.empty:
                log_callback(f"Registros excluidos por tener estado: {len(registros_excluidos)}")
                for idx, row in registros_excluidos.iterrows():
                    log_callback(f"  - Registro {idx}: {row[columna_estado]}")

            log_callback(f"Registros después de filtrar por estado: {len(df)}")

            # Buscar columnas de dirección, servicio realizado, valor servicio y domicilio
            columna_direccion = None
            columna_servicio = None
            columna_valor = None
            columna_domicilio = None

            for col in df.columns:
                if 'DIRECCION' in col.upper():
                    columna_direccion = col
                if 'SERVICIO' in col.upper() and 'REALIZADO' in col.upper():
                    columna_servicio = col
                if 'VALOR' in col.upper() and 'SERVICIO' in col.upper():
                    columna_valor = col
                if 'DOMICILIO' in col.upper():
                    columna_domicilio = col

            # Si no hay columna de dirección, intentar alternativas
            if not columna_direccion:
                for posible_col in ['DIRECCION', 'DIRECCIÓN', 'UBICACION', 'UBICACIÓN']:
                    if posible_col in df.columns:
                        columna_direccion = posible_col
                        break

            # Si no hay columna de servicio realizado, intentar alternativas
            if not columna_servicio:
                for posible_col in ['SERVICIO', 'DESCRIPCION', 'DESCRIPCIÓN', 'TRABAJO']:
                    if posible_col in df.columns:
                        columna_servicio = posible_col
                        break

            # Si no hay valor de servicio ni columna de domicilio, no podemos calcular
            if not columna_valor and not columna_domicilio:
                log_callback(f"No se encontraron columnas de valor en hoja {hoja}. Saltando...")
                continue

            # Crear columnas para el informe
            df['DIRECCION_PARA_INFORME'] = ''
            if columna_direccion:
                df['DIRECCION_PARA_INFORME'] = df[columna_direccion].fillna('').astype(str)
            df['SERVICIO_PARA_INFORME'] = ''
            if columna_servicio:
                df['SERVICIO_PARA_INFORME'] = df[columna_servicio].fillna('').astype(str)

            # Crear columna combinada de valor
            df['VALOR_COMBINADO'] = 0
            df['VALOR_ORIGINAL'] = 0

            # Si existe columna de valor servicio, usarla cuando no es nula o cero
            if columna_valor:
                df[columna_valor] = df[columna_valor].apply(limpiar_valor_monetario)
                df.loc[df[columna_valor] > 0, 'VALOR_COMBINADO'] = df[columna_valor]
                df.loc[df[columna_valor] > 0, 'VALOR_ORIGINAL'] = df[columna_valor]

            # Si existe columna de domicilio, usarla cuando valor servicio es nulo o cero
            if columna_domicilio:
                df[columna_domicilio] = df[columna_domicilio].apply(limpiar_valor_monetario)
                mascara_usar_domicilio = df['VALOR_COMBINADO'] == 0
                df.loc[mascara_usar_domicilio & (df[columna_domicilio] > 0), 'VALOR_COMBINADO'] = df[columna_domicilio]
                df.loc[mascara_usar_domicilio & (df[columna_domicilio] > 0), 'VALOR_ORIGINAL'] = df[columna_domicilio]

            log_callback(f"Registros con valor combinado > 0: {len(df[df['VALOR_COMBINADO'] > 0])}")

            # Buscar columna de IVA
            columna_iva = None
            for col in df.columns:
                if 'IVA' in col.upper():
                    columna_iva = col
                    break

            # Columna de materiales
            columna_materiales = None
            for col in df.columns:
                if 'MATERIAL' in col.upper():
                    if not 'VALOR' in col.upper():  # Excluir columnas de valor de materiales
                        columna_materiales = col
                        break

            # Columna de valor de materiales
            columna_valor_materiales = None
            for col in df.columns:
                if 'VALOR' in col.upper() and 'MATERIAL' in col.upper():
                    columna_valor_materiales = col
                    break

            # Agregar columnas de materiales si existen
            if columna_materiales:
                df['MATERIALES'] = df[columna_materiales].fillna('').astype(str)
            else:
                df['MATERIALES'] = ''

            if columna_valor_materiales:
                try:
                    df['VALOR MATERIALES'] = df[columna_valor_materiales].fillna(0).astype(str).apply(limpiar_valor_monetario)
                except:
                    df['VALOR MATERIALES'] = 0
            else:
                df['VALOR MATERIALES'] = 0

            # Calcular valores financieros
            df['SUBTOTAL'] = df['VALOR_COMBINADO'] * 0.5
            if columna_iva:
                df['IVA'] = df[columna_iva].fillna(0).apply(limpiar_valor_monetario)
            else:
                df['IVA'] = pd.Series([0.0] * len(df), index=df.index)
            df['TOTAL EMPRESA'] = df['SUBTOTAL'] + df['IVA']

            # Filtrar registros con valor combinado mayor que cero (para evitar filas sin valor)
            df = df[df['VALOR_COMBINADO'] > 0]
            log_callback(f"Registros finales después de todos los filtros: {len(df)}")

            # Eliminar columnas que se hayan quedado completamente vacías (NaN) después del filtrado
            df.dropna(axis=1, how='all', inplace=True)
            df = df.reset_index(drop=True)

            # Registrar el número de servicios encontrados para esta hoja
            log_callback(f"Servicios encontrados en '{hoja}': {len(df)}", 'info')
            
            frames.append(df)
        except Exception as e:
            log_callback(f"Error al procesar hoja {hoja}: {str(e)}", 'error')
            continue

    # ✅ ACTUALIZAR INFORMACIÓN DE SEGUIMIENTO
    info['total_in_range'] = total_registros_en_rango
    info['has_data_in_range'] = total_registros_en_rango > 0
    
    result = pd.concat(frames) if frames else pd.DataFrame()
    info['total_filtered'] = len(result)
    info['has_filtered_data'] = len(result) > 0
    
    log_callback(f"\nResumen del procesamiento:", 'info')
    log_callback(f"- Registros en rango de fechas: {info['total_in_range']}", 'info')
    log_callback(f"- Registros que cumplen filtro: {info['total_filtered']}", 'info')
    
    return result, info