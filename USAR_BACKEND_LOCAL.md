# Cómo Usar el Backend Local

Esta guía te ayudará a configurar y usar el backend localmente en lugar del backend en Render.

## 📋 Pasos para Usar el Backend Local

### 1. Configurar el Frontend para Usar Backend Local

Ya se creó el archivo `frontend/.env.local` con la configuración para apuntar al backend local:
```
REACT_APP_API_URL=http://localhost:5000
```

### 2. Iniciar el Backend Local

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
# Asegúrate de estar en la raíz del proyecto
cd C:\PROYECTOS\AAP_WEB_REPORTES

# Activa tu entorno virtual (si usas uno)
# Por ejemplo:
# python -m venv venv
# venv\Scripts\activate  # En Windows

# Instala las dependencias si aún no lo has hecho
pip install -r requirements.txt

# Inicia el backend Flask
python app.py
```

El backend debería iniciarse en `http://localhost:5000`

### 3. Iniciar el Frontend

Abre **otra terminal** y ejecuta:

```bash
# Ve a la carpeta del frontend
cd frontend

# Instala dependencias si aún no lo has hecho
npm install

# Inicia el frontend en modo desarrollo
npm start
```

El frontend se abrirá automáticamente en `http://localhost:3000` y usará el backend local.

## 🔄 Cambiar Entre Backend Local y Render

### Para Usar Backend Local:
- Usa el archivo `frontend/.env.local` (ya está configurado)

### Para Usar Backend en Render:
1. Borra o renombra `frontend/.env.local`
2. O cambia el valor a: `REACT_APP_API_URL=https://backend-relacion-servicios.onrender.com`

**Nota:** Si cambias el archivo `.env.local`, necesitas reiniciar el servidor de desarrollo del frontend (`npm start`).

## ✅ Verificación

1. **Backend local funcionando**: Deberías ver en la terminal del backend:
   ```
   * Running on http://0.0.0.0:5000
   ```

2. **Frontend conectado**: Abre la consola del navegador (F12) y verifica que las peticiones vayan a `http://localhost:5000` en lugar de Render.

3. **Prueba la generación de PDF**: Genera un PDF de gastos y verifica que use el código local modificado.

## 🔍 Solución de Problemas

### El frontend sigue usando Render:
- Asegúrate de que `frontend/.env.local` existe
- Reinicia el servidor de desarrollo del frontend (`Ctrl+C` y luego `npm start` nuevamente)
- Verifica que no haya un archivo `.env` que sobrescriba la configuración

### El backend no inicia:
- Verifica que tengas todas las dependencias instaladas: `pip install -r requirements.txt`
- Verifica que el puerto 5000 no esté en uso
- Revisa los errores en la terminal

### CORS Error:
- El backend ya tiene `CORS` configurado, pero si tienes problemas, verifica que `flask-cors` esté instalado

## 📝 Notas Importantes

- El archivo `.env.local` solo afecta al desarrollo local
- Los cambios en el backend solo se aplican cuando usas el backend local
- Para producción en Render, los cambios necesitan ser desplegados

