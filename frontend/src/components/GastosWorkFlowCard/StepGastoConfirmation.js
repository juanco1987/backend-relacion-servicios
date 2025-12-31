import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import CustomButton from '../common/CustomButton';
import { formatearMoneda } from '../../utils/gastoCalculator';
import { ANIMATIONS } from '../../config/animations';

const StepGastoConfirmation = ({
  theme,
  gastoData,
  imagenesGastos,
  imagenesConsignaciones,
  imagenesDevoluciones,
  pdfName,
  onPdfNameChange,
  onGeneratePDF,
  processing,
}) => {
  const { gastos = [], consignaciones = [] } = gastoData;
  const [defaultName, setDefaultName] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDefaultName(`Reporte_Gastos_${formattedDate}`);
  }, []);

  useEffect(() => {
    if (!pdfName) onPdfNameChange(defaultName);
  }, [defaultName]);

  return (
    <Box sx={{ mt: 2 }}>
      <motion.div whileHover={ANIMATIONS.formFieldHover} whileTap={{ scale: 0.995 }}>
        <Grid container spacing={3}>
          {/* -------------------- VISTA PREVIA DE GASTOS -------------------- */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
                mb: 3,
                overflowX: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}>
                Gastos Registrados ({gastos.length})
              </Typography>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: theme.acento || '#2196F3', color: '#fff' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Categoría</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Descripción</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? theme.fondoContenedor : theme.fondoOverlay,
                        borderBottom: `1px solid ${theme.bordePrincipal}`,
                      }}
                    >
                      <td style={{ padding: '10px' }}>{gasto.fecha}</td>
                      <td style={{ padding: '10px' }}>{gasto.categoria}</td>
                      <td style={{ padding: '10px' }}>{gasto.descripcion}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: theme.terminalRojo }}>
                        {formatearMoneda(gasto.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Grid>

          {/* -------------------- VISTA PREVIA DE CONSIGNACIONES -------------------- */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
                mb: 3,
                overflowX: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}>
                Consignaciones Registradas ({consignaciones.length})
              </Typography>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: theme.acento || '#2196F3', color: '#fff' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Entregado/Transferido</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Descripción</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {consignaciones.map((cons, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? theme.fondoContenedor : theme.fondoOverlay,
                        borderBottom: `1px solid ${theme.bordePrincipal}`,
                      }}
                    >
                      <td style={{ padding: '10px' }}>{cons.fecha}</td>
                      <td style={{ padding: '10px' }}>{cons.entregadoPor}</td>
                      <td style={{ padding: '10px' }}>{cons.descripcion}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: theme.terminalVerde }}>
                        {formatearMoneda(cons.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Grid>

          {/* -------------------- VISTA PREVIA DE IMÁGENES -------------------- */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: theme.textoPrincipal, mb: 2, fontWeight: 700 }}>
                Imágenes de Soporte
              </Typography>

              <Grid container spacing={2}>
                {/* Gastos */}
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ color: theme.textoPrincipal, mb: 1, fontWeight: 600 }}>
                    Gastos ({imagenesGastos.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagenesGastos.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.preview || img}
                        alt={`gasto-${idx}`}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: `1px solid ${theme.bordePrincipal}`,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Consignaciones */}
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ color: theme.textoPrincipal, mb: 1, fontWeight: 600 }}>
                    Consignaciones ({imagenesConsignaciones.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagenesConsignaciones.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.preview || img}
                        alt={`cons-${idx}`}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: `1px solid ${theme.bordePrincipal}`,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Devoluciones */}
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ color: theme.textoPrincipal, mb: 1, fontWeight: 600 }}>
                    Devoluciones ({imagenesDevoluciones.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagenesDevoluciones.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.preview || img}
                        alt={`dev-${idx}`}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: `1px solid ${theme.bordePrincipal}`,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* -------------------- NOMBRE PDF Y BOTÓN -------------------- */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoOverlay,
                borderRadius: '16px',
                p: 3,
                border: `2px solid ${theme.bordePrincipal}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <TextField
                label="Nombre del PDF"
                value={pdfName || defaultName}
                onChange={(e) => onPdfNameChange(e.target.value)}
                size="small"
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    background: theme.fondoContenedor,
                    borderRadius: '12px',
                  },
                }}
              />

              <CustomButton
                onClick={() => onGeneratePDF(pdfName || defaultName)}
                disabled={processing}
                sx={{
                  height: 40,
                  px: 4,
                  fontWeight: 600,
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                {processing ? 'Generando...' : 'Generar PDF'}
              </CustomButton>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default StepGastoConfirmation;
