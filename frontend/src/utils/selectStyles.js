export const getCustomSelectSx = (theme) => ({
  background: theme.fondoContenedor,
  borderRadius: '30px',
  boxShadow: theme.sombraContenedor,
  color: theme.textoPrincipal,
  input: { color: theme.textoPrincipal, fontWeight: 500, background: 'transparent' },
  textarea: { color: theme.textoPrincipal, fontWeight: 500, background: 'transparent' },
  label: { color: theme.textoSecundario },
  '& .MuiInputBase-root': { color: theme.textoPrincipal, background: 'transparent' },
  '& .MuiOutlinedInput-root': { background: 'transparent', color: theme.textoPrincipal, borderRadius: '30px' },
  '& .MuiOutlinedInput-notchedOutline': { 
    borderColor: theme.bordePrincipal, 
    borderRadius: '30px', 
    borderWidth: '3px'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': { 
    borderColor: theme.bordeHover 
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
    borderColor: theme.bordeFoco 
  },
  '& .MuiSelect-icon': { color: theme.iconoPrincipal },
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.sombraHover,
  },
  '&.Mui-focused': {
    boxShadow: theme.sombraFoco,
  }
});

export const getCustomMenuProps = (theme) => ({
  // Forzar que el menú se renderice en `document.body` para evitar
  // que extensiones o el traductor del navegador modifiquen su contenedor
  // provocando inconsistencias en el DOM (removeChild errors).
  container: typeof document !== 'undefined' ? document.body : undefined,
  disablePortal: false,
  PaperProps: {
    sx: {
      background: theme.fondoContenedor,
      border: 'none', // CORREGIDO: Entre comillas
      boxShadow: theme.sombraContenedor,
      borderRadius: '16px !important',
      // permitir que el menú pueda desplegarse y que su contenido haga scroll
      overflow: 'hidden',
      // permitir que el menú crezca hasta una proporción de la pantalla
      maxHeight: '60vh',
      zIndex: 1800,
      marginTop: '8px',
      '& > *': { borderRadius: '16px !important' },
      '& .MuiList-root': {
        padding: 0,
        borderRadius: '16px !important',
        overflow: 'hidden',
      },
      '& .MuiMenu-list': {
        padding: 0,
        borderRadius: '16px !important',
        maxHeight: '60vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
      '& ul': {
        padding: '0 !important',
        borderRadius: '16px !important',
        overflow: 'auto',
        margin: 0,
        maxHeight: '60vh',
      },
      '& div': { borderRadius: '16px !important' },
    },
  },
  MenuListProps: {
    sx: {
      padding: '0 !important',
      borderRadius: '16px !important',
      maxHeight: '60vh',
      overflowY: 'auto !important',
      WebkitOverflowScrolling: 'touch',
      margin: 0,
      '& .MuiMenuItem-root': {
        padding: '10px 16px',
        color: theme.textoPrincipal,
        backgroundColor: 'transparent',
        borderRadius: '0 !important',
        '&:hover': {
          backgroundColor: theme.fondoHover || 'rgba(255, 255, 255, 0.1)', // CORREGIDO: Entre comillas
        },
        '&:not(:last-child)': {
          borderBottom: `1px solid ${theme.bordePrincipal}30`,
        },
      },
    },
  },
});

export const getCustomLabelSx = (theme) => ({
  color: theme.textoSecundario,
  '&.Mui-focused': {
    color: theme.primario,
  },
});