import React, { useState } from 'react';
import { Box, Typography, Grid, TextField, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';
import CustomButton from '../common/CustomButton';
import { formatearMoneda } from '../../utils/gastoCalculator';

// Lista de opciones de entrega o transferencia
const MEDIOS_ENTREGA = [
  'CUENTA BANCOLOMBIA',
  'NEQUI',
  'DAVIPLATA',
  'EFECTIVO',
  'OTROS',
];

const StepConsignacionesTable = ({
  theme,
  consignaciones,
  onAgregarConsignacion,
  onEliminarConsignacion,
}) => {
  const [formData, setFormData] = useState({
    fecha: '',
    monto: '',
    entregadoPor: '',
    descripcion: '',
  });

  const handleAgregarConsignacion = () => {
    if (!formData.fecha || !formData.monto || !formData.entregadoPor) {
      alert('Por favor completa fecha, monto y medio de entrega');
      return;
    }

    onAgregarConsignacion({
      ...formData,
      monto: parseFloat(formData.monto),
    });

    setFormData({
      fecha: '',
      monto: '',
      entregadoPor: '',
      descripcion: '',
    });
  };

  const totalConsignaciones = consignaciones.reduce(
    (sum, cons) => sum + parseFloat(cons.monto || 0),
    0
  );

  return (
    <Box sx={{ mt: 2 }}>
      <motion.div whileHover={ANIMATIONS.formFieldHover} whileTap={{ scale: 0.995 }}>
        <Grid container spacing={3}>
          {/* 🔹 Formulario para agregar consignaciones */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}
              >
                Agregar Consignación
              </Typography>

              <Grid container spacing={2}>
                {/* Fecha */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
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

                {/* Entregado o transferido por */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Entregado o Transferido"
                    value={formData.entregadoPor}
                    onChange={(e) =>
                      setFormData({ ...formData, entregadoPor: e.target.value })
                    }
                    size="small"
                    fullWidth
                    sx={{
                        minWidth: '210px',
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
                    {MEDIOS_ENTREGA.map((medio) => (
                      <MenuItem key={medio} value={medio}>
                        {medio}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Monto */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Monto"
                    type="number"
                    value={formData.monto}
                    onChange={(e) =>
                      setFormData({ ...formData, monto: e.target.value })
                    }
                    size="small"
                    placeholder="0"
                    sx={{
                        maxWidth: '120px',
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

                {/* Botón Agregar Consignación */}
                <Grid
                  item
                  xs={12} sm={6} md={3}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <CustomButton
                    fullWidth
                    onClick={handleAgregarConsignacion}
                    sx={{
                      background: theme.gradientes.botonActivo,
                      color: theme.textoContraste,  
                      height: 40,
                      fontWeight: 600,
                      borderRadius: '26px',
                    }}
                  >
                    Agregar Consignación
                  </CustomButton>
                </Grid>

                {/* Descripción */}
                <Grid item xs={12}>
                  <TextField
                    label="Descripción (opcional)"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
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

          {/* 🔹 Tabla de consignaciones agregadas */}
          {consignaciones.length > 0 && (
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
                <Typography
                  variant="h6"
                  sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}
                >
                  Consignaciones Agregadas ({consignaciones.length})
                </Typography>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        background: theme.acento || '#2196F3',
                        color: theme.textoBlanco,
                      }}
                    >
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Entregado/Transferido</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Descripción</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Valor</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consignaciones.map((cons, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background:
                            idx % 2 === 0
                              ? theme.fondoContenedor
                              : theme.fondoOverlay,
                          borderBottom: `1px solid ${theme.bordePrincipal}`,
                        }}
                      >
                        <td style={{ padding: '12px' }}>{cons.fecha}</td>
                        <td style={{ padding: '12px' }}>{cons.entregadoPor}</td>
                        <td style={{ padding: '12px' }}>{cons.descripcion || '-'}</td>
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: theme.terminalVerde,
                          }}
                        >
                          {formatearMoneda(cons.monto)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <CustomButton
                            variant="outlined"
                            onClick={() => onEliminarConsignacion(idx)}
                            sx={{
                              background: theme.terminalRojo,
                              color: theme.textoBlanco,
                              fontSize: '0.9rem',
                              px: 2,
                              py: 0.5,
                              borderRadius: '26px',
                            }}
                          >
                            Eliminar
                          </CustomButton>
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: theme.fondoOverlay,
                        fontWeight: 'bold',
                        borderTop: `2px solid ${theme.bordePrincipal}`,
                      }}
                    >
                      <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>
                        TOTAL CONSIGNADO:
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          color: theme.terminalVerde,
                          fontSize: '1.1rem',
                        }}
                      >
                        {formatearMoneda(totalConsignaciones)}
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
};

export default StepConsignacionesTable;
