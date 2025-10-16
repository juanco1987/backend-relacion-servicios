import { Box, Typography } from "@mui/material";

/**
 * Encabezado del flujo de trabajo.
 * 
 * Props:
 * - theme: objeto de tema con colores
 * - workMode: número (0 = Relación de Servicios, 1 = Pendientes de Pago, 2 = Registro de Gastos, etc.)
 * - actionIcon: ruta del ícono a mostrar
 * - title: (NUEVO) título personalizado (opcional, si no se proporciona usa workMode)
 * - description: (NUEVO) descripción personalizada (opcional)
 */
const WorkflowHeader = ({ theme, workMode, actionIcon, title, description }) => {
  // Determinar título: usar el prop 'title' si se proporciona, sino usar workMode
  const getTitle = () => {
    if (title) return title; // Si se pasa un título personalizado, usarlo
    
    switch(workMode) {
      case 0:
        return "Relación de Servicios";
      case 1:
        return "Pendientes de Pago";
      case 2:
        return "Registro de Gastos y Consignaciones";
      default:
        return "Flujo de Trabajo";
    }
  };

  // Determinar descripción: usar el prop 'description' si se proporciona, sino usar genérica
  const getDescription = () => {
    if (description) return description;
    return "Flujo de trabajo unificado para generar reportes";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 4,
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <Box
        component="img"
        src={actionIcon}
        alt="Flujo de trabajo"
        sx={{
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          filter: theme.modo === "oscuro" ? "invert(1)" : "none",
        }}
      />
      <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: theme.textoPrincipal,
            fontSize: { xs: "1.5rem", md: "2rem" },
          }}
        >
          {getTitle()}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.textoSecundario,
            mt: 1,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          {getDescription()}
        </Typography>
      </Box>
    </Box>
  );
};

export default WorkflowHeader;