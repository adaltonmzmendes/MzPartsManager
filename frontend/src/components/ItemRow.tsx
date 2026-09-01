import { ReactNode } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { ItemCard } from '@/pages/Purchases/Purchases.styles'
import { Item } from '@/pages/Purchases/types'

interface ItemRowProps {
  item: Item
  showPrice?: boolean
  showCost?: boolean
  onOpenDetails?: (item: Item) => void
  actions?: ReactNode
}

const formatCurrency = (value?: string | number) => {
  const numericValue = Number(value)
  if (isNaN(numericValue)) return 'R$ 0,00'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue)
}

export const ItemRow = ({ item, showPrice, showCost, onOpenDetails, actions }: ItemRowProps) => {
  return (
    <ItemCard
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body1">{item.description}</Typography>
        
        {(showCost || showPrice) && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Estoque: {item.inventory?.quantity ?? 0}
            </Typography>
            {showCost && (
              <Typography variant="body2" color="text.secondary">
                Custo: {formatCurrency(item.inventory?.cost_price)}
              </Typography>
            )}
            {showPrice && (
              <Typography variant="body2" color="text.secondary">
                Preço: {formatCurrency(item.inventory?.sell_price)}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {actions}

        {onOpenDetails && (
          <Tooltip title="Detalhes">
            <IconButton
              size="small"
              onClick={() => onOpenDetails(item)}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </ItemCard>
  )
}