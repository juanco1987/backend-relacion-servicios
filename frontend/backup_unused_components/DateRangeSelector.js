// src/components/DateRangeSelector.js

import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { APP_MESSAGES } from '../../config/appConfig';
import calendarIcon from '../../assets/calendario.png';


// CAMBIO: Imports añadidos para la nueva estructura
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';

const months = APP_MESSAGES.MONTHS_NAMES || [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const cardStyle = {
  minWidth: 350,
  maxWidth: 600,
  minHeight: 140, // Reducido para compactar
  p: 2,
  borderRadius: 3,
  boxShadow: 3,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

// Aplica estilos oscuros a los campos internos
const getDarkFieldSx = (theme) => ({
  background: theme.gradientes.botonInactivo,
  borderRadius: '18px',
  boxShadow: theme.sombraComponente,
  color: theme.textoPrincipal,
  input: { color: theme.textoPrincipal, fontWeight: 500, background: 'transparent' },
  textarea: { color: theme.textoPrincipal, fontWeight: 500, background: 'transparent' },
  label: { color: theme.textoSecundario },
  '& .MuiInputBase-root': { color: theme.textoPrincipal, background: 'transparent', height: 40 },
  '& .MuiOutlinedInput-root': { background: 'transparent', color: theme.textoPrincipal, borderRadius: '18px' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.bordePrincipal, borderRadius: '18px', borderWidth: '1.5px' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.bordeHover },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.bordeFocus },
});

function DateRangeSelector({ fechaInicio, fechaFin, onFechaInicioChange, onFechaFinChange, fullHeight }) {
  const { theme } = useTheme();
  const currentYear = dayjs().year();
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(currentYear);
  const [fromDate, setFromDate] = useState(fechaInicio ? dayjs(fechaInicio) : dayjs().startOf('month'));
  const [toDate, setToDate] = useState(fechaFin ? dayjs(fechaFin) : dayjs().endOf('month'));

  // Remover los useEffect que causan el error
  // useEffect(() => {
  //   if (onFechaInicioChange) onFechaInicioChange(fromDate.format('YYYY-MM-DD'));
  //   // eslint-disable-next-line
  // }, [fromDate]);
  // useEffect(() => {
  //   if (onFechaFinChange) onFechaFinChange(toDate.format('YYYY-MM-DD'));
  //   // eslint-disable-next-line
  // }, [toDate]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    

    
    // Actualizar las fechas después del log
    const newFrom = dayjs().year(year).month(newMonth).startOf('month');
    const newTo = dayjs().year(year).month(newMonth).endOf('month');
    setFromDate(newFrom);
    setToDate(newTo);
    
    // Llamar a los handlers con las nuevas fechas (ya son objetos dayjs)
    if (onFechaInicioChange) onFechaInicioChange(newFrom);
    if (onFechaFinChange) onFechaFinChange(newTo);
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    

    
    // Actualizar las fechas después del log
    const newFrom = dayjs().year(newYear).month(month).startOf('month');
    const newTo = dayjs().year(newYear).month(month).endOf('month');
    setFromDate(newFrom);
    setToDate(newTo);
    
    // Llamar a los handlers con las nuevas fechas (ya son objetos dayjs)
    if (onFechaInicioChange) onFechaInicioChange(newFrom);
    if (onFechaFinChange) onFechaFinChange(newTo);
  };

  const handleFromDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      setFromDate(newDate);
      // Llamar al handler con la nueva fecha
      if (onFechaInicioChange) onFechaInicioChange(newDate);
      
      // Solo loguear si realmente cambió la fecha
      
    }
  };

  const handleToDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      setToDate(newDate);
      // Llamar al handler con la nueva fecha
      if (onFechaFinChange) onFechaFinChange(newDate);
      
      // Solo loguear si realmente cambió la fecha
      
    }
  };

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: fullHeight ? '100%' : undefined,
      minHeight: 140 // Compactar altura
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "flex-start", mb: 2, mt: 0, width: '100%' }}>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <img src={calendarIcon} alt="Calendario" style={{ width: 36, height: 36, marginRight: 12, display: 'block', boxShadow: theme.sombraIcono }} />
        </motion.div>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, ml: 1, fontSize: '1.5rem' }}>
          {APP_MESSAGES.DATE_RANGE_CARD_TITLE}
        </Typography>
      </Box>
          
          {/* CAMBIO: Estructura renovada con Grid para mejor alineación */}
          <Grid container justifyContent="center" sx={{ mt: 2}}>
            {/* Sección de Selección Rápida */}
            <Grid item >
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center'}}>
                <motion.div
                  whileHover={ANIMATIONS.formFieldHover}
                  whileFocus={ANIMATIONS.formFieldFocus}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormControl size='small' sx={{ minWidth: 95}}>
                    <InputLabel id="month-label" sx={getDarkFieldSx(theme).label}>{APP_MESSAGES.MONTH_LABEL || 'Mes'}</InputLabel>
                    <Select
                      labelId="month-label"
                      value={month}
                      label={APP_MESSAGES.MONTH_LABEL || 'Mes'}
                      onChange={handleMonthChange}
                      sx={{
                        ...getDarkFieldSx(theme),
                        '& .MuiSelect-icon': { color: theme.iconoPrincipal },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.sombraFocus,
                        }
                      }}
                    >
                      {months.map((m, idx) => (
                        <MenuItem 
                          key={m} 
                          value={idx}
                          component={motion.div}
                          whileHover={ANIMATIONS.selectOptionHover}
                        >
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
                <motion.div
                  whileHover={ANIMATIONS.formFieldHover}
                  whileFocus={ANIMATIONS.formFieldFocus}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormControl size='small' sx={{ minWidth: 95}}>
                     <InputLabel id="year_label" sx={getDarkFieldSx(theme).label}>{APP_MESSAGES.YEAR_LABEL || 'Año'}</InputLabel>
                     <Select
                       labelId="year_label"
                       value={year}
                       label={APP_MESSAGES.YEAR_LABEL || 'Año'}
                       onChange={handleYearChange}
                       sx={{
                         ...getDarkFieldSx(theme),
                         '& .MuiSelect-icon': { color: theme.iconoPrincipal },
                         transition: 'all 0.3s ease',
                         '&:hover': {
                           transform: 'translateY(-2px)',
                           boxShadow: theme.sombraHover,
                         },
                         '&.Mui-focused': {
                           transform: 'translateY(-3px)',
                           boxShadow: theme.sombraFocus,
                         }
                       }}
                     >
                      {[...Array(6)].map((_, i) => (
                        <MenuItem 
                          key={currentYear - 2 + i} 
                          value={currentYear - 2 + i}
                          component={motion.div}
                          whileHover={ANIMATIONS.selectOptionHover}
                        >
                          {currentYear - 2 + i}
                        </MenuItem>
                      ))}
                      </Select>  
                  </FormControl>
                </motion.div>
              </Box>  
            </Grid>
          </Grid>

          {/* DatePickers con animaciones mejoradas */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 3, mt: 5 }}>
              <motion.div
                whileHover={ANIMATIONS.formFieldHover}
                whileFocus={ANIMATIONS.formFieldFocus}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1 }}
              >
                <DatePicker
                  label={APP_MESSAGES.DATE_FROM_LABEL || 'Desde'}
                  value={fromDate}
                  onChange={handleFromDateChange}
                  format={APP_MESSAGES.DEFAULT_DATE_FORMAT || 'DD/MM/YYYY'}
                  slotProps={{ 
                    textField: { 
                      sx: { 
                        width: '100%',
                        ...getDarkFieldSx(theme),
                        '& .MuiSvgIcon-root': { color: theme.iconoPrincipal },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.sombraFocus,
                        }
                      },
                      size: "small",
                      InputProps: { sx: getDarkFieldSx(theme) }
                    } 
                  }}
                />
              </motion.div>
              
              <motion.div
                whileHover={ANIMATIONS.formFieldHover}
                whileFocus={ANIMATIONS.formFieldFocus}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1 }}
              >
                <DatePicker
                  label={APP_MESSAGES.DATE_TO_LABEL || 'Hasta'}
                  value={toDate}
                  onChange={handleToDateChange}
                  format={APP_MESSAGES.DEFAULT_DATE_FORMAT || 'DD/MM/YYYY'}
                  slotProps={{ 
                    textField: { 
                      sx: { 
                        width: '100%',
                        ...getDarkFieldSx(theme),
                        '& .MuiSvgIcon-root': { color: theme.iconoPrincipal },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.sombraHover,
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.sombraFocus,
                        }
                      },
                      size: "small",
                      InputProps: { sx: getDarkFieldSx(theme) }
                    } 
                  }}
                />
              </motion.div>
            </Box>
          </LocalizationProvider>
    </Box>
  );
}

export default DateRangeSelector;