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
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage) {
        onFetchNext()
      }
    },
  })

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 2,
        minHeight: 50,
      }}
    >
      {isFetchingNextPage && <CircularProgress size={24} />}
    </Box>
  )
}