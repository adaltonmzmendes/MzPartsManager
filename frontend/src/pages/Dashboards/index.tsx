import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'
import AssessmentIcon from '@mui/icons-material/Assessment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PercentIcon from '@mui/icons-material/Percent'

import api from '@/services/api'

// Funções auxiliares para datas
const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getToday = () => new Date()

const getLastMonthRange = () => {
  const d = getToday()
  return {
    start: formatDate(new Date(d.getFullYear(), d.getMonth() - 1, 1)),
    end: formatDate(new Date(d.getFullYear(), d.getMonth(), 0))
  }
}

const getThisMonthRange = () => {
  const d = getToday()
  return {
    start: formatDate(new Date(d.getFullYear(), d.getMonth(), 1)),
    end: formatDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
  }
}

const getLast7DaysRange = () => {
  const d = getToday()
  const start = new Date(d)
  start.setDate(d.getDate() - 7)
  return { start: formatDate(start), end: formatDate(d) }
}

const getTodayRange = () => {
  return { start: formatDate(getToday()), end: formatDate(getToday()) }
}

const formatCurrency = (val: number | undefined) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export const Dashboard = () => {
  const [filterType, setFilterType] = useState('mes_anterior')
  const [dateRange, setDateRange] = useState(getLastMonthRange())

  const handleFilterChange = (value: string) => {
    setFilterType(value)
    if (value === 'mes_anterior') setDateRange(getLastMonthRange())
    if (value === 'este_mes') setDateRange(getThisMonthRange())
    if (value === '7_dias') setDateRange(getLast7DaysRange())
    if (value === 'hoje') setDateRange(getTodayRange())
  }

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', dateRange.start, dateRange.end],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats/', {
        params: { start_date: dateRange.start, end_date: dateRange.end }
      })
      return res.data
    }
  })

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600} display="flex" alignItems="center" gap={1}>
          <AssessmentIcon fontSize="large" color="primary" />
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              label="Período"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <MenuItem value="hoje">Hoje</MenuItem>
              <MenuItem value="7_dias">Últimos 7 dias</MenuItem>
              <MenuItem value="este_mes">Este Mês</MenuItem>
              <MenuItem value="mes_anterior">Mês Anterior</MenuItem>
              <MenuItem value="personalizado">Personalizado</MenuItem>
            </Select>
          </FormControl>

          {filterType === 'personalizado' && (
            <>
              <TextField
                type="date"
                size="small"
                label="Início"
                InputLabelProps={{ shrink: true }}
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
              <TextField
                type="date"
                size="small"
                label="Fim"
                InputLabelProps={{ shrink: true }}
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* CSS Grid moderno substituindo o antigo <Grid> do Material UI */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, 
              gap: 3, 
              mb: 4 
            }}
          >
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <AttachMoneyIcon color="success" fontSize="large" />
              <Typography variant="body2" color="text.secondary" gutterBottom>Faturamento</Typography>
              <Typography variant="h5" fontWeight={600}>{formatCurrency(data?.total_revenue)}</Typography>
            </Paper>

            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <TrendingUpIcon color="primary" fontSize="large" />
              <Typography variant="body2" color="text.secondary" gutterBottom>Lucro Bruto</Typography>
              <Typography variant="h5" fontWeight={600}>{formatCurrency(data?.profit)}</Typography>
            </Paper>

            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <AttachMoneyIcon color="info" fontSize="large" />
              <Typography variant="body2" color="text.secondary" gutterBottom>Ticket Médio</Typography>
              <Typography variant="h5" fontWeight={600}>{formatCurrency(data?.avg_ticket)}</Typography>
            </Paper>

            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <ShoppingCartIcon color="warning" fontSize="large" />
              <Typography variant="body2" color="text.secondary" gutterBottom>Vendas Totais</Typography>
              <Typography variant="h5" fontWeight={600}>{data?.total_sales}</Typography>
            </Paper>

            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <PercentIcon color="secondary" fontSize="large" />
              <Typography variant="body2" color="text.secondary" gutterBottom>Taxa de Conversão</Typography>
              <Typography variant="h5" fontWeight={600}>{data?.conversion_rate?.toFixed(2)}%</Typography>
            </Paper>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={3} fontWeight={600}>Evolução do Faturamento</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickMargin={10} />
                  <YAxis tickFormatter={(val) => `R$ ${val}`} width={80} />
                  <RechartsTooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1976d2" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default Dashboard