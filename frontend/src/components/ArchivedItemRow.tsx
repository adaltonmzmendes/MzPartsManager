import { Tooltip, IconButton, Box } from '@mui/material'
import UnarchiveIcon from '@mui/icons-material/Unarchive'

import { Item } from '@/pages/Purchases/types'
import { ItemRow } from '@/components/ItemRow'
import { StyledRow } from './ArchivedItemRow.styles'

interface ArchivedItemRowProps {
  item: Item
  onRestore: (id: number) => void
}

export const ArchivedItemRow = ({ item, onRestore }: ArchivedItemRowProps) => {
  return (
    <StyledRow>
      <ItemRow
        item={item}
        actions={
          <Box onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Restaurar item">
              <IconButton 
                onClick={() => onRestore(item.id)}
                size="small"
                color="warning"
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <UnarchiveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
    </StyledRow>
  )
}