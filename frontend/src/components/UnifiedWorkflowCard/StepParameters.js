// components/UnifiedWorkflowCard/StepParameters.js
import React from 'react';
import { Box, Grid, Typography, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomButton from '../common/CustomButton';

const StepParameters = ({
  theme,
  calendarIcon2,
  notesIcon,
  fromDate,
  toDate,
  notas,
  imagenes,
  onImageChange,
  onNoteChange,
  onFromDateChange,
  onToDateChange,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="img"
              src={calendarIcon2}
              alt="Calendario"
              sx={{
                width: 20,
                height: 20,
                filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
              }}
            />
            <Typography variant="subtitle2" sx={{ color: theme.textoSecundario }}>
              Período de tiempo
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column' } }}>
              <DatePicker
                label="Desde"
                value={fromDate}
                onChange={onFromDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      flex: 1,
                      width: '180px',
                      '& .MuiOutlinedInput-root': {
                        background: theme.fondoOverlay,
                        borderRadius: '25px',
                        transition: 'all 0.3s ease',
                        boxShadow: theme.sombraContenedor,
                        '&:hover': {
                          '& > fieldset': {
                            borderColor: theme.bordeHover,
                            borderWidth: '2px',
                          },
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '&.Mui-focused': {
                          '& > fieldset': {
                            borderColor: theme.bordeHover,
                            borderWidth: '2px',
                          },
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '& > fieldset': {
                          borderColor: theme.bordePrincipal,
                          borderWidth: '1.5px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.textoSecundario,
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: theme.textoPrincipal,
                          fontWeight: 600,
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: theme.textoPrincipal,
                        fontWeight: 500,
                      },
                    }
                  }
                }}
              />
              <DatePicker
                label="Hasta"
                value={toDate}
                onChange={onToDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      flex: 1,
                      width: '180px',
                      '& .MuiOutlinedInput-root': {
                        background: theme.fondoOverlay,
                        borderRadius: '25px',
                        transition: 'all 0.3s ease',
                        boxShadow: theme.sombraContenedor,
                        '&:hover': {
                          '& > fieldset': {
                            borderColor: theme.bordeHover,
                            borderWidth: '2px',
                          },
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '&.Mui-focused': {
                          '& > fieldset': {
                            borderColor: theme.bordeHover,
                            borderWidth: '2px',
                          },
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '& > fieldset': {
                          borderColor: theme.bordePrincipal,
                          borderWidth: '1.5px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.textoSecundario,
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: theme.textoPrincipal,
                          fontWeight: 600,
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: theme.textoPrincipal,
                        fontWeight: 500,
                      },
                    }
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="img"
              src={notesIcon}
              alt="notas"
              sx={{
                width: 20,
                height: 20,
                filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
              }}
            />
            <Typography variant="subtitle2" sx={{ color: theme.textoSecundario }}>
              Notas del reporte
            </Typography>
          </Box>
          <TextField
            label="Escribe tus notas aquí..."
            value={notas || ''}
            onChange={(e) => {
              if (onNoteChange) onNoteChange(e.target.value);
            }}
            variant="outlined"
            size="small"
            multiline
            rows={3.5}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                background: theme.fondoOverlay,
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                boxShadow: theme.sombraContenedor,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px',
                  },
                  transform: 'translateY(-2px)',
                  boxShadow: theme.sombraHover,
                },
                '&.Mui-focused': {
                  '& > fieldset': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px',
                  },
                  transform: 'translateY(-2px)',
                  boxShadow: theme.sombraHover,
                },
                '& > fieldset': {
                  borderColor: theme.bordePrincipal,
                  borderWidth: '1.5px',
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.textoSecundario,
                fontWeight: 500,
                '&.Mui-focused': {
                  color: theme.textoPrincipal,
                  fontWeight: 600,
                },
              },
              '& .MuiInputBase-input': {
                color: theme.textoPrincipal,
                fontWeight: 500,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: theme.textoSecundario }}>
              Imágenes para el reporte
            </Typography>
          </Box>

          <CustomButton
            variant="contained"
            component="label"
            sx={{
              borderRadius: '16px',
              boxShadow: theme.sombraContenedor,
            }}
          >
            Subir imágenes
            <input
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                files.forEach((file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (onImageChange) {
                      onImageChange((prev) => [...prev, reader.result]); // agrega sin borrar las otras
                    }
                  };
                  reader.readAsDataURL(file);
                });
              }}
            />
          </CustomButton>

          {imagenes && imagenes.length > 0 && (
            <Box
              mt={2}
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {imagenes.map((img, idx) => (
                <Box key={idx} sx={{ position: 'relative' }}>
                  <img
                    src={img}
                    alt={`preview-${idx}`}
                    style={{
                      maxWidth: '100px',
                      maxHeight: '100px',
                      borderRadius: '12px',
                      boxShadow: theme.sombraContenedor,
                      objectFit: 'cover',
                    }}
                  />
                  {/* Botón eliminar */}
                  <Box
                    component="span"
                    onClick={() => {
                      onImageChange((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '4px 6px',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    ✕
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Grid>

      </Grid>
    </Box>
  );
};

export default StepParameters;
