import React, { useRef, useState } from 'react';
import { TextField, Button, Typography, Box, Avatar } from '@mui/material';
import { APP_MESSAGES } from '../../config/appConfig';
import excelIcon from '../../assets/document_microsoft_excel.png';

import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';

function ExcelUploader({ onFileChange, workMode = 0 }) {
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const inputRef = useRef();
  const { theme } = useTheme();
  // Definir colores según el modo de trabajo
  const colorMain = workMode === 0 ? theme.gradientes.servicios : theme.gradientes.pendientes;
  const colorBg = workMode === 0 ? theme.gradientes.servicios : theme.gradientes.pendientes;
  const neonShadow = workMode === 0 ? theme.neon.servicios : theme.neon.pendientes;
 

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      
      // Validar formato del archivo
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        return;
      }
      
      setFileName(fileName);
      if (onFileChange) onFileChange(file);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Box
        sx={{
          width: '100%',
          background: theme.fondoContenedor,
          borderRadius: '28px',
          boxShadow: theme.sombraContenedor,
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img src={excelIcon} alt="Excel" style={{ width: 44, height: 44, marginRight: 16, display: 'block', boxShadow: theme.sombraIcono }} />
            </motion.div>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              {APP_MESSAGES.FILE_SELECT_TITLE}
            </Typography>
          </Box>
                  <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}
          onDragEnter={e => {
            e.preventDefault();
            e.stopPropagation();
            setDragCounter(prev => prev + 1);
            setIsDragOver(true);
          }}
          onDragLeave={e => {
            e.preventDefault();
            e.stopPropagation();
            setDragCounter(prev => prev - 1);
            if (dragCounter <= 1) {
              setIsDragOver(false);
            }
          }}
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            setDragCounter(0);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const file = e.dataTransfer.files[0];
              setFileName(file.name);
              if (onFileChange) onFileChange(file);
            }
          }}
        >
            <motion.div
              whileHover={ANIMATIONS.formFieldHover}
              whileFocus={ANIMATIONS.formFieldFocus}
              whileTap={{ scale: 0.98 }}
              animate={{
                scale: isDragOver ? 1.05 : 1,
                boxShadow: isDragOver ? `0 0 20px ${theme.primario}40` : 'none',
              }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              <TextField
                label={APP_MESSAGES.FILE_ENTRY_LABEL || "Archivo Excel"}
                value={fileName}
                placeholder={APP_MESSAGES.FILE_ENTRY_PLACEHOLDER || "Arrastra un archivo aquí o haz clic en Examinar..."}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{
                  background: theme.gradientes.botonInactivo,
                  borderRadius: '18px',
                  boxShadow: theme.sombraExcelUploader,
                  '& .MuiInputBase-root': {
                    color: `${theme.textoPrincipal} !important`,
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputLabel-root': {
                    color: `${theme.textoSecundario} !important`,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputBase-root': {
                    height: 50,
                    borderRadius: '18px',
                    background: 'transparent',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.bordePrincipal} !important`,
                    borderWidth: '1.5px !important',
                    transition: 'all 0.3s ease'
                  },
                  
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.sombraHover,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.bordeHover} !important`,
                   
                  },
                  
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.bordeFocus} !important`,
                    borderWidth: '2.5px !important'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: `${theme.textoPrincipal} !important`,
                    fontWeight: 600
                  },
                  '& .MuiInputBase-input': {
                    color: `${theme.textoPrincipal} !important`,
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              />
            </motion.div>
            
            {/* Indicador de drag & drop */}
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.primario}, ${theme.secundario})`,
                    borderRadius: '20px',
                    p: 3,
                    boxShadow: `0 0 30px ${theme.primario}60`,
                    border: `2px solid ${theme.primario}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.textoContraste,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      mb: 1,
                    }}
                  >
                    📁 Soltar archivo aquí
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.textoContraste,
                      textAlign: 'center',
                      opacity: 0.9,
                    }}
                  >
                    Suelta tu archivo Excel para cargarlo
                  </Typography>
                </Box>
              </motion.div>
            )}
            <motion.div
              whileHover={ANIMATIONS.buttonHover}
              whileTap={ANIMATIONS.buttonTap}
            >
              <Button
                variant="contained"
                onClick={() => inputRef.current.click()}
                startIcon={
                  <motion.img
                    src={excelIcon}
                    alt="Excel"
                    style={{ width: 24, height: 24, display: 'block' }}
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  />
                }
                sx={{
                  fontWeight: 'bold',
                  minWidth: 120,
                  height: 44,
                  borderRadius: '18px',
                  boxShadow: neonShadow,
                  background: colorBg,
                  color: theme.textoPrincipal,
                  textTransform: 'none',
                  letterSpacing: '-1px',
                  transition: 'box-shadow 0.3s, background 0.3s',
                  '&:hover': {
                    background: colorBg,
                    boxShadow: neonShadow,
                    filter: 'brightness(1.15)',
                  },
                  p: 0
                }}
              >
                {APP_MESSAGES.BUTTON_BROWSE_TEXT}
              </Button>
            </motion.div>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={inputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>
        </Box>
      </Box>
  );
}

export default ExcelUploader; 