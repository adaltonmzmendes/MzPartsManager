import React from 'react'
import { Box, Typography, Paper, Chip, Divider } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

export interface ItemData {
  id: number
  description: string
  price?: number   
  cost?: number
  quantity?: number
}

export type ItemRowVariant = 'simple' | 'inventory' | 'sales' | 'purchase'

interface ItemRowProps {
  item: ItemData
  variant?: ItemRowVariant
  actions?: React.ReactNode
}

const ItemRow: React.FC<ItemRowProps> = ({ 
  item, 
  variant = 'simple', 
  actions 
}) => {
  
  const showPrice = ['inventory', 'sales'].includes(variant)
  const showCost = ['inventory', 'purchase'].includes(variant)
  const showQty = ['inventory', 'sales', 'purchase'].includes(variant)

  const formatCurrency = (val?: number) => 
    val !== undefined 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) 
      : '-'

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>

        <Typography variant="body1" fontWeight={600} color="text.primary">
          {item.description}
        </Typography>

        {variant !== 'simple' && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            
            {showPrice && (
              <Chip 
                icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />} 
                label={`Venda: ${formatCurrency(item.price)}`} 
                size="small" 
                color="success" 
                variant="outlined" 
              />
            )}

            {showCost && (
              <Chip 
                label={`Custo: ${formatCurrency(item.cost)}`} 
                size="small" 
                color="warning" 
                variant="outlined" 
              />
            )}

            {showQty && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <span>Qtd: {item.quantity ?? 0}</span>
              </Box>
            )}
            
          </Box>
        )}
      </Box>

      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Divider orientation="vertical" flexItem sx={{ mr: 1, height: 24, alignSelf: 'center' }} /> 
          {actions}
        </Box>
      )}
    </Paper>
  )
}

export default ItemRow