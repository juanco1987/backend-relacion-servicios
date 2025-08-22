import React from 'react';
import { 
  Box, Typography, Grid, Chip, Grow
} from '@mui/material';

const StatusChip = ({ theme, label, isCompleted, icon = null, delay = 0, isPdfChip = false }) => {
  return (
    <Grow in={true} timeout={200 + delay}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Chip
          label={
            icon ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img src={icon} alt="PDF" style={{ width: 20, height: 20 }} />
                {label}
              </Box>
            ) : (
              label
            )
          }
          color={isCompleted ? 'success' : 'default'}
          variant="outlined"
          sx={{
            width: '100%',
            background: isCompleted ? theme.terminalVerde : theme.fondoOverlay,
            color: isCompleted ? '#fff' : theme.textoPrincipal,
            boxShadow: isPdfChip && isCompleted
              ? (theme.modo === 'claro'
                ? `${theme.neon?.exitoGlow ? `0 0 24px 8px ${theme.neon.exitoGlow}, ` : ''}0 0 16px 4px ${theme.neon?.exito}, 0 0 32px 8px ${theme.neon?.exito}80`
                : `0 0 12px 2px ${theme.neon?.exito}, 0 0 32px 8px ${theme.neon?.exito}80`)
              : theme.sombraComponente,
            fontWeight: 600,
            letterSpacing: 0.5,
            border: `2px solid ${isCompleted ? theme.terminalVerde : theme.bordePrincipal}`,
            transition: 'background 0.5s, color 0.5s, border-color 0.5s',
            pointerEvents: 'none',
            zIndex: 1,
            position: 'relative',
          }}
        />
        {isCompleted && (
          <Box
            sx={{
              position: 'absolute',
              left: '-6px',
              top: '-6px',
              width: 'calc(100% + 12px)',
              height: 'calc(100% + 12px)',
              pointerEvents: 'none',
              zIndex: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', left: 0, top: 0 }}
            >
              <rect
                x="4" y="4"
                width="calc(100% - 8px)"
                height="calc(100% - 8px)"
                rx="18"
                ry="18"
                fill="none"
                stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                strokeWidth="3"
                strokeDasharray="440"
                strokeDashoffset="440"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="440"
                  to="0"
                  dur="2.4s"
                  fill="freeze"
                  keySplines="0.4 0 0.2 1"
                  calcMode="spline"
                />
              </rect>
            </svg>
          </Box>
        )}
      </Box>
    </Grow>
  );
};

const WorkflowStatus = ({
  theme,
  archivoExcel,
  userHasConfiguredDates,
  processing,
  dataProcessed,
  pdfGenerated,
  pdfIcon
}) => {
  return (
    <Box sx={{ mt: 4, p: 3, background: theme.fondoOverlay, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: theme.textoPrincipal }}>
        Estado actual
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatusChip
            theme={theme}
            label={archivoExcel ? 'Archivo cargado' : 'Sin archivo'}
            isCompleted={!!archivoExcel}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusChip
            theme={theme}
            label={userHasConfiguredDates ? 'Fechas configuradas' : 'Fechas pendientes'}
            isCompleted={userHasConfiguredDates}
            delay={150}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusChip
            theme={theme}
            label={processing ? 'Procesando...' : (dataProcessed ? 'Procesado exitosamente' : 'Listo para procesar')}
            isCompleted={dataProcessed}
            delay={300}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusChip
            theme={theme}
            label={dataProcessed ? 'Listo para generar' : 'Configuración incompleta'}
            isCompleted={dataProcessed}
            delay={500}
          />
        </Grid>
        {pdfGenerated && (
          <Grid item xs={12} sm={6} md={3}>
            <StatusChip
              theme={theme}
              label="PDF generado"
              isCompleted={true}
              icon={pdfIcon}
              delay={700}
            />
          </Grid>
        )}
      </Grid>
      <style>{`
        @keyframes underline-grow {
          from { width: 0%; opacity: 0.5; }
          60% { width: 100%; opacity: 1; }
          to { width: 100%; opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default WorkflowStatus;