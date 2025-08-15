import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { ANIMATIONS } from '../../config/animations';

function LoadingSpinner({ message = "Procesando...", fileName }) {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {/* Spinner principal */}
      <motion.div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `4px solid ${theme.fondoOverlay}`,
          borderTop: `4px solid ${theme.primario}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={ANIMATIONS.loadingSpinner.animate}
      >
        {/* Spinner interno */}
        <motion.div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `3px solid transparent`,
            borderTop: `3px solid ${theme.secundario}`,
          }}
          animate={{
            rotate: -360,
            transition: {
              duration: 0.8,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      </motion.div>

      {/* Texto de carga */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="body1"
          sx={{
            color: theme.textoInfo, // Azul cian característico de la app
            fontWeight: 700,
            textAlign: 'center',
            textShadow: theme.modo === 'claro' 
              ? '0 0 12px rgba(100,181,246,0.9), 0 0 20px rgba(100,181,246,0.5)' 
              : '0 0 12px rgba(100,181,246,1), 0 0 20px rgba(100,181,246,0.7)',
            mb: 1,
            fontSize: '1.2rem',
            letterSpacing: '0.4px',
          }}
        >
          {message}
        </Typography>
        {fileName && (
          <Typography
            variant="body2"
            sx={{
              color: theme.textoPrincipal, // Color principal para mejor contraste
              textAlign: 'center',
              fontFamily: 'monospace',
              textShadow: theme.modo === 'claro' 
                ? '0 0 8px rgba(22,36,71,0.6)' 
                : '0 0 8px rgba(255,255,255,0.8)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {fileName}
          </Typography>
        )}
      </motion.div>

      {/* Puntos animados */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.primario,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default LoadingSpinner; 