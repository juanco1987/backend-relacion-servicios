import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CustomButton from '../common/CustomButton';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';

const CATEGORIAS_IMAGENES = [
  {
    id: 'gastos',
    titulo: 'SOPORTE DE PAGO DE GASTOS',
    descripcion: 'Recibos, facturas o comprobantes de los gastos realizados',
    color: '#2196F3',
  },
  {
    id: 'consignaciones',
    titulo: 'SOPORTE DE CONSIGNACIONES',
    descripcion: 'Comprobantes de transferencias o depósitos realizados',
    color: '#4CAF50',
  },
  {
    id: 'devoluciones',
    titulo: 'SOPORTE DE DEVOLUCIONES',
    descripcion: 'Comprobantes de devoluciones o vueltas entregadas',
    color: '#FF9800',
  },
];

const SeccionImagenes = ({ tema, imagenes, onAgregarImagenes, onEliminarImagen, theme }) => {
  return (
    <Box
      sx={{
        background: theme.fondoOverlay,
        borderRadius: '16px',
        p: 3,
        border: `2px solid ${tema.color}`,
        mb: 3,
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: tema.color,
          }}
        />
        <Typography variant="h6" sx={{ color: theme.textoPrincipal, fontWeight: 700 }}>
          {tema.titulo}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: theme.textoSecundario, mb: 2 }}>
        {tema.descripcion}
      </Typography>

      <CustomButton
        variant="contained"
        component="label"
        sx={{
          borderRadius: '12px',
          background: tema.color,
          color: theme.textoBlanco,
          px: 2,
          py: 1,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.sombraComponenteHover,
          },
        }}
      >
        + Subir imágenes
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
                if (onAgregarImagenes) {
                  onAgregarImagenes(reader.result);
                }
              };
              reader.readAsDataURL(file);
            });
          }}
        />
      </CustomButton>

      {imagenes && imagenes.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            background: theme.fondoContenedor,
            borderRadius: '12px',
            border: `1px solid ${tema.color}`,
          }}
        >
          <Typography variant="caption" sx={{ color: theme.textoSecundario, display: 'block', mb: 1 }}>
            {imagenes.length} imagen(es) cargada(s)
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {imagenes.map((img, idx) => (
              <Box key={idx} sx={{ position: 'relative' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={img}
                    alt={`${tema.id}-${idx}`}
                    style={{
                      maxWidth: '100px',
                      maxHeight: '100px',
                      borderRadius: '12px',
                      boxShadow: theme.sombraContenedor,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: `2px solid ${tema.color}`,
                    }}
                  />
                </motion.div>
                <Box
                  onClick={() => onEliminarImagen(idx)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: theme.terminalRojo,
                    color: theme.textoBlanco,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px 6px',
                    lineHeight: 1,
                    userSelect: 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  ✕
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const StepImagenesPorCategoria = ({
  theme,
  imagenesGastos,
  imagenesConsignaciones,
  imagenesDevolucioPnes,
  onAgregarImagenGastos,
  onAgregarImagenConsignaciones,
  onAgregarImagenDevoluciones,
  onEliminarImagenGastos,
  onEliminarImagenConsignaciones,
  onEliminarImagenDevoluciones,
  onContinuar,
}) => {
  // Verificar si hay al menos una imagen en alguna categoría (opcional)
  const tieneAlgunaImagen =
    (imagenesGastos && imagenesGastos.length > 0) ||
    (imagenesConsignaciones && imagenesConsignaciones.length > 0) ||
    (imagenesDevolucioPnes && imagenesDevolucioPnes.length > 0);

  return (
    <Box sx={{ mt: 2 }}>
      <motion.div
        whileHover={ANIMATIONS.formFieldHover}
        whileTap={{ scale: 0.995 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.fondoContenedor,
                borderRadius: '16px',
                p: 3,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: theme.textoSecundario }}>
                Las imágenes son opcionales. Carga los comprobantes que consideres necesarios para cada categoría.
              </Typography>
            </Box>

            {/* Sección Gastos */}
            <SeccionImagenes
              tema={CATEGORIAS_IMAGENES[0]}
              imagenes={imagenesGastos}
              onAgregarImagenes={onAgregarImagenGastos}
              onEliminarImagen={onEliminarImagenGastos}
              theme={theme}
            />

            {/* Sección Consignaciones */}
            <SeccionImagenes
              tema={CATEGORIAS_IMAGENES[1]}
              imagenes={imagenesConsignaciones}
              onAgregarImagenes={onAgregarImagenConsignaciones}
              onEliminarImagen={onEliminarImagenConsignaciones}
              theme={theme}
            />

            {/* Sección Devoluciones */}
            <SeccionImagenes
              tema={CATEGORIAS_IMAGENES[2]}
              imagenes={imagenesDevolucioPnes}
              onAgregarImagenes={onAgregarImagenDevoluciones}
              onEliminarImagen={onEliminarImagenDevoluciones}
              theme={theme}
            />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default StepImagenesPorCategoria;