import { Box, IconButton } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ItemRow, { ItemData } from '@/components/ItemRow'
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger'

interface CatalogListProps {
  items: ItemData[]
  onInfoClick: (item: ItemData) => void
  onIntersect: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

const CatalogList = ({ 
  items, 
  onInfoClick, 
  onIntersect, 
  hasNextPage, 
  isFetchingNextPage 
}: CatalogListProps) => {
  return (
    <>
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          variant="simple"
          actions={
            <IconButton
              size="small"
              onClick={() => onInfoClick(item)}
              aria-label="Informações do item"
              color="primary"
            >
              <InfoOutlinedIcon />
            </IconButton>
          }
        />
      ))}
      
      <InfiniteScrollTrigger
        onIntersect={onIntersect}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  )
}

export default CatalogList