import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import logo from '../../assets/mi_logo.ico';
import { APP_MESSAGES } from '../../config/appConfig';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const Header = React.memo(() => {
  const { theme, modo, alternarTema } = useTheme();

  return (
    <Box
      sx={{
        background: 'none',
        p: { xs: 2, md: 3 }, // Más aire arriba y a los lados
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 90, md: 110 },
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Botón de tema - Más estilizado */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 10, md: 15 },
          right: { xs: 10, md: 15 },
          zIndex: 10,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconButton
            onClick={alternarTema}
            sx={{
              width: 38,
              height: 38,
              background: theme.fondoOverlay || 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              border: `1px solid ${theme.bordePrincipal}`,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {modo === 'oscuro' ? '☀️' : '🌙'}
          </IconButton>
        </motion.div>
      </Box>

      {/* Contenedor Principal Logo + Texto */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%',
        gap: { xs: 1.5, md: 3 } // Espacio controlado entre logo y texto
      }}>

        {/* Logo optimizado para móvil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar
            src={logo}
            alt="Logo"
            sx={{
              width: { xs: 55, md: 75 }, // Un poco más pequeño en móvil
              height: { xs: 55, md: 75 },
              bgcolor: 'white',
              boxShadow: theme.sombraHeader || 3,
              border: `2px solid ${theme.bordePrincipal}`,
            }}
          />
        </motion.div>

        {/* Textos: Título y Subtítulo */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left'
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography
              variant="h1"
              sx={{
                color: theme.textoPrincipal,
                fontWeight: 800,
                fontSize: { xs: '1.4rem', md: '2.2rem' }, // Tamaño ajustado
                lineHeight: 1,
                letterSpacing: '-0.5px',
                mb: 0.5
              }}
            >
              {APP_MESSAGES.APP_TITLE}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{
                color: theme.textoSecundario,
                fontWeight: 500,
                fontSize: { xs: '0.75rem', md: '1rem' },
                opacity: 0.8,
                maxWidth: { xs: '200px', md: '100%' }, // Evita que el subtítulo se estire demasiado
                lineHeight: 1.2
              }}
            >
              {APP_MESSAGES.HEADER_SUBTITLE}
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
});

export default Header;