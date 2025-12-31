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
  PaperProps: {
    sx: {
      background: theme.fondoContenedor,
      border: 'none', // CORREGIDO: Entre comillas
      boxShadow: theme.sombraContenedor,
      borderRadius: '16px !important',
      // permitir que el menú pueda desplegarse y scrollear
      overflow: 'visible',
      // permitir que el menú crezca hasta una proporción de la pantalla
      maxHeight: '60vh',
      zIndex: 1800,
      marginTop: '8px',
      '& > *': { borderRadius: '16px !important' },
      '& .MuiList-root': {
        padding: 0,
        borderRadius: '16px !important',
        // dejar que la lista pueda hacer scroll si es necesario
        overflow: 'visible !important',
      },
      '& .MuiMenu-list': {
        padding: 0,
        borderRadius: '16px !important',
        maxHeight: '60vh',
        overflowY: 'auto',
        // asegurar que el scroll sea visible
        WebkitOverflowScrolling: 'touch',
      },
      '& ul': {
        padding: '0 !important',
        borderRadius: '16px !important',
        overflow: 'visible !important',
        margin: 0,
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