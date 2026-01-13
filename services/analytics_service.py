import pandas as pd
import numpy as np
from datetime import datetime
from unidecode import unidecode
from core.column_mapper import ColumnMapper
from config.settings import EXCEL_COLUMNS
from utils.validation_utils import limpiar_valor_monetario

class AnalyticsService:
    @staticmethod
    def _clean_money_vectorized(series):
        """Limpia columnas monetarias de forma vectorizada."""
        clean_series = (series.astype(str)
                .str.replace('$', '', regex=False)
                .str.replace(',', '', regex=False)
                .str.strip()
                .replace({'nan': '0', 'None': '0', '': '0'}))
        return pd.to_numeric(clean_series, errors='coerce').fillna(0.0)

    @staticmethod
    def _read_excel_robust(file_path):
        """Lee todas las hojas de un Excel y las concatena."""
        dfs = []
        try:
            with pd.ExcelFile(file_path, engine='openpyxl') as xls:
                for hoja in xls.sheet_names:
                    df_hoja = pd.read_excel(xls, sheet_name=hoja)
                    # Normalizar nombres de columnas
                    df_hoja.columns = [str(col).strip() for col in df_hoja.columns]
                    dfs.append(df_hoja)
        except Exception as e:
             print(f"ERROR LECTURA EXCEL: {e}")
             raise e
             
        if not dfs:
            raise ValueError('No se encontraron hojas en el archivo Excel.')
        
        df_concat = pd.concat(dfs, ignore_index=True)
        print(f"DEBUG: Excel leído. Columnas encontradas: {list(df_concat.columns)}")
        return df_concat

    @classmethod
    def get_general_analytics(cls, file_path):
        df = cls._read_excel_robust(file_path)

        # Obtener variantes de columnas
        columnas_variantes = ColumnMapper.get_column_variants()
        
        print("DEBUG: Variantes de TORRE/APTO:", columnas_variantes.get('TORRE/APTO'))

        # Buscar columnas robustamente usando ColumnMapper
        col_estado = ColumnMapper.find_column(df, columnas_variantes['ESTADO DEL SERVICIO'])
        col_xporc = ColumnMapper.find_column(df, columnas_variantes['X50_PORCIENTO'])
        col_fecha = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['FECHA']])
        col_para_jg = ColumnMapper.find_column(df, columnas_variantes['PARA_JG'])
        col_forma_pago = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['FORMA_PAGO']])

        if not col_estado or not col_xporc or not col_fecha or not col_para_jg:
            raise ValueError(f'No se encontraron columnas requeridas. Estado: {col_estado}, X50%/X25%: {col_xporc}, Fecha: {col_fecha}, PARA JG: {col_para_jg}')

        # Limpiar valores (Vectorizado)
        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_xporc] = df[col_xporc].astype(str).str.strip()
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')
        
        try:
            df[col_para_jg] = cls._clean_money_vectorized(df[col_para_jg])
        except:
            df[col_para_jg] = df[col_para_jg].apply(limpiar_valor_monetario)

        if col_forma_pago:
            df[col_forma_pago] = df[col_forma_pago].astype(str).str.strip().str.upper().apply(unidecode)

        # Convertir formato de mes de "2025-01" a "Enero 2025"
        meses_espanol = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        df['MES'] = df[col_fecha].apply(lambda x: f"{meses_espanol[x.month]} {x.year}" if pd.notna(x) else None)
        
        # Calcular resumen por mes según condiciones solicitadas
        resumen = {}
        meses = set(df['MES'][df['MES'].notna()].unique())
        for mes in meses:
            grupo_mes = df[df['MES'] == mes]
            # EFECTIVO: ESTADO YA RELACIONADO o vacío o nulo
            estado = grupo_mes[col_estado].astype(str).str.strip().str.upper().replace('NAN', '')
            mask_efectivo = (
                (grupo_mes[col_forma_pago] == 'EFECTIVO') &
                (
                    (estado == 'YA RELACIONADO') |
                    (estado == '')
                )
            )
            efectivo = grupo_mes[mask_efectivo]
            efectivo_total = efectivo[col_para_jg].sum() if not efectivo.empty else 0
            efectivo_cantidad = len(efectivo)
            # TRANSFERENCIA: ESTADO YA RELACIONADO
            mask_transfer = (
                (grupo_mes[col_forma_pago] == 'TRANSFERENCIA') &
                (grupo_mes[col_estado] == 'YA RELACIONADO')
            )
            transferencia = grupo_mes[mask_transfer]
            transferencia_total = transferencia[col_para_jg].sum() if not transferencia.empty else 0
            transferencia_cantidad = len(transferencia)
            # Totales generales
            total_general = efectivo_total + transferencia_total
            cantidad_general = efectivo_cantidad + transferencia_cantidad
            resumen[mes] = {
                'efectivo_total': efectivo_total,
                'efectivo_cantidad': efectivo_cantidad,
                'transferencia_total': transferencia_total,
                'transferencia_cantidad': transferencia_cantidad,
                'total_general': total_general,
                'cantidad_general': cantidad_general
            }
        
        # Calcular estados especiales por mes
        estados_especiales_por_mes = {}
        for mes in meses:
            grupo_mes = df[df['MES'] == mes]
            
            estados_especiales_por_mes[mes] = {
                'no_pagaron_domicilio': len(grupo_mes[grupo_mes[col_estado] == 'NO PAGARON DOMICILIO']),
                'garantia': len(grupo_mes[grupo_mes[col_estado] == 'GARANTIA']),
                'cancelado': len(grupo_mes[grupo_mes[col_estado] == 'CANCELADO']),
                'no_se_cobra_domicilio': len(grupo_mes[grupo_mes[col_estado] == 'NO SE COBRA DOMICILIO']),
                'cotizacion': len(grupo_mes[grupo_mes[col_estado] == 'COTIZACION'])
            }
        
        # Calcular totales de servicios pendientes por mes
        pendientes_por_mes = {}
        
        for mes in meses:
            grupo_mes = df[df['MES'] == mes]
            
            # Servicios pendientes por relacionar (efectivo sin estado YA RELACIONADO)
            mask_efectivo_pendiente = (
                (grupo_mes[col_forma_pago] == 'EFECTIVO') &
                (grupo_mes[col_fecha].notna()) &
                (
                    (grupo_mes[col_estado] != 'YA RELACIONADO') |
                    (grupo_mes[col_estado].isna()) |
                    (grupo_mes[col_estado].astype(str).str.strip() == '')
                )
            )
            total_pendientes_relacionar = len(grupo_mes[mask_efectivo_pendiente])
            
            # Servicios pendientes por cobrar (estado PENDIENTE COBRAR)
            mask_pendiente_cobrar = (
                (grupo_mes[col_fecha].notna()) &
                (grupo_mes[col_estado] == 'PENDIENTE COBRAR')
            )
            total_pendientes_cobrar = len(grupo_mes[mask_pendiente_cobrar])
            
            pendientes_por_mes[mes] = {
                'total_pendientes_relacionar': total_pendientes_relacionar,
                'total_pendientes_cobrar': total_pendientes_cobrar
            }
        
        # Calcular totales globales de pendientes
        total_pendientes_relacionar_global = sum(pendientes_por_mes[mes]['total_pendientes_relacionar'] for mes in pendientes_por_mes)
        total_pendientes_cobrar_global = sum(pendientes_por_mes[mes]['total_pendientes_cobrar'] for mes in pendientes_por_mes)
        
        # Calcular totales globales de estados especiales
        total_no_pagaron_domicilio = sum(estados_especiales_por_mes[mes]['no_pagaron_domicilio'] for mes in estados_especiales_por_mes)
        total_garantia = sum(estados_especiales_por_mes[mes]['garantia'] for mes in estados_especiales_por_mes)
        total_cancelado = sum(estados_especiales_por_mes[mes]['cancelado'] for mes in estados_especiales_por_mes)
        total_no_se_cobra_domicilio = sum(estados_especiales_por_mes[mes]['no_se_cobra_domicilio'] for mes in estados_especiales_por_mes)
        total_cotizacion = sum(estados_especiales_por_mes[mes]['cotizacion'] for mes in estados_especiales_por_mes)
        
        # Calcular totales por estado para el gráfico circular
        estados_grafico = {}
        
        # Total de servicios (todos los que tienen fecha)
        total_servicios = len(df[df[col_fecha].notna()])
        estados_grafico['TOTAL_SERVICIOS'] = total_servicios
        
        # YA RELACIONADO
        ya_relacionado = df[df[col_estado] == 'YA RELACIONADO']
        estados_grafico['YA_RELACIONADO'] = len(ya_relacionado)
        
        # PENDIENTE COBRAR
        pendiente_cobrar = df[df[col_estado] == 'PENDIENTE COBRAR']
        estados_grafico['PENDIENTE_COBRAR'] = len(pendiente_cobrar)
        
        # COTIZACION
        cotizacion = df[df[col_estado] == 'COTIZACION']
        estados_grafico['COTIZACION'] = len(cotizacion)
        
        # NO PAGARON DOMICILIO
        no_pagaron_domicilio = df[df[col_estado] == 'NO PAGARON DOMICILIO']
        estados_grafico['NO_PAGARON_DOMICILIO'] = len(no_pagaron_domicilio)
        
        # GARANTIA
        garantia = df[df[col_estado] == 'GARANTIA']
        estados_grafico['GARANTIA'] = len(garantia)
        
        # NO SE COBRA DOMICILIO
        no_se_cobra_domicilio = df[df[col_estado] == 'NO SE COBRA DOMICILIO']
        estados_grafico['NO_SE_COBRA_DOMICILIO'] = len(no_se_cobra_domicilio)
        
        # CANCELADO
        cancelado = df[df[col_estado] == 'CANCELADO']
        estados_grafico['CANCELADO'] = len(cancelado)
        
        # OTROS
        estados_conocidos = ['YA RELACIONADO', 'PENDIENTE COBRAR', 'COTIZACION', 
                           'NO PAGARON DOMICILIO', 'GARANTIA', 'NO SE COBRA DOMICILIO', 'CANCELADO']
        otros = df[~df[col_estado].isin(estados_conocidos) & df[col_estado].notna()]
        estados_grafico['OTROS'] = len(otros)
        

        # --- Lógica de Categorización de Clientes (Fase 1: TORRE/APTO) ---
        target_cols = columnas_variantes.get('TORRE/APTO', ['TORRE/APTO', 'TORRE', 'APTO'])
        col_torre_apto = ColumnMapper.find_column(df, target_cols)
        
        # Filtrar solo filas con fecha válida para coincidir con el conteo general
        df_clients = df[df[col_fecha].notna()].copy()
        
        print(f"DEBUG: Buscando columnas TORRE/APTO con variantes: {target_cols}")
        print(f"DEBUG: Columna encontrada: {col_torre_apto}")
        
        # Si no encuentra TORRE/APTO específico, intentar usar Dirección como fallback (opcional, pero el usuario dijo TORRE/APTO)
        if not col_torre_apto:
             col_torre_apto = ColumnMapper.find_column(df_clients, columnas_variantes.get('DIRECCION', []))
             print(f"DEBUG: Fallback a DIRECCION: {col_torre_apto}")

        clientes_por_tipo = []

        if col_torre_apto:
            print(f"DEBUG: Muestra valores TORRE/APTO: {df_clients[col_torre_apto].unique()[:15]}")

            # Diccionario para acumular
            categorias = {
                'ADMINISTRACIÓN': {'cantidad': 0, 'valor': 0},
                'EMPRESA': {'cantidad': 0, 'valor': 0},
                'LOCAL': {'cantidad': 0, 'valor': 0},
                'CASA': {'cantidad': 0, 'valor': 0},
                # 'APTO' se mapeará a CASA o separado si se desea, 
                # el usuario dijo: "si aparecen numeros que lo ponga con nombre abreviado APTO"
                'APTO': {'cantidad': 0, 'valor': 0}, 
                'OTROS': {'cantidad': 0, 'valor': 0}
            }

            # Iterar sobre el DF (vectorizar sería mejor, pero la lógica de string es compleja)
            # Usaremos apply para clasificación
            def clasificar_cliente(valor):
                s = str(valor).strip().upper()
                if not s or s == 'NAN': return 'OTROS'
                
                # Palabras clave fuertes para ADMINISTRACION
                if any(x in s for x in ['ADMINISTRACION', 'ADMON', 'CONJUNTO', 'EDIFICIO', 'TORRE', 'P.H.', 'PROPIEDAD', 'AGRUPACION']):
                     # Excepción: Si dice "TORRE x APTO y", probablemente es APTO, no la administración de la torre.
                     # Pero "TORRE" solo suele ser la administración.
                     # Si tiene "APTO" o "CASA" explícito, dejar que caiga en reglas posteriores? 
                     # No, si dice "CONJUNTO XYZ CASA 1", es CASA.
                     # Vamos a priorizar CASA/APTO/LOCAL si aparecen explícitamente.
                     if not any(x in s for x in ['APTO', 'CASA', 'LOCAL', 'CONSULTORIO', 'OFICINA', 'BODEGA']):
                         return 'ADMINISTRACIÓN'

                if any(x in s for x in ['EMPRESA', 'SAS', 'LTDA', 'PARROQUIA', 'COLEGIO', 'IGLESIA']):
                    return 'EMPRESA'

                # Incluir errores tipográficos comunes como CONSULTIRIO
                if any(x in s for x in ['LOCAL', 'TIENDA', 'C.C', 'BAR', 'BODEGA', 'CONSULTORIO', 'CONSULTIRIO', 'OFICINA', 'RESTAURANTE']):
                    return 'LOCAL'
                    
                if any(x in s for x in ['CASA', 'URBANIZACION', 'VIVIENDA']):
                    return 'CASA'
                
                # Chequear si es solo números (APTO)
                # O si contiene palabras clave de apto (Bloque, Int, Ap)
                import re
                if re.search(r'\d', s): # Si tiene números
                     return 'APTO'
                
                return 'OTROS'

            df_clients['TIPO_CLIENTE_TEMP'] = df_clients[col_torre_apto].apply(clasificar_cliente)

            # Agrupar y sumar
            # Necesitamos sumar el valor. Usaremos col_para_jg por defecto o col_xporc si representa valor?
            # get_general_analytics calcula efectivo_total usando col_para_jg. Usaremos esa.
            
            # Asegurar que col_para_jg es numérica (ya se hizo arriba)
            grupo_clientes = df_clients.groupby('TIPO_CLIENTE_TEMP')[col_para_jg].agg(['count', 'sum']).reset_index()
            
            for _, row in grupo_clientes.iterrows():
                cat = row['TIPO_CLIENTE_TEMP']
                if cat in categorias:
                    categorias[cat]['cantidad'] = int(row['count'])
                    categorias[cat]['valor'] = float(row['sum'])
            
            # Convertir a lista para el frontend
            for cat, data in categorias.items():
                if data['cantidad'] > 0:
                    clientes_por_tipo.append({
                        'cliente': cat,
                        'servicios': data['cantidad'],
                        'valor': data['valor']
                    })
            
            # Ordenar por valor descendente
            clientes_por_tipo.sort(key=lambda x: x['valor'], reverse=True)
            
            print(f"DEBUG: Resultados Clientes: {clientes_por_tipo}")

        # Actualizar el diccionario de retorno
        return {
            'resumen': resumen, 
            'pendientes_por_mes': pendientes_por_mes,
            'total_pendientes_relacionar': total_pendientes_relacionar_global,
            'total_pendientes_cobrar': total_pendientes_cobrar_global,
            'estados_grafico': estados_grafico,
            'estados_especiales_por_mes': estados_especiales_por_mes,
            'totales_estados_especiales': {
                'no_pagaron_domicilio': total_no_pagaron_domicilio,
                'garantia': total_garantia,
                'cancelado': total_cancelado,
                'no_se_cobra_domicilio': total_no_se_cobra_domicilio,
                'cotizacion': total_cotizacion
            },
            'clientes_recurrentes': clientes_por_tipo, # Dato real ahora
            'success': True
        }

    @classmethod
    def get_pending_cash_analytics(cls, file_path):
        df = cls._read_excel_robust(file_path)

        columnas_variantes = ColumnMapper.get_column_variants()

        col_estado = ColumnMapper.find_column(df, columnas_variantes['ESTADO DEL SERVICIO'])
        col_xporc = ColumnMapper.find_column(df, columnas_variantes['X50_PORCIENTO'])
        col_fecha = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['FECHA']])
        col_para_jg = ColumnMapper.find_column(df, columnas_variantes['PARA_JG'])
        col_para_abrecar = ColumnMapper.find_column(df, columnas_variantes['PARA_ABRECAR'])
        col_iva = ColumnMapper.find_column(df, columnas_variantes['IVA'])
        col_forma_pago = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['FORMA_PAGO']])
        col_servicio = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['SERVICIO_REALIZADO']])

        if not col_estado or not col_xporc or not col_fecha or not col_para_jg or not col_forma_pago:
            raise ValueError(f'No se encontraron columnas requeridas. Estado: {col_estado}, X50%/X25%: {col_xporc}, Fecha: {col_fecha}, PARA JG: {col_para_jg}, Forma Pago: {col_forma_pago}')

        # Limpiar valores
        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_xporc] = df[col_xporc].astype(str).str.strip()
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')
        
        try:
            df[col_para_jg] = cls._clean_money_vectorized(df[col_para_jg])
        except:
            df[col_para_jg] = df[col_para_jg].apply(limpiar_valor_monetario)

        if col_para_abrecar:
            try:
                df[col_para_abrecar] = cls._clean_money_vectorized(df[col_para_abrecar])
            except:
                df[col_para_abrecar] = df[col_para_abrecar].apply(limpiar_valor_monetario)
        
        if col_iva:
            try:
                df[col_iva] = cls._clean_money_vectorized(df[col_iva])
            except:
                df[col_iva] = df[col_iva].apply(limpiar_valor_monetario)

        df[col_forma_pago] = df[col_forma_pago].astype(str).str.strip().str.upper().apply(unidecode)

        # Filtrar
        mask_efectivo = df[col_forma_pago] == 'EFECTIVO'
        mask_fecha = df[col_fecha].notna()
        
        estados_upper = df[col_estado].str.upper()
        mask_estado = (estados_upper != 'YA RELACIONADO')
        
        df_filtrado = df[mask_efectivo & mask_fecha & mask_estado].copy()

        if df_filtrado.empty:
            return {
                'resumen': {},
                'detalle': [],
                'success': True,
                'filter_empty': True,
            }

        # Calcular días sin relacionar
        fecha_actual = datetime.now()
        df_filtrado['dias_sin_relacionar'] = (fecha_actual - df_filtrado[col_fecha]).dt.days

        # Agregar columna de mes (usar YYYY-MM para consistencia si se desea, pero el original usaba Period converted to string which is 'YYYY-MM')
        # Check original: df_filtrado['MES'] = pd.Series(df_filtrado[col_fecha].dt.to_period('M').astype(str), index=df_filtrado.index)
        df_filtrado['MES'] = df_filtrado[col_fecha].dt.to_period('M').astype(str)

        # Resumen por mes
        resumen = {}
        meses = set(df_filtrado['MES'][df_filtrado['MES'].notna()].unique())

        for mes in meses:
            grupo_mes = df_filtrado[df_filtrado['MES'] == mes]

            if col_para_abrecar:
                total_valor = grupo_mes[col_para_abrecar].sum()
            else:
                total_valor = grupo_mes[col_para_jg].sum()

            dias_sin_relacionar = grupo_mes['dias_sin_relacionar'].max() if not grupo_mes.empty else 0
            
            # Calcular fecha más antigua de servicios pendientes en este mes
            # Solo consideramos los que están realmente pendientes (no YA RELACIONADO)
            # Aunque grupo_mes ya está filtrado por status? 
            # get_general_analytics filtró df antes (df_filtrado). Sí.
            
            if not grupo_mes.empty:
                 fecha_mas_antigua = grupo_mes[col_fecha].min()
                 fecha_mas_antigua_str = fecha_mas_antigua.strftime('%Y-%m-%d') if pd.notna(fecha_mas_antigua) else 'N/A'
            else:
                 fecha_mas_antigua_str = '9999-12-31'

            servicios_antiguos = grupo_mes[grupo_mes['dias_sin_relacionar'] > 30]
            num_antiguos = len(servicios_antiguos)
            total_pendientes_mes = len(grupo_mes)
            tiene_pendientes = total_pendientes_mes > 0
            tiene_antiguos = num_antiguos > 0

            if tiene_antiguos:
                advertencia = f"⚠️ ADVERTENCIA: Hay {num_antiguos} servicios en efectivo con más de 30 días sin relacionar"
            elif tiene_pendientes:
                advertencia = f"ℹ️ Hay {total_pendientes_mes} servicios pendientes por relacionar (Recientes)"
            else:
                advertencia = "✅ Todos los servicios en efectivo están al día"

            resumen[mes] = {
                'total_servicios': total_pendientes_mes,
                'total_valor': total_valor,
                'dias_sin_relacionar': dias_sin_relacionar,
                'tiene_pendientes': tiene_pendientes,
                'tiene_antiguos': tiene_antiguos,
                'num_antiguos': num_antiguos,
                'fecha_mas_antigua': fecha_mas_antigua_str,
                'advertencia': advertencia
            }

        # Detalle
        detalle = []
        for _, row in df_filtrado.iterrows():
            estado = row[col_estado]
            if pd.isna(estado) or str(estado).strip().upper() in ['NAN', 'NONE', '']:
                estado_display = 'Sin Relacionar'
            else:
                estado_display = str(estado).strip()
            
            servicio_realizado = row[col_servicio] if col_servicio and pd.notna(row[col_servicio]) else 'No especificado'
            if pd.isna(servicio_realizado) or str(servicio_realizado).strip() == '':
                servicio_realizado = 'No especificado'
            else:
                servicio_realizado = str(servicio_realizado).strip()
            
            valor_abrecar = row[col_para_abrecar] if col_para_abrecar and pd.notna(row[col_para_abrecar]) else 0
            valor_iva = row[col_iva] if col_iva and pd.notna(row[col_iva]) else 0
            valor_subtotal = valor_abrecar - valor_iva if valor_abrecar > 0 else 0
            
            if not col_para_abrecar:
                valor_abrecar = row[col_para_jg] if pd.notna(row[col_para_jg]) else 0
                valor_subtotal = valor_abrecar
            
            detalle.append({
                'fecha': row[col_fecha].strftime('%Y-%m-%d') if pd.notna(row[col_fecha]) else 'N/A',
                'estado': estado_display,
                'servicio_realizado': servicio_realizado,
                'subtotal': valor_subtotal,
                'iva': valor_iva,
                'total_abrecar': valor_abrecar,
                'dias_sin_relacionar': row['dias_sin_relacionar'],
                'es_antiguo': row['dias_sin_relacionar'] > 30
            })

        detalle.sort(key=lambda x: x['dias_sin_relacionar'], reverse=True)

        return {
            'resumen': resumen,
            'detalle': detalle,
            'success': True
        }

    @classmethod
    def get_pending_charges_analytics(cls, file_path):
        df = cls._read_excel_robust(file_path)

        columnas_variantes = ColumnMapper.get_column_variants()

        col_estado = ColumnMapper.find_column(df, columnas_variantes['ESTADO DEL SERVICIO'])
        col_fecha = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['FECHA']])
        col_servicio = ColumnMapper.find_column(df, columnas_variantes[EXCEL_COLUMNS['SERVICIO_REALIZADO']])

        if not col_estado or not col_fecha or not col_servicio:
            raise ValueError(f'No se encontraron columnas requeridas. Estado: {col_estado}, Fecha: {col_fecha}, Servicio: {col_servicio}')

        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')
        df[col_servicio] = df[col_servicio].astype(str).str.strip()

        mask_fecha = df[col_fecha].notna()
        mask_estado = df[col_estado] == 'PENDIENTE COBRAR'
        df_filtrado = df[mask_fecha & mask_estado].copy()

        if df_filtrado.empty:
            return {
                'resumen': {},
                'detalle': [],
                'success': True,
                'filter_empty': True,
            }

        fecha_actual = datetime.now()
        df_filtrado['dias_de_retraso'] = (fecha_actual - df_filtrado[col_fecha]).dt.days
        df_filtrado['fecha_fmt'] = df_filtrado[col_fecha].dt.strftime('%Y-%m-%d')
        df_filtrado['MES'] = df_filtrado[col_fecha].dt.to_period('M').astype(str)

        resumen = {}
        meses = set(df_filtrado['MES'].unique())

        for mes in meses:
            grupo_mes = df_filtrado[df_filtrado['MES'] == mes]

            total_servicios = len(grupo_mes)
            servicios_retraso = len(grupo_mes[grupo_mes['dias_de_retraso'] > 30])
            max_dias_retraso = int(grupo_mes['dias_de_retraso'].max()) if not grupo_mes.empty else 0
            fecha_mas_antigua = grupo_mes[col_fecha].min().strftime('%Y-%m-%d') if not grupo_mes.empty else 'N/A'

            resumen[mes] = {
                'total_servicios': total_servicios,
                'servicios_retraso': servicios_retraso,
                'max_dias_retraso': max_dias_retraso,
                'fecha_mas_antigua': fecha_mas_antigua
            }

        detalle = df_filtrado.apply(lambda row: {
            'fecha': row['fecha_fmt'],
            'estado': row[col_estado],
            'servicio_realizado': row[col_servicio],
            'dias_de_retraso': int(row['dias_de_retraso']),
            'mensaje': 'PONER AL DÍA COBROS DE ESTE SERVICIO' if row['dias_de_retraso'] > 30 else ''
        }, axis=1).tolist()

        return {
            'resumen': resumen,
            'detalle': detalle,
            'success': True
        }
