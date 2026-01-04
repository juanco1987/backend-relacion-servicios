import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const Loading = ({ message = 'Cargando...' }) => {
    const { theme } = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '400px',
                color: theme.textoPrincipal || '#333',
            }}
        >
            <CircularProgress
                size={50}
                thickness={4}
                sx={{
                    color: theme.primario || '#1976d2',
                    marginBottom: 2
                }}
            />
            <Typography variant="h6" sx={{ opacity: 0.8 }}>
                {message}
            </Typography>
        </Box>
    );
};

export default Loading;
