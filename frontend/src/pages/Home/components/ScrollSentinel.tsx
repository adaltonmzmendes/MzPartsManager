import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useInView } from 'react-intersection-observer'

interface ScrollSentinelProps {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onFetchNext: () => void
}

export const ScrollSentinel = ({
  isFetchingNextPage,
  hasNextPage,
  onFetchNext,
}: ScrollSentinelProps) => {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      onFetchNext()
    }
  }, [inView, hasNextPage, onFetchNext])

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 2,
        minHeight: 50, // Garante altura para o observer funcionar
      }}
    >
      {isFetchingNextPage && <CircularProgress size={24} />}
    </Box>
  )
}