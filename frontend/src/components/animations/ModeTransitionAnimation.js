import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

function ModeTransitionAnimation({ fromMode, toMode }) {
  const { theme } = useTheme();

  const modeNames = {
    0: 'Relación de Servicios',
    1: 'Pendientes de Pago'
  };

  const modeIcons = {
    0: '📊',
    1: '⏳'
  };

  const modeColors = {
    0: theme.gradientes.servicios,
    1: theme.gradientes.pendientes
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      {/* Fondo animado principal */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${modeColors[fromMode]}, ${modeColors[toMode]})`,
          opacity: theme.modo === 'claro' ? 0.15 : 0.08,
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut"
        }}
      />

      {/* Ondas de transición */}
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={`wave-${index}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200%',
            height: '200%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${modeColors[toMode]}20, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 2,
            delay: index * 0.4,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Contenedor principal de iconos */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Modo anterior con efecto de desvanecimiento */}
        <motion.div
          initial={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ 
            x: -80, 
            opacity: 0, 
            scale: 0.6, 
            rotate: -15,
            filter: 'grayscale(1) blur(2px)'
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            fontSize: '4rem',
            filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))',
          }}
        >
          {modeIcons[fromMode]}
        </motion.div>

        {/* Flecha de transición mejorada */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1], 
            rotate: [0, 360, 0],
            opacity: [0, 1, 1]
          }}
          transition={{ 
            duration: 1, 
            delay: 0.4,
            ease: "easeInOut"
          }}
          style={{
            fontSize: '2.5rem',
            color: theme.primario,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
          }}
        >
          ➜
        </motion.div>

        {/* Modo nuevo con efecto de aparición */}
        <motion.div
          initial={{ x: 80, opacity: 0, scale: 0.6, rotate: 15 }}
          animate={{ 
            x: 0, 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))'
          }}
          transition={{ 
            duration: 1, 
            delay: 0.6, 
            ease: "easeInOut"
          }}
          style={{
            fontSize: '4rem',
          }}
        >
          {modeIcons[toMode]}
        </motion.div>
      </motion.div>

      {/* Texto de transición mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        style={{ textAlign: 'center', zIndex: 10 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: [1, 1.02, 1],
            textShadow: [
              theme.modo === 'claro' 
                ? '0 0 15px rgba(255,255,255,0.9)' 
                : '0 0 15px rgba(255,255,255,0.3)',
              theme.modo === 'claro' 
                ? '0 0 25px rgba(255,255,255,1)' 
                : '0 0 25px rgba(255,255,255,0.5)',
              theme.modo === 'claro' 
                ? '0 0 15px rgba(255,255,255,0.9)' 
                : '0 0 15px rgba(255,255,255,0.3)'
            ]
          }}
          transition={{ 
            duration: 0.6, 
            delay: 1.2,
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            textShadow: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.textoPrincipal,
              fontWeight: 800,
              textAlign: 'center',
              mb: 2,
              fontSize: '2.2rem',
              letterSpacing: '1px',
            }}
          >
            Cambiando a {modeNames[toMode]}
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.textoSecundario,
              textAlign: 'center',
              textShadow: theme.modo === 'claro' 
                ? '0 0 10px rgba(255,255,255,0.7)' 
                : '0 0 10px rgba(255,255,255,0.2)',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            Configurando el nuevo modo de trabajo...
          </Typography>
        </motion.div>
      </motion.div>

      {/* Partículas de transición mejoradas */}
      <Box sx={{ position: 'relative', height: 60, width: 300, zIndex: 10 }}>
        {[...Array(12)].map((_, index) => (
          <motion.div
            key={index}
            style={{
              position: 'absolute',
              width: index % 3 === 0 ? 12 : 8,
              height: index % 3 === 0 ? 12 : 8,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${modeColors[toMode]}, ${modeColors[fromMode]})`,
              left: `${(index * 25) % 300}px`,
              top: '50%',
              filter: 'blur(0.5px)',
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 0,
              rotate: 0
            }}
            animate={{ 
              x: (index - 6) * 50, 
              y: [-40, 40, -40], 
              scale: [0, 1.2, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              delay: 1.2 + index * 0.06,
              ease: "easeOut"
            }}
          />
        ))}
      </Box>

      {/* Barra de progreso mejorada */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        style={{ zIndex: 10 }}
      >
        <Box sx={{ 
          width: 300, 
          height: 8, 
          background: theme.modo === 'claro' 
            ? 'rgba(0,0,0,0.1)' 
            : 'rgba(255,255,255,0.1)', 
          borderRadius: 4, 
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
          position: 'relative'
        }}>
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, ${modeColors[fromMode]}, ${modeColors[toMode]}, ${modeColors[toMode]})`,
              borderRadius: 4,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              delay: 1.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Efecto de brillo en la barra */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '30%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              borderRadius: 4,
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '400%' }}
            transition={{
              duration: 1.2,
              delay: 2.2,
              ease: "easeInOut"
            }}
          />
        </Box>
      </motion.div>
    </Box>
  );
}

export default ModeTransitionAnimation; 