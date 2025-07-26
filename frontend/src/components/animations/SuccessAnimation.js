import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { ANIMATIONS } from '../../config/animations';

function SuccessAnimation({ message = "¡Completado!" }) {
  const { theme, modo } = useTheme();

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
      {/* Círculo de éxito */}
      <motion.div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: theme.terminalVerde,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${theme.terminalVerde}40`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          duration: 0.6
        }}
      >
        {/* Checkmark */}
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.textoPrincipal}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: "easeInOut"
          }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Texto de éxito */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.terminalVerde,
            fontWeight: 700,
            textAlign: 'center',
            textShadow: modo === 'claro' 
              ? `0 0 12px ${theme.terminalVerde}80, 0 0 20px ${theme.terminalVerde}40` 
              : `0 0 12px ${theme.terminalVerde}90, 0 0 20px ${theme.terminalVerde}60`,
            fontSize: '1.4rem',
            letterSpacing: '0.5px',
          }}
        >
          {message}
        </Typography>
      </motion.div>

      {/* Partículas de confeti */}
      <Box sx={{ position: 'relative', height: 40 }}>
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: [theme.primario, theme.secundario, theme.accent][index % 3],
              left: '50%',
              top: '50%',
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 0 
            }}
            animate={{ 
              x: (index - 2.5) * 30, 
              y: -50, 
              scale: 1,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              delay: 1 + index * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default SuccessAnimation; 