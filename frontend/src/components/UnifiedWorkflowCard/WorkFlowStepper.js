import React from 'react';
import { 
  Box, Typography, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import CustomButton from '../common/CustomButton';

const WorkflowStepper = ({
  theme,
  steps,
  activeStep,
  setActiveStep,
  archivoExcel,
  userHasConfiguredDates,
  dataProcessed,
  getStepStatus,
}) => {
  const handleBackClick = (index) => {
    console.log('Botón Atrás clickeado, navegando de paso', index, 'a', index - 1);
    setActiveStep(index - 1);
  };

  const handleContinueClick = (index) => {
    console.log('Botón Continuar clickeado, navegando de paso', index, 'a', index + 1);
    
    // Si el paso tiene una función onContinue personalizada, usarla
    if (steps[index] && steps[index].onContinue) {
      steps[index].onContinue();
    } else {
      // Comportamiento por defecto
      setActiveStep(index + 1);
    }
  };

  const isStepDisabled = (index) => {
    return (
      (index === 0 && !archivoExcel) ||
      (index === 1 && !userHasConfiguredDates) ||
      (index === 2 && !dataProcessed)
    );
  };

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Stepper 
        activeStep={activeStep} 
        orientation="vertical"
        sx={{
          '& .MuiStepLabel-root': {
            '& .MuiStepLabel-label': {
              color: theme.textoPrincipal,
              fontWeight: 600,
              fontSize: { xs: '1rem', md: '1.1rem' }
            },
            '& .MuiStepLabel-labelContainer': {
              '& .MuiStepLabel-alternativeLabel': {
                color: theme.textoSecundario,
                fontSize: { xs: '0.8rem', md: '0.9rem' }
              }
            }
          },
          '& .MuiStepIcon-root': {
            color: theme.textoSecundario,
            '&.Mui-active': {
              color: theme.acento || theme.primario,
            },
            '&.Mui-completed': {
              color: theme.terminalVerde,
            }
          }
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.label} completed={getStepStatus(index) === 'completed'}>
            <StepLabel
              optional={
                <Typography variant="caption" sx={{ color: theme.textoSecundario }}>
                  {step.description}
                </Typography>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src={step.icon}
                  alt={step.label}
                  sx={{ 
                    width: 20, 
                    height: 20,
                    filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
                  }}
                />
                {step.label}
              </Box>
            </StepLabel>
            <StepContent>
              {activeStep === index && step.content}
              {activeStep === index && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                  {/* Botón Atrás - siempre disponible para volver al paso anterior */}
                    {index > 0 && (
                    <CustomButton
                      variant="outlined"
                      onClick={() => handleBackClick(index)}
                      disabled={index === 0}
                      sx={{
                        background: theme.gradientes.botonInactivo,
                        borderColor: theme.bordePrincipal,
                        color: theme.textoPrincipal,
                        borderRadius: '18px',
                        boxShadow: theme.sombraComponente,
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        px: 3,
                        py: 1.5,
                        height: 40,
                        transition: 'all 0.3s ease',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: theme.bordeHover,
                          background: theme.gradientes.botonHover,
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraComponenteHover,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: theme.sombraComponente,
                        },
                        '&:disabled': {
                          borderColor: theme.textoSecundario,
                          color: theme.textoDeshabilitado,
                          background: theme.fondoOverlay,
                          transform: 'none',
                          boxShadow: 'none',
                          cursor: 'not-allowed',
                        },
                      }}
                    >
                      Atrás
                    </CustomButton>
                  )}
                  
                  {/* Botón adicional opcional desde el paso (ej: Agregar) */}
                  {step.additionalButton && step.additionalButton}
                  
                  {/* Botón Continuar - solo mostrar si no es el último paso */}
                  {index < steps.length - 1 && (
                    <CustomButton
                      variant="contained"
                      onClick={() => handleContinueClick(index)}
                      disabled={isStepDisabled(index)}
                      sx={{
                        background: theme.gradientes.botonActivo,
                        color: theme.textoContraste,
                        borderRadius: '18px',
                        boxShadow: theme.sombraComponente,
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        px: 3,
                        py: 1.5,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: theme.gradientes.botonActivoHover,
                          boxShadow: theme.sombraComponenteHover,
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: theme.sombraComponente,
                        },
                        '&:disabled': {
                          background: theme.fondoOverlay,
                          color: theme.textoDeshabilitado,
                          transform: 'none',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      Continuar
                    </CustomButton>
                  )}
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default WorkflowStepper;