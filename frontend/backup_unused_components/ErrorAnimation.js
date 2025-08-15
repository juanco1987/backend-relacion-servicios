import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { ANIMATIONS } from '../../config/animations';

function ErrorAnimation({ message = "Error" }) {
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
      {/* Círculo de error */}
      <motion.div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: theme.terminalRojo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${theme.terminalRojo}40`,
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
        {/* Icono X */}
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.textoPrincipal}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.3,
              ease: "easeInOut"
            }}
          />
          <motion.line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Texto de error */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.textoPrincipal,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      </motion.div>

      {/* Ondas de error */}
      <Box sx={{ position: 'relative', height: 40 }}>
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            style={{
              position: 'absolute',
              width: 60 + index * 20,
              height: 60 + index * 20,
              borderRadius: '50%',
              border: `2px solid ${theme.error || theme.acentoError}`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ 
              scale: 0,
              opacity: 0.8 
            }}
            animate={{ 
              scale: 2,
              opacity: 0
            }}
            transition={{
              duration: 1.5,
              delay: 1 + index * 0.2,
              ease: "easeOut",
              repeat: 2
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default ErrorAnimation; 