import React from 'react';
import { Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../utils/numberFormatters';
import { useTheme } from '../../../context/ThemeContext';
import CustomTooltip from '../../common/CustomTooltip';

function AnalyticsChart({ dataGrafica }) {
  const { theme } = useTheme();

  return (
    <Paper sx={{
      background: theme.fondoOverlay,
      borderRadius: '25px',
      padding: '24px',
      boxShadow: theme.sombraComponente,
      border: `1px solid ${theme.bordePrincipal}`,
      mb: 4
    }}>
      <Typography variant="h6" sx={{ 
        color: theme.textoPrincipal, 
        fontWeight: 'bold', 
        mb: 2,
        textAlign: 'center'
      }}>
        Gráfico de Ingresos por Mes
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dataGrafica}>
          <XAxis 
            dataKey="mes" 
            tick={{ fill: theme.textoPrincipal }}
            axisLine={{ stroke: theme.bordePrincipal }}
          />
          <YAxis 
            tick={{ fill: theme.textoPrincipal }}
            axisLine={{ stroke: theme.bordePrincipal }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Efectivo" fill={theme.terminalVerde} />
          <Bar dataKey="Transferencia" fill={theme.textoInfo} />
          <Bar dataKey="Total General" fill={theme.terminalVerdeNeon} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default AnalyticsChart;