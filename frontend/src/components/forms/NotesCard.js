import React, { useState, useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import { APP_MESSAGES } from '../../config/appConfig';
import notesIcon from '../../assets/Notepad.png';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';

function NotesCard({ value, onChange, fullHeight }) {
  const { theme } = useTheme();
  
  const handleNoteChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      height: fullHeight ? '100%' : undefined,
      minHeight: 140 // Compactar altura
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', mb: 1, mt: 0, width: '100%' }}>
        <motion.div
          whileHover={{ rotate: -5, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <img src={notesIcon} alt="" style={{ width: 36, height: 36, marginRight: 12, display: 'block', boxShadow: theme.sombraIcono }} />
        </motion.div>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, ml: 2, fontSize: '1.5rem' }}>
          {APP_MESSAGES.NOTES_CARD_TITLE}
        </Typography>
      </Box>
      <motion.div
        whileHover={ANIMATIONS.formFieldHover}
        whileFocus={ANIMATIONS.formFieldFocus}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <TextField
        multiline
        minRows={5}
        fullWidth
        variant="outlined"
        label="Escribe Tus Notas Aqui..."
        value={value}
        onChange={handleNoteChange}
        sx={{
          background: theme.fondoContenedor,
          borderRadius: '18px',
          boxShadow: theme.sombraComponente,
          '& .MuiInputBase-root': {
            color: `${theme.textoPrincipal} !important`,
            borderRadius: '18px',
            transition: 'all 0.3s ease'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: `${theme.bordePrincipal} !important`,
            borderRadius: '18px',
            borderWidth: '1.5px !important',
            transition: 'all 0.3s ease'
          },
          '& .MuiInputBase-input': {
            color: `${theme.textoPrincipal} !important`,
            fontWeight: 500,
            background: 'transparent',
            transition: 'all 0.3s ease'
          },
          '& .MuiInputLabel-root': {
            color: `${theme.textoSecundario} !important`,
            transition: 'all 0.3s ease'
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.sombraHover,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: `${theme.bordeHover} !important`,
           
          },
          '&.Mui-focused': {
            transform: 'translateY(-3px)',
            boxShadow: theme.sombraFocus,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: `${theme.bordeFocus} !important`,
            borderWidth: '2.5px !important'
          },
          '& .MuiInputBase-input::placeholder': {
            color: theme.textoPlaceholder,
            opacity: 1,
            transition: 'all 0.3s ease'
          },
          '& label.Mui-focused': {
            color: `${theme.textoPrincipal} !important`,
            fontWeight: 600
          },
          transition: 'all 0.3s ease'
        }}
        />
      </motion.div>
    </Box>
  );
}

export default NotesCard; 