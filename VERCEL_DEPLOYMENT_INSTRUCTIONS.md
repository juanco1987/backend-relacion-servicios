# Instrucciones para Desplegar en Vercel

## Configuración de Variables de Entorno

Para que el frontend funcione correctamente con el backend, necesitas configurar la variable de entorno `REACT_APP_API_URL` en Vercel:

### Pasos:

1. **Accede a tu dashboard de Vercel**
2. **Selecciona tu proyecto** (frontend-relacion-servicios)
3. **Ve a Settings > Environment Variables**
4. **Agrega la siguiente variable:**
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://backend-relacion-servicios.onrender.com`
   - **Environment:** Production, Preview, Development (todas)

### Verificación:

Después de configurar la variable de entorno:

1. **Redeploya tu aplicación** en Vercel
2. **Verifica en la consola del navegador** que la URL del backend sea la correcta
3. **Prueba la funcionalidad** subiendo un archivo Excel

### Notas Importantes:

- La variable `REACT_APP_API_URL` debe tener el prefijo `REACT_APP_` para que React la reconozca
- El backend ya está funcionando correctamente en `https://backend-relacion-servicios.onrender.com`
- Todos los endpoints están disponibles y funcionando
- El problema del error 401 en `manifest.json` es un problema de Vercel, no de tu API

### URLs Actualizadas:

- **Frontend:** `https://frontend-relacion-servicios-3bnf38i4e.vercel.app`
- **Backend:** `https://backend-relacion-servicios.onrender.com`

### Endpoints Disponibles:

- `/api/relacion_servicios` - Para servicios en efectivo
- `/api/procesar_excel` - Para servicios pendientes
- `/api/analytics` - Para análisis de datos
- `/api/gastos/generar-pdf` - Para generar PDFs de gastos
- Y más...

Una vez configurada la variable de entorno, tu aplicación debería funcionar correctamente.
