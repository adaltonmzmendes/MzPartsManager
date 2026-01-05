import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Box, CircularProgress } from '@mui/material' // Removido Typography

interface InfiniteScrollTriggerProps {
  onIntersect: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

const InfiniteScrollTrigger = ({
  onIntersect,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollTriggerProps) => {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onIntersect()
    }
  }, [inView, hasNextPage, isFetchingNextPage, onIntersect])

  if (!hasNextPage) return null

  return (
    <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', p: 2, minHeight: 50 }}>
      <CircularProgress size={24} />
    </Box>
  )
}

export default InfiniteScrollTrigger