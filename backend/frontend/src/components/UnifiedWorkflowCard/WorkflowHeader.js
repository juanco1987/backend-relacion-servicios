import { Box, Typography } from "@mui/material";

/**
 * Encabezado del flujo de trabajo.
 * 
 * Props:
 * - theme: objeto de tema con colores
 * - workMode: número (0 = Relación de Servicios, 1 = Pendientes de Pago)
 * - actionIcon: ruta del ícono a mostrar
 */
const WorkflowHeader = ({ theme, workMode, actionIcon }) => {
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
          {workMode === 0 ? "Relación de Servicios" : "Pendientes de Pago"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.textoSecundario,
            mt: 1,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          Flujo de trabajo unificado para generar reportes
        </Typography>
      </Box>
    </Box>
  );
};

export default WorkflowHeader;
