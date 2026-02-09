import { Box, IconButton } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { ItemCard } from '../Home.styles'
import { Item } from '../types'

interface HomeItemRowProps {
  item: Item
  onOpenDetails: (item: Item) => void
}

export const HomeItemRow = ({ item, onOpenDetails }: HomeItemRowProps) => {
  return (
    <ItemCard
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>{item.description}</Box>
      <IconButton
        size="small"
        onClick={() => onOpenDetails(item)}
        aria-label="Informações do item"
      >
        <InfoOutlinedIcon />
      </IconButton>
    </ItemCard>
  )
}