import pandas as pd
import dateparser
from datetime import datetime
import re

def fecha_larga(fecha):
    """
    Convierte una fecha al formato largo en español: 1 de junio de 2024

    Args:
        fecha: Fecha a convertir (puede ser string o datetime)
        
    Returns:
        str: Fecha en formato largo o cadena vacía si es inválida
"""
    meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    if pd.isnull(fecha):
        return ""
    if isinstance(fecha, str):
        try:
            fecha = pd.to_datetime(fecha, dayfirst=True)
        except Exception:
            return fecha
    return f"{fecha.day} de {meses[fecha.month - 1]} de {fecha.year}" 

def mes_espaniol(fecha):
    """
    Devuelve el mes y año en españos al log
    """
    meses=[
        "Enero", "Febrero", "Marzo", "Abril", "Mayo",
        "junio", "julio", "Agosto", "septiembre", "octubre",
        "Noviembre", "Diciembre"
    ]
    if hasattr(fecha, "month",) and hasattr(fecha, "year"):
        return f"{meses[fecha.month - 1].capitalize()} {fecha.year}"
        
    return ""

def parse_fecha_espanol(fecha_str):
    """
    Convierte un string de fecha en español (cualquier formato) o estándar a un objeto datetime.
    Devuelve None si no se puede convertir.
    Intenta primero con formatos ISO, luego pandas, luego dateparser.
    """
    import re
    from datetime import datetime
    import pandas as pd
    import dateparser
    if isinstance(fecha_str, datetime):
        return fecha_str
    if not isinstance(fecha_str, str):
        print("[parse_fecha_espanol] Valor no string recibido:", fecha_str, type(fecha_str))
        return None
    # Limpieza del string
    fecha_str_limpio = fecha_str.strip().replace('\n', ' ').replace('\r', ' ')
    fecha_str_limpio = re.sub(' +', ' ', fecha_str_limpio)
    # 1. Intentar formato ISO: 'YYYY-MM-DD HH:MM:SS'
    try:
        return datetime.strptime(fecha_str_limpio, "%Y-%m-%d %H:%M:%S")
    except Exception:
        pass
    # 2. Intentar con pandas
    try:
        fecha_pd = pd.to_datetime(fecha_str_limpio, errors='raise', dayfirst=True)
        return fecha_pd.to_pydatetime() if hasattr(fecha_pd, 'to_pydatetime') else fecha_pd
    except Exception:
        pass
    # 3. Intentar con dateparser
    fecha = dateparser.parse(fecha_str_limpio, languages=['es'])
    if fecha is None:
        print(f"[parse_fecha_espanol] No se pudo convertir: '{fecha_str}' -> '{fecha_str_limpio}'")
    return fecha
