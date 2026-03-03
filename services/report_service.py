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
            
            # 4. Cálculos Detallados
            
            # 4.1. Agrupar Consignaciones por Aportante
            aportes_abrecar = 0
            aportes_jg = 0
            aportes_otros = {} # {nombre: monto}
            aportes_efectivo_del_servicio = 0  # Nuevo: Dinero no contabilizado del servicio
            
            for c in consignaciones:
                monto = float(c.get('monto', 0))
                entregador = c.get('entregadoPor', '').upper()
                
                if 'EFECTIVO DEL SERVICIO' in entregador:
                    # Dinero del servicio - no se contabiliza como aporte
                    aportes_efectivo_del_servicio += monto
                elif 'JG' in entregador:
                    aportes_jg += monto
                elif 'OTROS:' in entregador:
                    nombre = entregador.replace('OTROS:', '').strip()
                    aportes_otros[nombre] = aportes_otros.get(nombre, 0) + monto
                else:
                    # CUENTA BANCOLOMBIA, NEQUI, DAVIPLATA, EFECTIVO -> ABRECAR
                    aportes_abrecar += monto
            
            if not consignaciones and monto_consignado_unico > 0:
                aportes_abrecar = monto_consignado_unico

            # 4.2. Agrupar Gastos por Responsable
            gastos_abrecar = 0
            gastos_jg = 0
            gastos_otros = 0 # Gastos marcados como OTROS se restan del fondo de OTROS o Abrecar?
            gastos_efectivo_del_servicio = 0  # Nuevo: Gastos pagados del efectivo del servicio (no se deben)
            # Según el requerimiento: "se descuenta a lo que haya aportado abrecar los gastos que se le reporten a el 
            # y los gastos que se determinen como otros en el balance final aparezca como abrecar le deba a pepito perez"
            
            # Reinterpreto: 
            # Si un gasto es de 'OTROS' (Pepito), y Pepito NO puso dinero, Abrecar le debe a Pepito.
            # Si Pepito puso dinero, se gasta de ahí primero.
            # Si un gasto es de 'EFECTIVO DEL SERVICIO', se toma del pago del servicio y NO se debe contar como pendiente
            
            total_gastos_otros_por_nombre = {} # {nombre: monto}
            
            for g in gastos:
                monto = float(g.get('monto', 0))
                pagado_por = g.get('pagadoPor', 'ABRECAR').upper()
                
                if 'EFECTIVO DEL SERVICIO' in pagado_por:
                    # Gastos pagados del efectivo del servicio - no se consideran en balance
                    gastos_efectivo_del_servicio += monto
                elif 'JG' in pagado_por:
                    gastos_jg += monto
                elif 'OTROS' in pagado_por:
                    # Si hay varios "Otros", por ahora los agrupamos o intentamos machear con el primer aportante "Otro"
                    # El front actual solo manda "OTROS". Si hay varios, es complejo.
                    # Asumiremos que si hay aportes de "Pepito", los gastos "OTROS" son de él.
                    nombre_otro = "OTROS"
                    if aportes_otros:
                        nombre_otro = list(aportes_otros.keys())[0] # Tomamos el primero por simplicidad si no hay match
                    
                    total_gastos_otros_por_nombre[nombre_otro] = total_gastos_otros_por_nombre.get(nombre_otro, 0) + monto
                    gastos_otros += monto
                else:
                    gastos_abrecar += monto

            total_gastos = gastos_abrecar + gastos_jg + gastos_otros  # NO incluye gastos_efectivo_del_servicio
            total_consignado = aportes_abrecar + aportes_jg + sum(aportes_otros.values())
            
            # 4.3. Balances Individuales
            # Abrecar tiene su propia "caja" y el usuario tiene el dinero físico.
            vueltas_abrecar = aportes_abrecar - gastos_abrecar
            
            # Para JG y Otros: Son deudas que Abrecar debe cubrir / reintegrar.
            # Se usa el máximo entre lo aportado y lo gastado para evitar doble conteo 
            # si reportaron el mismo dinero en ambos pasos (aporte y gasto).
            
            # Para JG:
            balance_jg = max(aportes_jg, gastos_jg)
            
            # Para Otros:
            saldos_otros = {}
            for nombre, aporte in aportes_otros.items():
                gasto = total_gastos_otros_por_nombre.get(nombre, 0)
                balance = max(aporte, gasto)
                saldos_otros[nombre] = {
                    'aporte': aporte,
                    'gasto': gasto,
                    'balance': balance 
                }
            
            # Si hay gastos OTROS sin nombre (anonimos)
            gastos_otros_identificados = sum(v['gasto'] for v in saldos_otros.values())
            gastos_otros_anonimos = max(0, gastos_otros - gastos_otros_identificados)
            if gastos_otros_anonimos > 0:
                saldos_otros['OTROS'] = {
                    'aporte': 0,
                    'gasto': gastos_otros_anonimos,
                    'balance': gastos_otros_anonimos
                }

            # 4.4. Resultados finales
            calculos = {
                'totalGastos': total_gastos,
                'totalConsignado': total_consignado,
                'vueltasAFavorDeAbrecar': vueltas_abrecar if vueltas_abrecar > 0 else 0,
                'excedenteAFavorDeJG': balance_jg, 
                'balanceJG': balance_jg,
                'saldosOtros': saldos_otros,
                'detallado': True
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
