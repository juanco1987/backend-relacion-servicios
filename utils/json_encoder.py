from flask.json.provider import DefaultJSONProvider
import numpy as np
import pandas as pd
from datetime import date, datetime

class CustomJSONProvider(DefaultJSONProvider):
    """
    JSON Provider personalizado para Flask 2.3+ (incluyendo 3.x)
    Maneja tipos de datos de NumPy y Pandas automáticamente.
    """
    def default(self, obj):
        # Manejo de tipos NumPy enteros (int64, int32, etc)
        if isinstance(obj, np.integer):
            return int(obj)
        
        # Manejo de tipos NumPy flotantes (float64, float32, etc)
        if isinstance(obj, np.floating):
            # Convertir NaN/Infinity a None para JSON válido
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        
        # Manejo de arrays de NumPy
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        
        # Manejo de tipos Pandas (Timestamp, NaT, NA)
        if pd.isna(obj):  # Esto atrapa np.nan, pd.NA, pd.NaT
            return None
            
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
            
        # Dejar que el provider por defecto maneje el resto
        return super().default(obj)
