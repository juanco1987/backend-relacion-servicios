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
            tick={{ 
              fill: theme.textoPrincipal,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
            axisLine={{ stroke: theme.bordePrincipal }}
            height={60}  // Da más espacio para los labels rotados
            tickFormatter={(value) => {
              // Formato: "Enero 2024" -> "Ene"
              const mes = value.split(' ')[0];
              const abreviaturas = {
                'Enero': 'Ene',
                'Febrero': 'Feb',
                'Marzo': 'Mar',
                'Abril': 'Abr',
                'Mayo': 'May',
                'Junio': 'Jun',
                'Julio': 'Jul',
                'Agosto': 'Ago',
                'Septiembre': 'Sep',
                'Octubre': 'Oct',
                'Noviembre': 'Nov',
                'Diciembre': 'Dic'
              };
              return abreviaturas[mes] || mes;
            }}
          />
          <YAxis 
            tick={{ fill: theme.textoPrincipal }}
            axisLine={{ stroke: theme.bordePrincipal }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Efectivo" fill={theme.terminalVerde} radius={[16, 16, 0, 0]} />
          <Bar dataKey="Transferencia" fill={theme.textoInfo} radius={[16, 16, 0, 0]} />
          <Bar dataKey="Total General" fill={theme.terminalVerdeNeon} radius={[16, 16, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default AnalyticsChart;