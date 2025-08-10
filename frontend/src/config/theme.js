// Tema centralizado para la app de reportes

const TEMA_OSCURO = {
  // Fondos
  fondoCuerpo: "#181f2a",
  fondoContenedor: "linear-gradient(135deg, #162447 80%, #1f4068 100%)",
  fondoOverlay: "rgba(44, 54, 80, 0.7)",
  fondoInputDeshabilitado: "#2a3441",
  fondoMenu: "#162447",
  fondoMenuActivo: "rgba(0,234,255,0.12)",
  
  // Texto
  textoPrincipal: "#ffffff",
  textoSecundario: "#cfd8dc",
  
  textoEnLinea: "#27c93f",
  textoAdvertencia: "#ffee00ff",
  textoInfo: "#64b5f6",
  textoDeshabilitado: "#b0b8c1",
  textoPlaceholder: "#b0b8c1",
  textoLink: "#64b5f6",
  
  // Bordes
  bordePrincipal: "#3a466e",
  bordeHover: "#5c6bc0",
  bordeFocus: "#00fff7",
  bordeDeshabilitado: "#2a3441",
  bordeTerminal: "#233554",
  
  // Iconos
  iconoPrincipal: "#fff",
  iconoSecundario: "#cfd8dc",
  iconoDeshabilitado: "#b0b8c1",
  
  // Sombras
  sombraContenedor: "18px 22px 44px 0 rgba(0,0,0,0.85)",
  sombraHover: "8px 12px 24px 0 rgba(0,0,0,0.6)",
  sombraFocus: "0 0 0 2px rgba(0,255,247,0.3)",
  sombraInput: "0 2px 8px 0 rgba(0,0,0,0.3)",
  sombraComponente: "6px 8px 18px 0 rgba(0,0,0,0.45)",
  sombraIcono: "8px 10px 24px 0 rgba(0,0,0,0.55)",
  sombraHeader: "0 2px 8px 0 rgba(0,0,0,0.10)",
  sombraExcelUploader: "10px 12px 28px 0 rgba(0,0,0,0.45)",
  
  // Colores especiales
  terminalRojo: "#ff5f56",
  terminalAmarillo: "#ffbd2e",
  terminalVerde: "#27c93f",
  terminalVerdeNeon: "#7FFF00",
  terminalNaranja: "#f6b62cef",
  terminalAzul: "#1E90FF",
  terminalOliva: "#808000",
  terminalRosa: "#FF1493",

  // Gradientes y efectos
  gradientes: {
    servicios: 'linear-gradient(135deg, #232b3b 80%, #00eaff 100%)',
    pendientes: 'linear-gradient(135deg, #311b92 80%, #e040fb 100%)',
    fondo: 'linear-gradient(135deg, #162447 80%, #1f4068 100%)',
    botonInactivo: 'linear-gradient(135deg, #232b3b 80%, #162447 100%)',
  },
  neon: {
    servicios: '0 0 16px 4px #00eaff',
    pendientes: '0 0 16px 4px #e040fb',
    exito: '#39ff14', // verde neón para animación de éxito
  },
};

const TEMA_CLARO = {
  // Fondos
  fondoCuerpo:"rgb(222, 240, 254)",
  fondoContenedor: "linear-gradient(135deg,rgb(206, 234, 255) 80%, #f7fbff 100%)",
  fondoOverlay: "rgba(227, 240, 250, 0.85)",
  fondoInputDeshabilitado: "#f3f6fa",
  fondoMenu: "#e3f0fa",
  fondoMenuActivo: "rgba(0,234,255,0.12)",
  
  // Texto
  textoPrincipal: "#162447",
  textoSecundario: "#1f4068",
  
  textoEnLinea: "#43b97f",
  textoAdvertencia: "#ffee00ff",
  textoInfo: "#1976d2",
  textoDeshabilitado: "#b0b8c1",
  textoPlaceholder: "#b0b8c1",
  textoLink: "#1976d2",
  
  // Bordes
  bordePrincipal: "#b5d0e6",
  bordeHover: "#64b5f6",
  bordeFocus: "#00bcd4",
  bordeDeshabilitado: "#c9e0f5",
  bordeTerminal: "#a8c6e8",
  
  // Iconos
  iconoPrincipal: "#162447",
  iconoSecundario: "#1f4068",
  iconoDeshabilitado: "#b0b8c1",
  
  // Sombras
  sombraContenedor: "12px 16px 32px 0 rgba(22, 36, 71, 0.25)",
  sombraHover: "6px 8px 16px 0 rgba(22, 36, 71, 0.2)",
  sombraFocus: "0 0 0 2px rgba(0, 188, 212, 0.3)",
  sombraInput: "0 2px 8px 0 rgba(22, 36, 71, 0.15)",
  sombraComponente: "4px 6px 12px 0 rgba(22, 36, 71, 0.15)",
  sombraIcono: "6px 8px 16px 0 rgba(22, 36, 71, 0.2)",
  sombraHeader: "0 2px 8px 0 rgba(22, 36, 71, 0.1)",
  sombraExcelUploader: "8px 10px 20px 0 rgba(22, 36, 71, 0.15)",
  
  // Colores especiales
  terminalRojo: "#ff5f56",
  terminalAmarillo: "#ffbd2e",
  terminalVerde: "#27c93f",
  terminalVerdeNeon: "#7FFF00",
  terminalAzul: "#1E90FF",
  terminalOliva: "#808000",
  terminalRosa: "#FF1493",
  
  // Gradientes y efectos
  gradientes: {
    servicios: 'linear-gradient(135deg, #b2ebf2 80%, #00eaff 100%)',
    pendientes: 'linear-gradient(135deg, #f3e5f5 80%, #e040fb 100%)',
    fondo: 'linear-gradient(135deg, #e3f0fa 80%, #f7fbff 100%)',
    botonInactivo: 'linear-gradient(135deg, #e3f0fa 80%, #d4e8f7 100%)',
  },
  neon: {
    servicios: '0 0 8px 2px #00eaff',
    pendientes: '0 0 8px 2px #e040fb',
    exito: '#39ff14', // verde neón para animación de éxito
  },
};

export const THEMES = {
  oscuro: TEMA_OSCURO,
  claro: TEMA_CLARO,
};

// Colores base para uso directo (si es necesario)
export const COLORS_BASE = {
  servicios: '#00eaff',
  pendientes: '#e040fb',
  error: '#ff1744',
  exito: '#00e676',
}; 