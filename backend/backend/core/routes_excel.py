from flask import Blueprint, request, jsonify, send_file
import pandas as pd
import os
from datetime import datetime
from core import pending_excel_processor, excel_processor, df_pending_report, pdf_generator
from core.pending_excel_processor import normalize_column_name, find_column_variant
from config.settings import EXCEL_COLUMNS
from unidecode import unidecode
from utils.validation_utils import limpiar_valor_monetario
import numpy as np

bp_excel = Blueprint('excel', __name__)

def convert_numpy_types(obj):
    """Convierte tipos de numpy a tipos nativos de Python para serialización JSON"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

@bp_excel.route('/process', methods=['POST'])
def process_data():
    """Endpoint para procesar y validar datos antes de generar PDF"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No se envió archivo'}), 400
    
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'success': False, 'error': 'Nombre de archivo vacío'}), 400
    
    try:
        # Obtener fechas del form-data
        fecha_inicio_str = request.form.get('fecha_inicio')
        fecha_fin_str = request.form.get('fecha_fin')
        notas = request.form.get('notas', '')
        
        if not fecha_inicio_str or not fecha_fin_str:
            return jsonify({'success': False, 'error': 'Fechas de inicio y fin son requeridas'}), 400
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'success': False, 'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400
        
        # Validar que la fecha de inicio no sea mayor que la fecha de fin
        if fecha_inicio > fecha_fin:
            return jsonify({'success': False, 'error': 'La fecha de inicio no puede ser mayor que la fecha de fin'}), 400
        
        # Guardar archivo temporalmente para validación
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)
        
        # Intentar leer el archivo para validar que sea un Excel válido
        try:
            df = pd.read_excel(temp_path)
            if df.empty:
                return jsonify({'success': False, 'error': 'El archivo Excel está vacío'}), 400
            
            # Contar filas para validación básica
            row_count = len(df)
            if row_count < 1:
                return jsonify({'success': False, 'error': 'El archivo debe contener al menos una fila de datos'}), 400
                
        except Exception as e:
            return jsonify({'success': False, 'error': f'Error al leer el archivo Excel: {str(e)}'}), 400
        finally:
            # Limpiar archivo temporal
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"No se pudo borrar el archivo temporal: {e}")
        
        # Si llegamos aquí, la validación fue exitosa
        return jsonify({
            'success': True,
            'data': {
                'filename': filename,
                'row_count': row_count,
                'fecha_inicio': fecha_inicio_str,
                'fecha_fin': fecha_fin_str,
                'notas': notas,
                'processed_at': datetime.now().isoformat()
            },
            'message': f'Datos validados exitosamente. Archivo: {filename}, Filas: {row_count}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error interno del servidor: {str(e)}'}), 500

@bp_excel.route('/procesar_excel', methods=['POST'])
def procesar_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        # Guardar archivo temporalmente
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        # Obtener fechas del form-data o usar valores por defecto
        fecha_inicio_str = request.form.get('fecha_inicio', '2024-01-01')
        fecha_fin_str = request.form.get('fecha_fin', '2024-12-31')
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400

        # ✅ AHORA USAR LA FUNCIÓN MODIFICADA que retorna información diferenciada
        df, messages, info = pending_excel_processor.process_excel_file(temp_path, fecha_inicio, fecha_fin)
        
        # Limpiar archivo temporal
        import time
        import gc
        gc.collect()
        time.sleep(0.1)
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # ✅ LÓGICA DIFERENCIADA BASADA EN LA INFORMACIÓN RETORNADA
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return jsonify({
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'messages': messages, 
                'empty_range': True,
                'filter_empty': False
            }), 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro (servicios pendientes)
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return jsonify({
                'error': 'No se encontraron servicios pendientes por cobrar en el rango de fechas.', 
                'messages': messages, 
                'empty_range': False,
                'filter_empty': True
            }), 400

        # CASO 3: Hay datos válidos
        df = df.replace({np.nan: None})
        data = df.to_dict(orient='records')
        return jsonify({
            'data': data, 
            'messages': messages,
            'empty_range': False,
            'filter_empty': False
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp_excel.route('/relacion_servicios', methods=['POST'])
def relacion_servicios():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        # Guardar archivo temporalmente
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        # Obtener fechas del form-data o usar valores por defecto
        fecha_inicio_str = request.form.get('fecha_inicio', '2024-01-01')
        fecha_fin_str = request.form.get('fecha_fin', '2024-12-31')
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400

        # Procesar el archivo para obtener la relación de servicios
        logs = []
        def log_callback(msg, level='info'):
            logs.append({'level': level, 'text': msg})
        
        # ✅ AQUÍ ESTÁ LA CORRECCIÓN: Usar la nueva función que retorna información
        df, info = excel_processor.extraer_servicios(temp_path, fecha_inicio, fecha_fin, log_callback)

        # Limpiar archivo temporal
        import time
        import gc
        gc.collect()
        time.sleep(0.1)
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # ✅ LÓGICA DIFERENCIADA BASADA EN LA INFORMACIÓN RETORNADA
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return jsonify({
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'logs': logs, 
                'empty_range': True,
                'filter_empty': False
            }), 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro (servicios en efectivo)
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return jsonify({
                'error': 'No se encontraron servicios en efectivo para relacionar en el rango de fechas.', 
                'logs': logs, 
                'empty_range': False,
                'filter_empty': True
            }), 400

        # CASO 3: Hay datos válidos
        df = df.replace({np.nan: None})
        data = df.to_dict(orient='records')
        return jsonify({
            'data': data, 
            'logs': logs,
            'empty_range': False,
            'filter_empty': False
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_excel.route('/pdf_pendientes', methods=['POST'])
def pdf_pendientes():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        # Guardar archivo temporalmente
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        # Obtener fechas del form-data o usar valores por defecto
        fecha_inicio_str = request.form.get('fecha_inicio', '2024-01-01')
        fecha_fin_str = request.form.get('fecha_fin', '2024-12-31')
        notas = request.form.get('notas', '')
        nombre_pdf = request.form.get('nombre_pdf', '')
        from datetime import datetime
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400

        # ✅ CORRECCIÓN: Ahora la función retorna 3 valores
        df, messages, info = pending_excel_processor.process_excel_file(temp_path, fecha_inicio, fecha_fin)

        import time
        import gc
        gc.collect()
        time.sleep(0.1)
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # ✅ USAR LA MISMA LÓGICA DE VALIDACIÓN QUE EN /procesar_excel
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return jsonify({
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'logs': messages, 
                'empty_range': True
            }), 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return jsonify({
                'error': 'No se encontraron servicios pendientes por cobrar en el rango de fechas.', 
                'logs': messages, 
                'empty_range': False,
                'filter_empty': True
            }), 400

        # ✅ CASO 3: Hay datos válidos - CONTINUAR CON LA GENERACIÓN DEL PDF

        # Generar el PDF con nombre personalizado o automático
        if nombre_pdf and nombre_pdf.strip():
            # Usar el nombre enviado desde el frontend
            nombre_pdf_final = nombre_pdf.strip()
            if not nombre_pdf_final.endswith('.pdf'):
                nombre_pdf_final += '.pdf'
        else:
            # Generar nombre automático con fecha y hora
            nombre_pdf_final = f"Servicios_Pendientes_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
        
        # Ahora la función generate_pdf_report retorna exito, nombre_archivo, pdf_bytes, logs
        exito, nombre_archivo_descarga, pdf_bytes, logs_pdf = df_pending_report.generate_pdf_report(df, None, fecha_inicio, fecha_fin, nombre_pdf_final, notas)
        messages.extend(logs_pdf)
        if not exito or pdf_bytes is None:
            return jsonify({'error': 'No se pudo generar el PDF', 'logs': messages}), 500

        # Enviar el PDF como archivo descargable directamente desde la memoria
        import io
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=nombre_archivo_descarga
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_excel.route('/analytics', methods=['POST'])
def analytics():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        fecha_inicio_str = request.form.get('fecha_inicio', '2024-01-01')
        fecha_fin_str = request.form.get('fecha_fin', '2024-12-31')
        work_mode = int(request.form.get('work_mode', 0))
        from datetime import datetime
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400

        import time
        import gc
        import numpy as np
        import pandas as pd
        gc.collect()
        time.sleep(0.1)

        # Leer Excel robusto (todas las hojas)
        xls = pd.ExcelFile(temp_path, engine='openpyxl')
        dfs = []
        for hoja in xls.sheet_names:
            df_hoja = pd.read_excel(xls, sheet_name=hoja)
            # Normalizar nombres de columnas
            df_hoja.columns = [str(col).strip() for col in df_hoja.columns]
            dfs.append(df_hoja)
        if not dfs:
            return jsonify({'error': 'No se encontraron hojas en el archivo Excel.'}), 400
        df = pd.concat(dfs, ignore_index=True)

        # Buscar columnas robustamente
        col_estado = find_column_variant(df, ['ESTADO DEL SERVICIO', 'Estado del Servicio', 'estado del servicio', 'ESTADO', 'Estado', 'STATUS', 'Status'])
        col_xporc = find_column_variant(df, ['X50%/X25%', 'X50%', 'X25%', 'PORCENTAJE', 'PORCENTAJE PAGO'])
        col_fecha = find_column_variant(df, ['FECHA', 'Fecha', 'fecha', 'FECHA SERVICIO', 'Fecha Servicio'])
        col_para_jg = find_column_variant(df, ['PARA JG', 'Para JG', 'para jg', 'JG', 'J.G.', 'PARA J.G.'])

        if not col_estado or not col_xporc or not col_fecha or not col_para_jg:
            return jsonify({'error': f'No se encontraron columnas requeridas. Estado: {col_estado}, X50%/X25%: {col_xporc}, Fecha: {col_fecha}, PARA JG: {col_para_jg}'}), 400

        # Limpiar valores
        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_xporc] = df[col_xporc].astype(str).str.strip()
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')
        df[col_para_jg] = df[col_para_jg].apply(limpiar_valor_monetario)
        if col_forma_pago:
            df[col_forma_pago] = df[col_forma_pago].astype(str).str.strip().str.upper().apply(unidecode)

        # Filtrar solo YA RELACIONADO
        df_filtrado = df[df[col_estado] == 'YA RELACIONADO'].copy()
        df_filtrado = df_filtrado[df_filtrado[col_fecha].notna()].copy()
        # Convertir formato de mes de "2025-01" a "Enero 2025"
        meses_espanol = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        df_filtrado['MES'] = df_filtrado[col_fecha].apply(lambda x: f"{meses_espanol[x.month]} {x.year}" if pd.notna(x) else None)
        
        # Filtrar solo EFECTIVO
        df_efectivo = df[df[col_forma_pago] == 'EFECTIVO'].copy() if col_forma_pago else df.iloc[0:0].copy()
        df_efectivo = df_efectivo[df_efectivo[col_fecha].notna()].copy()
        df_efectivo['MES'] = df_efectivo[col_fecha].apply(lambda x: f"{meses_espanol[x.month]} {x.year}" if pd.notna(x) else None)
        
        # Calcular resumen por mes según condiciones solicitadas
        df['MES'] = df[col_fecha].apply(lambda x: f"{meses_espanol[x.month]} {x.year}" if pd.notna(x) else None)
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
        
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")
        
        # Convertir tipos de numpy antes de serializar a JSON
        resumen_convertido = convert_numpy_types(resumen)
        pendientes_por_mes_convertido = convert_numpy_types(pendientes_por_mes)
        
        return jsonify({
            'resumen': resumen_convertido, 
            'pendientes_por_mes': pendientes_por_mes_convertido,
            'total_pendientes_relacionar': total_pendientes_relacionar_global,
            'total_pendientes_cobrar': total_pendientes_cobrar_global,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_excel.route('/pdf_relacion_servicios', methods=['POST'])
def pdf_relacion_servicios():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        # Guardar archivo temporalmente
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        # Obtener fechas del form-data o usar valores por defecto
        fecha_inicio_str = request.form.get('fecha_inicio', '2024-01-01')
        fecha_fin_str = request.form.get('fecha_fin', '2024-12-31')
        notas = request.form.get('notas', '')
        nombre_pdf = request.form.get('nombre_pdf', '')
        imagenes_json = request.form.get('imagenes', '[]')
        import json
        try:
            imagenes = json.loads(imagenes_json)
        except Exception:
                imagenes = []

        from datetime import datetime
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return jsonify({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}), 400

        # Procesar el archivo para obtener la relación de servicios
        logs = []
        def log_callback(msg, level='info'):
            logs.append({'level': level, 'text': msg})
        
        # ✅ CORRECCIÓN: Ahora la función retorna 2 valores (df, info)
        df, info = excel_processor.extraer_servicios(temp_path, fecha_inicio, fecha_fin, log_callback)

        import time
        import gc
        gc.collect()
        time.sleep(0.1)
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # ✅ USAR LA MISMA LÓGICA DE VALIDACIÓN QUE EN /relacion_servicios
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return jsonify({
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'logs': logs, 
                'empty_range': True
            }), 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return jsonify({
                'error': 'No se encontraron servicios en efectivo para relacionar en el rango de fechas.', 
                'logs': logs, 
                'empty_range': False,
                'filter_empty': True
            }), 400

        # ✅ CASO 3: Hay datos válidos - CONTINUAR CON LA GENERACIÓN DEL PDF

        # Generar el PDF con nombre personalizado o automático
        if nombre_pdf and nombre_pdf.strip():
            # Usar el nombre enviado desde el frontend
            nombre_pdf_final = nombre_pdf.strip()
            if not nombre_pdf_final.endswith('.pdf'):
                nombre_pdf_final += '.pdf'
        else:
            # Generar nombre automático con fecha y hora
            nombre_pdf_final = f"Relacion_Servicios_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
        
        exito, mensaje, pdf_bytes = pdf_generator.generar_pdf_modular(df, nombre_pdf_final, notas, fecha_inicio, fecha_fin, log_callback, imagenes=imagenes)
        if not exito or pdf_bytes is None:
            return jsonify({'error': mensaje, 'logs': logs}), 500

        # Enviar el PDF como archivo descargable directamente desde la memoria
        # Se envían los bytes del PDF y se especifica el mimetype y el nombre del archivo
        import io
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=nombre_pdf_final
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_excel.route('/analytics_pendientes_efectivo', methods=['POST'])
def analytics_pendientes_efectivo():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        import time
        import gc
        import numpy as np
        import pandas as pd
        gc.collect()
        time.sleep(0.1)

        # Leer Excel robusto (todas las hojas)
        xls = pd.ExcelFile(temp_path, engine='openpyxl')
        dfs = []
        for hoja in xls.sheet_names:
            df_hoja = pd.read_excel(xls, sheet_name=hoja)
            # Normalizar nombres de columnas
            df_hoja.columns = [str(col).strip() for col in df_hoja.columns]
            dfs.append(df_hoja)
        if not dfs:
            return jsonify({'error': 'No se encontraron hojas en el archivo Excel.'}), 400
        df = pd.concat(dfs, ignore_index=True)

        # Buscar columnas robustamente
        col_estado = find_column_variant(df, ['ESTADO DEL SERVICIO', 'Estado del Servicio', 'estado del servicio', 'ESTADO', 'Estado', 'STATUS', 'Status'])
        col_xporc = find_column_variant(df, ['X50%/X25%', 'X50%', 'X25%', 'PORCENTAJE', 'PORCENTAJE PAGO'])
        col_fecha = find_column_variant(df, ['FECHA', 'Fecha', 'fecha', 'FECHA SERVICIO', 'Fecha Servicio'])
        col_para_jg = find_column_variant(df, ['PARA JG', 'Para JG', 'para jg', 'JG', 'J.G.', 'PARA J.G.'])
        col_para_abrecar = find_column_variant(df, ['PARA ABRECAR', 'Para Abrecar', 'para abrecar', 'ABRECAR', 'Abrecar'])
        col_iva = find_column_variant(df, ['IVA 19%', 'IVA', 'Iva', 'iva', 'IVA%', 'IVA %', 'IVA TOTAL', 'TOTAL IVA', 'IMPUESTO', 'Impuesto'])
        col_forma_pago = find_column_variant(df, ['FORMA DE PAGO', 'FORMA_PAGO', 'FORMA PAGO'])
        col_servicio = find_column_variant(df, ['SERVICIO REALIZADO', 'Servicio Realizado', 'servicio realizado', 'SERVICIO', 'Servicio', 'DESCRIPCION', 'Descripcion'])

        if not col_estado or not col_xporc or not col_fecha or not col_para_jg or not col_forma_pago:
            return jsonify({'error': f'No se encontraron columnas requeridas. Estado: {col_estado}, X50%/X25%: {col_xporc}, Fecha: {col_fecha}, PARA JG: {col_para_jg}, Forma Pago: {col_forma_pago}'}), 400

        # Limpiar valores
        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_xporc] = df[col_xporc].astype(str).str.strip()
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')
        df[col_para_jg] = df[col_para_jg].apply(limpiar_valor_monetario)
        if col_para_abrecar:
            df[col_para_abrecar] = df[col_para_abrecar].apply(limpiar_valor_monetario)
        if col_iva:
            df[col_iva] = df[col_iva].apply(limpiar_valor_monetario)
        df[col_forma_pago] = df[col_forma_pago].astype(str).str.strip().str.upper().apply(unidecode)

        # Filtrar servicios en efectivo que NO tienen estado "YA RELACIONADO"
        # También incluir servicios con estado vacío, nulo o 'nan'
        mask_efectivo = df[col_forma_pago] == 'EFECTIVO'
        mask_fecha = df[col_fecha].notna()
        mask_estado = (
            (df[col_estado] != 'YA RELACIONADO') |
            (df[col_estado].isna()) |
            (df[col_estado].astype(str).str.strip() == '')
        )
        
        df_filtrado = df[mask_efectivo & mask_fecha & mask_estado].copy()

        if df_filtrado.empty:
            return jsonify({
                'resumen': {},
                'detalle': [],
                'success': True,
                'filter_empty': True,
            })

        # Calcular días sin relacionar (diferencia entre fecha actual y fecha del servicio)
        fecha_actual = datetime.now()
        df_filtrado['dias_sin_relacionar'] = (fecha_actual - df_filtrado[col_fecha]).dt.days # type: ignore

        # Agregar columna de mes para agrupar
        df_filtrado['MES'] = pd.Series(df_filtrado[col_fecha].dt.to_period('M').astype(str), index=df_filtrado.index)

        # Calcular resumen por mes
        resumen = {}
        meses = set(df_filtrado['MES'][df_filtrado['MES'].notna()].unique())

        for mes in meses:
            grupo_mes = df_filtrado[df_filtrado['MES'] == mes]

            # Usar valores de ABRECAR si están disponibles, sino usar JG
            if col_para_abrecar:
                total_valor = grupo_mes[col_para_abrecar].sum()
            else:
                total_valor = grupo_mes[col_para_jg].sum()

            dias_sin_relacionar = grupo_mes['dias_sin_relacionar'].max() if not grupo_mes.empty else 0

            # Determinar si hay advertencia para este mes
            servicios_antiguos = grupo_mes[grupo_mes['dias_sin_relacionar'] > 30]
            tiene_pendientes = len(servicios_antiguos) > 0

            # Crear mensaje de advertencia para este mes
            if tiene_pendientes:
                advertencia = f"⚠️ ADVERTENCIA: Hay {len(servicios_antiguos)} servicios en efectivo con más de 30 días sin relacionar"
            else:
                advertencia = "✅ Todos los servicios en efectivo están al día"

            resumen[mes] = {
                'total_servicios': len(grupo_mes),
                'total_valor': total_valor,
                'dias_sin_relacionar': dias_sin_relacionar,
                'tiene_pendientes': tiene_pendientes,
                'advertencia': advertencia
            }

        # Preparar detalle de servicios para mostrar (todos los datos filtrados)
        detalle = []
        for _, row in df_filtrado.iterrows():
            # Manejar el estado - cambiar 'nan' por 'Sin Relacionar'
            estado = row[col_estado]
            if pd.isna(estado) or str(estado).strip().upper() in ['NAN', 'NONE', '']:
                estado_display = 'Sin Relacionar'
            else:
                estado_display = str(estado).strip()
            
            # Manejar el servicio realizado
            servicio_realizado = row[col_servicio] if col_servicio and pd.notna(row[col_servicio]) else 'No especificado'
            if pd.isna(servicio_realizado) or str(servicio_realizado).strip() == '':
                servicio_realizado = 'No especificado'
            else:
                servicio_realizado = str(servicio_realizado).strip()
            
            # Manejar valores monetarios
            valor_abrecar = row[col_para_abrecar] if col_para_abrecar and pd.notna(row[col_para_abrecar]) else 0
            valor_iva = row[col_iva] if col_iva and pd.notna(row[col_iva]) else 0
            valor_subtotal = valor_abrecar - valor_iva if valor_abrecar > 0 else 0
            
            # Si no hay columna ABRECAR, usar JG como fallback
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

        # Ordenar por días sin relacionar (más antiguos primero)
        detalle.sort(key=lambda x: x['dias_sin_relacionar'], reverse=True)

        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # Convertir tipos de numpy antes de serializar a JSON
        resumen_convertido = convert_numpy_types(resumen)
        detalle_convertido = convert_numpy_types(detalle)

        return jsonify({
            'resumen': resumen_convertido,
            'detalle': detalle_convertido,
            'success': True
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_excel.route('/analytics_pendientes_cobrar', methods=['POST'])
def analytics_pendientes_cobrar():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    if filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    try:
        temp_path = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)

        import time
        import gc
        import numpy as np
        import pandas as pd
        gc.collect()
        time.sleep(0.1)

        # Leer Excel robusto (todas las hojas)
        xls = pd.ExcelFile(temp_path, engine='openpyxl')
        dfs = []
        for hoja in xls.sheet_names:
            df_hoja = pd.read_excel(xls, sheet_name=hoja)
            df_hoja.columns = [str(col).strip() for col in df_hoja.columns]
            dfs.append(df_hoja)
        if not dfs:
            return jsonify({'error': 'No se encontraron hojas en el archivo Excel.'}), 400
        df = pd.concat(dfs, ignore_index=True)

        # Buscar columnas
        col_estado = find_column_variant(df, ['ESTADO DEL SERVICIO', 'Estado del Servicio', 'estado del servicio', 'ESTADO', 'Estado', 'STATUS', 'Status'])
        col_fecha = find_column_variant(df, ['FECHA', 'Fecha', 'fecha', 'FECHA SERVICIO', 'Fecha Servicio'])
        col_servicio = find_column_variant(df, ['SERVICIO REALIZADO', 'Servicio Realizado', 'servicio realizado', 'SERVICIO', 'Servicio', 'DESCRIPCION', 'Descripcion'])

        if not col_estado or not col_fecha or not col_servicio:
            return jsonify({'error': f'No se encontraron columnas requeridas. Estado: {col_estado}, Fecha: {col_fecha}, Servicio: {col_servicio}'}), 400

        # Limpiar valores
        df[col_estado] = df[col_estado].astype(str).str.strip().str.upper().apply(unidecode)
        df[col_fecha] = pd.to_datetime(df[col_fecha], errors='coerce')

        # Filtrar por estado 'PENDIENTE COBRAR' (sin rango de fechas)
        mask_fecha = df[col_fecha].notna()
        mask_estado = df[col_estado] == 'PENDIENTE COBRAR'
        df_filtrado = df[mask_fecha & mask_estado].copy()

        if df_filtrado.empty:
            return jsonify({
                'resumen': {},
                'detalle': [],
                'success': True,
                'filter_empty': True,
            })

        # Calcular días de retraso
        fecha_actual = datetime.now()
        df_filtrado['dias_de_retraso'] = (fecha_actual - df_filtrado[col_fecha]).dt.days # type: ignore

        # Agregar columna de mes para agrupar
        df_filtrado['MES'] = pd.Series(df_filtrado[col_fecha].dt.to_period('M').astype(str), index=df_filtrado.index)

        # Calcular resumen por mes
        resumen = {}
        meses = set(df_filtrado['MES'][df_filtrado['MES'].notna()].unique())

        for mes in meses:
            grupo_mes = df_filtrado[df_filtrado['MES'] == mes]

            total_servicios = len(grupo_mes)
            servicios_retraso = len(grupo_mes[grupo_mes['dias_de_retraso'] > 30])
            max_dias_retraso = grupo_mes['dias_de_retraso'].max() if not grupo_mes.empty else 0
            fecha_mas_antigua = grupo_mes[col_fecha].min().strftime('%Y-%m-%d') if not grupo_mes.empty else 'N/A'

            resumen[mes] = {
                'total_servicios': total_servicios,
                'servicios_retraso': servicios_retraso,
                'max_dias_retraso': max_dias_retraso,
                'fecha_mas_antigua': fecha_mas_antigua
            }

        # Preparar detalle
        detalle = []
        for _, row in df_filtrado.iterrows():
            dias = row['dias_de_retraso']
            mensaje = 'PONER AL DÍA COBROS DE ESTE SERVICIO' if dias > 30 else ''
            detalle.append({
                'fecha': row[col_fecha].strftime('%Y-%m-%d') if pd.notna(row[col_fecha]) else 'N/A',
                'estado': row[col_estado],
                'servicio_realizado': row[col_servicio] if pd.notna(row[col_servicio]) else 'No especificado',
                'dias_de_retraso': dias,
                'mensaje': mensaje
            })

        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"No se pudo borrar el archivo temporal: {e}")

        # Convertir tipos de numpy antes de serializar a JSON
        resumen_convertido = convert_numpy_types(resumen)
        detalle_convertido = convert_numpy_types(detalle)

        return jsonify({
            'resumen': resumen_convertido,
            'detalle': detalle_convertido,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
