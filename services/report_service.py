import os
import pandas as pd
import numpy as np
from datetime import datetime
from core import pending_excel_processor, excel_processor, df_pending_report, pdf_generator, gasto_pdf_generator
import io
import traceback

class ReportService:
    @staticmethod
    def validate_initial_file(file, filename, fecha_inicio_str, fecha_fin_str, notes):
        """
        Valida el archivo inicial y las fechas.
        Retorna un dict con success, data (metadata) o error.
        """
        if not filename:
            return {'success': False, 'error': 'Nombre de archivo vacío'}
        
        if not fecha_inicio_str or not fecha_fin_str:
            return {'success': False, 'error': 'Fechas de inicio y fin son requeridas'}
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')
        except Exception:
            return {'success': False, 'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}
        
        if fecha_inicio > fecha_fin:
            return {'success': False, 'error': 'La fecha de inicio no puede ser mayor que la fecha de fin'}
        
        # Guardar archivo temporalmente para validación
        # NOTA: Mantenemos la lógica original de guardar en 'temp/' manualmente aquí 
        # porque es un endpoint de pre-validación que a veces se usa diferente.
        # Pero idealmente deberíamos usar el context manager si solo es lectura.
        # Por compatibilidad con el código existente que espera esta ruta específica si fuera necesario,
        # usaremos un enfoque seguro.
        
        from flask import current_app
        try:
            temp_dir = current_app.config.get('UPLOAD_FOLDER', 'temp')
        except RuntimeError:
            temp_dir = 'temp'
            
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, filename)
        
        try:
            file.save(temp_path)
            
            # Intentar leer el archivo
            try:
                df = pd.read_excel(temp_path)
                if df.empty:
                    return {'success': False, 'error': 'El archivo Excel está vacío'}
                
                row_count = len(df)
                if row_count < 1:
                    return {'success': False, 'error': 'El archivo debe contener al menos una fila de datos'}
                    
            except Exception as e:
                return {'success': False, 'error': f'Error al leer el archivo Excel: {str(e)}'}
                
        except Exception as e:
            return {'success': False, 'error': f'Error interno al guardar archivo: {str(e)}'}
            
        finally:
            # Limpiar
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception as e:
                print(f"No se pudo borrar el archivo temporal: {e}")

        return {
            'success': True,
            'data': {
                'filename': filename,
                'row_count': row_count,
                'fecha_inicio': fecha_inicio_str,
                'fecha_fin': fecha_fin_str,
                'notas': notes,
                'processed_at': datetime.now().isoformat()
            },
            'message': f'Datos validados exitosamente. Archivo: {filename}, Filas: {row_count}'
        }

    @staticmethod
    def get_pending_services_report(temp_path, fecha_inicio, fecha_fin):
        """
        Procesa el reporte de servicios pendientes.
        Retorna tupla (success, data/error, status_code).
        """
        # Procesar el archivo Excel
        df, messages, info = pending_excel_processor.process_excel_file(
            temp_path, fecha_inicio, fecha_fin
        )
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return False, {
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'messages': messages, 
                'empty_range': True,
                'filter_empty': False
            }, 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro (servicios pendientes)
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return False, {
                'error': 'No se encontraron servicios pendientes por cobrar en el rango de fechas.', 
                'messages': messages, 
                'empty_range': False,
                'filter_empty': True
            }, 400

        # CASO 3: Hay datos válidos
        df = df.replace({np.nan: None})
        data = df.to_dict(orient='records')
        return True, {
            'data': data, 
            'messages': messages,
            'empty_range': False,
            'filter_empty': False
        }, 200

    @staticmethod
    def get_cash_services_report(temp_path, fecha_inicio, fecha_fin, log_callback):
        """
        Procesa el reporte de relación de servicios en efectivo.
        Retorna tupla (success, data/error, status_code).
        """
        # Procesar el archivo para obtener la relación de servicios
        df, info = excel_processor.extraer_servicios(
            temp_path, fecha_inicio, fecha_fin, log_callback
        )
        
        # CASO 1: No hay datos en el rango de fechas
        if not info['has_data_in_range']:
            return False, {
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                # logs se agregan en el controlador si es necesario, 
                # pero aquí retornamos los datos clave de error
                'empty_range': True,
                'filter_empty': False
            }, 400
        
        # CASO 2: Hay datos en el rango pero no cumplen el filtro (servicios en efectivo)
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return False, {
                'error': 'No se encontraron servicios en efectivo para relacionar en el rango de fechas.', 
                'empty_range': False,
                'filter_empty': True
            }, 400

        # CASO 3: Hay datos válidos
        df = df.replace({np.nan: None})
        data = df.to_dict(orient='records')
        return True, {
            'data': data, 
            'empty_range': False,
            'filter_empty': False
        }, 200

    @staticmethod
    def generate_pending_services_pdf(temp_path, fecha_inicio, fecha_fin, nombre_pdf, notas):
        """
        Genera el PDF de servicios pendientes.
        Retorna tupla (success, result/error, status_code/pdf_bytes).
        If success is True, result is filename and 3rd element is pdf path or bytes?
        Actually, the original returns send_file(path).
        Let's return (True, pdf_path, messages) on success.
        """
        # Procesar el archivo Excel
        df, messages, info = pending_excel_processor.process_excel_file(
            temp_path, fecha_inicio, fecha_fin
        )
        
        # Validaciones de datos
        if not info['has_data_in_range']:
            return False, {
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'logs': messages, 
                'empty_range': True
            }, 400
        
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return False, {
                'error': 'No se encontraron servicios pendientes por cobrar en el rango de fechas.', 
                'logs': messages, 
                'empty_range': False,
                'filter_empty': True
            }, 400

        # Generar nombre PDF
        if nombre_pdf and nombre_pdf.strip():
            nombre_pdf_final = nombre_pdf.strip()
            if not nombre_pdf_final.endswith('.pdf'):
                nombre_pdf_final += '.pdf'
        else:
            nombre_pdf_final = f"Servicios_Pendientes_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
        
        exito, ruta_pdf, logs_pdf = df_pending_report.generate_pdf_report(
            df, temp_path, fecha_inicio, fecha_fin, nombre_pdf_final, notas
        )
        messages.extend(logs_pdf)
        
        if not exito or not ruta_pdf:
            return False, {'error': 'No se pudo generar el PDF', 'logs': messages}, 500

        return True, ruta_pdf, 200

    @staticmethod
    def generate_cash_services_pdf(temp_path, fecha_inicio, fecha_fin, notas, nombre_pdf, imagenes, log_callback):
        """
        Genera el PDF de relación de servicios.
        Retorna tupla (success, result/error_dict, pdf_bytes).
        """
        # Procesar para obtener relación
        df, info = excel_processor.extraer_servicios(
            temp_path, fecha_inicio, fecha_fin, log_callback
        )
        
        if not info['has_data_in_range']:
            return False, {
                'error': 'No se encontraron datos en el rango de fechas seleccionado.', 
                'empty_range': True
            }, 400
        
        if info['has_data_in_range'] and not info['has_filtered_data']:
            return False, {
                'error': 'No se encontraron servicios en efectivo para relacionar en el rango de fechas.', 
                'empty_range': False,
                'filter_empty': True
            }, 400

        # Nombre PDF
        if nombre_pdf and nombre_pdf.strip():
            nombre_pdf_final = nombre_pdf.strip()
            if not nombre_pdf_final.endswith('.pdf'):
                nombre_pdf_final += '.pdf'
        else:
            nombre_pdf_final = f"Relacion_Servicios_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
        
        result = pdf_generator.generar_pdf_modular(
            df, nombre_pdf_final, notas, fecha_inicio, fecha_fin, log_callback, imagenes=imagenes
        )
        
        # Manejar tupla de retorno del generador
        pdf_bytes = None
        if isinstance(result, tuple):
            if len(result) == 3:
                exito, mensaje, pdf_bytes = result
            elif len(result) == 2:
                exito, mensaje = result
            else:
                return False, {'error': 'Formato de respuesta inesperado del generador PDF'}, 500
        else:
            return False, {'error': 'Respuesta inválida del generador PDF'}, 500

        if not exito or pdf_bytes is None:
            return False, {'error': mensaje}, 500

        return True, {'filename': nombre_pdf_final}, pdf_bytes

    @staticmethod
    def generate_expenses_pdf(data):
        """
        Genera el PDF de reporte de gastos.
        Retorna (success, result_dict, pdf_bytes).
        """
        try:
            # 1. Recuperar listas
            gastos = data.get('gastos', [])
            consignaciones = data.get('consignaciones', [])
            nombre_pdf = data.get('nombrePDF', 'Reporte_Gastos')
            notas = data.get('notas', '')  # Notas generales del reporte
            
            # Fallback gasto único
            gasto_data_single = data.get('gastoData', {}) 
            if not gastos and gasto_data_single:
                gastos = [gasto_data_single]
            
            monto_consignado_unico = float(data.get('montoConsignado', 0))
            
            # 2. Imágenes
            imagenes = {
                'imagenesGastos': data.get('imagenesGastos', []),
                'imagenesConsignaciones': data.get('imagenesConsignaciones', []),
                'imagenesDevoluciones': data.get('imagenesDevoluciones', []),
            }
            
            # 3. Validar
            if not gastos and not consignaciones:
                return False, {'error': 'No se proporcionaron gastos ni consignaciones'}, 400
            
            # 4. Cálculos
            total_gastos = sum(float(g.get('monto', 0)) for g in gastos)
            total_consignado = sum(float(c.get('monto', 0)) for c in consignaciones)
            
            if not consignaciones and monto_consignado_unico > 0:
                 total_consignado = monto_consignado_unico
                 
            diferencia = total_consignado - total_gastos
            
            calculos = {
                'totalGastos': total_gastos,
                'totalConsignado': total_consignado,
                'vueltasAFavorDeAbrecar': diferencia if diferencia > 0 else 0,
                'excedenteAFavorDeJG': abs(diferencia) if diferencia < 0 else 0,
            }
            
            # 5. Estructura data
            data_para_pdf = {
                'gastos': gastos,
                'consignaciones': consignaciones,
            }
            
            # 6. Generar
            imagenes_safe = imagenes if imagenes else {
                'imagenesGastos': [],
                'imagenesConsignaciones': [],
                'imagenesDevoluciones': []
            }
            
            exito, pdf_bytes = gasto_pdf_generator.generar_pdf_gasto(
                gasto_data_formateado=data_para_pdf,
                calculos=calculos,
                imagenes=imagenes_safe,
                nombre_pdf=nombre_pdf,
                notas=notas  # Pasar las notas al generador
            )
            
            if exito and pdf_bytes:
                return True, {'filename': f'{nombre_pdf}.pdf'}, pdf_bytes
            else:
                return False, {'error': 'Error al generar PDF'}, 500
                
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"ERROR CRÍTICO en generar_pdf_gasto (Service): {str(e)}")
            return False, {'error': f'Error al generar PDF: {str(e)}', 'traceback': error_trace}, 500
