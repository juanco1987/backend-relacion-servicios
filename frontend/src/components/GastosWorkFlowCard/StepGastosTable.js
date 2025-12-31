import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Grid, TextField, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';
import CustomButton from '../common/CustomButton';
import { formatearMoneda, formatearFecha } from '../../utils/gastoCalculator';

const CATEGORIAS_PRESET = [
  'Materiales',
  'Transporte',
  'Herramientas',
  'Alimentación',
  'Servicios externos',
  'Otros'
];

const StepGastosTable = forwardRef(({
  theme,
  gastos,
  onAgregarGasto,
  onEliminarGasto,
  onContinuar,
}, ref) => {
  const [formData, setFormData] = useState({
    fecha: '',
    categoria: '',
    monto: '',
    descripcion: '',
    notas: '',
  });

  const handleAgregarGasto = () => {
    if (!formData.fecha || !formData.categoria || !formData.monto || !formData.descripcion) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    onAgregarGasto({
      ...formData,
      monto: parseFloat(formData.monto),
    });

    // Limpiar formulario
    setFormData({
      fecha: '',
      categoria: '',
      monto: '',
      descripcion: '',
      notas: '',
    });
  };

  // Exponer la función handleAgregarGasto al componente padre
  useImperativeHandle(ref, () => ({
    handleAgregarGasto,
  }));

  const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);

  return (
    <Box sx={{ mt: 2 }}>
      <motion.div
        whileHover={ANIMATIONS.formFieldHover}
        whileTap={{ scale: 0.995 }}
      >
        <Grid container spacing={3}>
          {/* Formulario para agregar gastos */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
              }}
            >
              <Typography variant="h6" sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}>
                Agregar Gasto
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    sx={{
                        
                        "& .MuiOutlinedInput-root": {
                            background: theme.fondoOverlay,
                            borderRadius: "25px",
                            transition: "all 0.3s ease",
                            boxShadow: theme.sombraContenedor,
                            "&:hover": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "&.Mui-focused": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "& > fieldset": {
                            borderColor: theme.bordePrincipal,
                            borderWidth: "1.5px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.textoSecundario,
                            fontWeight: 500,
                            "&.Mui-focused": {
                            color: theme.textoPrincipal,
                            fontWeight: 600,
                            },
                        },
                        "& .MuiInputBase-input": {
                            color: theme.textoPrincipal,
                            fontWeight: 500,
                        },
                        "& .MuiFormHelperText-root": {
                            color: theme.textoSecundario,
                            fontSize: "0.75rem",
                        },
                        }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Categoría"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{
                        minWidth: '180px',
                        "& .MuiOutlinedInput-root": {
                            background: theme.fondoOverlay,
                            borderRadius: "25px",
                            transition: "all 0.3s ease",
                            boxShadow: theme.sombraContenedor,
                            "&:hover": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "&.Mui-focused": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "& > fieldset": {
                            borderColor: theme.bordePrincipal,
                            borderWidth: "1.5px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.textoSecundario,
                            fontWeight: 500,
                            "&.Mui-focused": {
                            color: theme.textoPrincipal,
                            fontWeight: 600,
                            },
                        },
                        "& .MuiInputBase-input": {
                            color: theme.textoPrincipal,
                            fontWeight: 500,
                        },
                        "& .MuiFormHelperText-root": {
                            color: theme.textoSecundario,
                            fontSize: "0.75rem",
                        },
                        }}
                  >
                    {CATEGORIAS_PRESET.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Monto"
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    size="small"
                    placeholder="0"
                    sx={{
                        maxWidth:'120px',
                        "& .MuiOutlinedInput-root": {
                            background: theme.fondoOverlay,
                            borderRadius: "25px",
                            transition: "all 0.3s ease",
                            boxShadow: theme.sombraContenedor,
                            "&:hover": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "&.Mui-focused": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "& > fieldset": {
                            borderColor: theme.bordePrincipal,
                            borderWidth: "1.5px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.textoSecundario,
                            fontWeight: 500,
                            "&.Mui-focused": {
                            color: theme.textoPrincipal,
                            fontWeight: 600,
                            },
                        },
                        "& .MuiInputBase-input": {
                            color: theme.textoPrincipal,
                            fontWeight: 500,
                        },
                        "& .MuiFormHelperText-root": {
                            color: theme.textoSecundario,
                            fontSize: "0.75rem",
                        },
                        }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    sx={{
                        
                        "& .MuiOutlinedInput-root": {
                            background: theme.fondoOverlay,
                            borderRadius: "12px",
                            transition: "all 0.3s ease",
                            boxShadow: theme.sombraContenedor,
                            "&:hover": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "&.Mui-focused": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "& > fieldset": {
                            borderColor: theme.bordePrincipal,
                            borderWidth: "1.5px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.textoSecundario,
                            fontWeight: 500,
                            "&.Mui-focused": {
                            color: theme.textoPrincipal,
                            fontWeight: 600,
                            },
                        },
                        "& .MuiInputBase-input": {
                            color: theme.textoPrincipal,
                            fontWeight: 500,
                        },
                        "& .MuiFormHelperText-root": {
                            color: theme.textoSecundario,
                            fontSize: "0.75rem",
                        },
                        }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Notas (opcional)"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    sx={{
                        
                        "& .MuiOutlinedInput-root": {
                            background: theme.fondoOverlay,
                            borderRadius: "12px",
                            transition: "all 0.3s ease",
                            boxShadow: theme.sombraContenedor,
                            "&:hover": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "&.Mui-focused": {
                            "& > fieldset": {
                                borderColor: theme.bordeHover,
                                borderWidth: "2px",
                            },
                            transform: "translateY(-2px)",
                            boxShadow: theme.sombraHover,
                            },
                            "& > fieldset": {
                            borderColor: theme.bordePrincipal,
                            borderWidth: "1.5px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.textoSecundario,
                            fontWeight: 500,
                            "&.Mui-focused": {
                            color: theme.textoPrincipal,
                            fontWeight: 600,
                            },
                        },
                        "& .MuiInputBase-input": {
                            color: theme.textoPrincipal,
                            fontWeight: 500,
                        },
                        "& .MuiFormHelperText-root": {
                            color: theme.textoSecundario,
                            fontSize: "0.75rem",
                        },
                        }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Tabla de gastos agregados */}
          {gastos.length > 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  background: theme.fondoOverlay,
                  borderRadius: '16px',
                  p: 3,
                  border: `2px solid ${theme.bordePrincipal}`,
                  overflowX: 'auto',
                }}
              >
                <Typography variant="h6" sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}>
                  Gastos Agregados ({gastos.length})
                </Typography>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: theme.acento || '#2196F3', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Categoría</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Descripción</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Monto</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((gasto, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? theme.fondoContenedor : '#fff', borderBottom: `1px solid ${theme.bordePrincipal}` }}>
                        <td style={{ padding: '12px' }}>{gasto.fecha}</td>
                        <td style={{ padding: '12px' }}>{gasto.categoria}</td>
                        <td style={{ padding: '12px' }}>{gasto.descripcion}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: theme.terminalVerde }}>
                          {formatearMoneda(gasto.monto)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <CustomButton
                            variant="outlined"
                            onClick={() => onEliminarGasto(idx)}
                            sx={{
                              background: theme.terminalRojo,
                              color:theme.textoBlanco,
                              borderRadius: '8px',
                              px: 2,
                              py: 0.5,
                              fontSize: '0.8rem',
                            }}
                          >
                            Eliminar
                          </CustomButton>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: theme.fondoOverlay, fontWeight: 'bold', borderTop: `2px solid ${theme.bordePrincipal}` }}>
                      <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>TOTAL GASTOS:</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: theme.terminalVerde, fontSize: '1.1rem' }}>
                        {formatearMoneda(totalGastos)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Box>
  );
});

export default StepGastosTable;