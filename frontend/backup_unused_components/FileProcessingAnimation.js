import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

function FileProcessingAnimation({ fileName = "archivo.xlsx" }) {
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
        maxHeight: '400px',
      }}
    >
      {/* Archivo animado */}
      <motion.div
        style={{
          width: 60,
          height: 75,
          background: theme.gradientes.servicios,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 15px ${theme.textoInfo}40`,
          position: 'relative',
        }}
        animate={{
          y: [0, -10, 0],
          rotateY: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Icono de archivo */}
        <motion.div
          style={{
            fontSize: '1.5rem',
            color: theme.textoPrincipal,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          📊
        </motion.div>

        {/* Líneas de procesamiento */}
        <Box sx={{ position: 'absolute', right: -15, top: 0, height: '100%' }}>
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              style={{
                width: 2,
                height: 12,
                background: theme.textoInfo,
                borderRadius: 1,
                marginBottom: 4,
                opacity: 0.7,
              }}
              animate={{
                height: [12, 20, 12],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </Box>
      </motion.div>

      {/* Texto de procesamiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.textoPrincipal,
            fontWeight: 600,
            textAlign: 'center',
            mb: 1,
            textShadow: theme.modo === 'claro' ? '0 0 8px rgba(255,255,255,0.7)' : 'none',
          }}
        >
          Procesando archivo...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.textoSecundario,
            textAlign: 'center',
            fontFamily: 'monospace',
            textShadow: theme.modo === 'claro' ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
            mb: 2,
          }}
        >
          {fileName}
        </Typography>
      </motion.div>

      {/* Spinner de carga */}
      <motion.div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: `3px solid ${theme.fondoOverlay}`,
          borderTop: `3px solid ${theme.primario}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Puntos de carga */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: 6,
              height: 6,
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

export default FileProcessingAnimation; 