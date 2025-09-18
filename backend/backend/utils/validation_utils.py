import pandas as pd

def limpiar_valor_monetario(valor_str):
    """
    Limpia y convierte una cadena de valor monetario a float.
    
    Args:
        valor_str: Valor en cadena o numérico a limpiar
        
    Returns:
        float: Valor monetario limpio o 0 si es inválido
"""
    try:
        if pd.isna(valor_str) or valor_str == '':
            return 0  
        valor_str = str(valor_str).strip()
        valor_str = valor_str.replace('$', '').replace(',', '').strip()
        return float(valor_str)
    except ValueError:
        return 0
