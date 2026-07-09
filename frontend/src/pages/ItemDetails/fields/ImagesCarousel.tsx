import { Box, IconButton, Typography, Dialog, AppBar, Toolbar, Slide } from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useRef, useState, forwardRef } from 'react'
import type { ReactElement } from 'react'
import type { TransitionProps } from '@mui/material/transitions'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface ItemImage {
  id: number
  image: string
}

interface ImagesCarouselProps {
  existingImages: ItemImage[]
  newImages: File[]
  onAddImages: (files: File[]) => void
  onRemoveNewImage: (index: number) => void
  onRemoveExistingImage: (id: number) => void
}

export default function ImagesCarousel({ 
  existingImages, 
  newImages, 
  onAddImages, 
  onRemoveNewImage,
  onRemoveExistingImage 
}: ImagesCarouselProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddImages(Array.from(e.target.files))
    }
  }

  const allItems = [
    ...existingImages.map(img => ({ type: 'existing' as const, url: img.image, id: img.id })),
    ...newImages.map((file, idx) => ({ type: 'new' as const, url: URL.createObjectURL(file), index: idx }))
  ]

  const handleDeleteCurrent = () => {
    if (viewerIndex === null) return
    
    if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
      const item = allItems[viewerIndex]
      if (item.type === 'existing') {
        onRemoveExistingImage(item.id)
      } else {
        onRemoveNewImage(item.index)
      }
      setViewerIndex(null)
    }
  }

  const handleNext = () => setViewerIndex(prev => prev! < allItems.length - 1 ? prev! + 1 : 0)
  const handlePrev = () => setViewerIndex(prev => prev! > 0 ? prev! - 1 : allItems.length - 1)

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1, fontWeight: 600 }}>
        Fotos do Item
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        pb: 2,
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}>
        <Box 
          onClick={() => fileInputRef.current?.click()}
          sx={{ 
            minWidth: 120, 
            height: 160, 
            borderRadius: 4, 
            bgcolor: 'action.hover', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            scrollSnapAlign: 'start',
            flexShrink: 0,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <AddPhotoAlternateIcon color="action" fontSize="large" />
          <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
        </Box>
        
        {allItems.map((item, i) => (
          <Box 
            key={item.type === 'existing' ? `ext-${item.id}` : `new-${item.index}`} 
            onClick={() => setViewerIndex(i)}
            sx={{ 
              position: 'relative', 
              minWidth: 120, 
              height: 160, 
              borderRadius: 4, 
              overflow: 'hidden', 
              scrollSnapAlign: 'start', 
              flexShrink: 0, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer'
            }}
          >
            <Box component="img" src={item.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        ))}
      </Box>

      <Dialog
        fullScreen
        open={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
        TransitionComponent={Transition}
        PaperProps={{ sx: { bgcolor: 'black' } }}
      >
        <AppBar position="fixed" sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setViewerIndex(null)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="inherit" onClick={handleDeleteCurrent} sx={{ color: 'error.main' }}>
              <DeleteIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {viewerIndex !== null && allItems[viewerIndex] && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            position: 'relative'
          }}>
            <Box 
              component="img" 
              src={allItems[viewerIndex].url} 
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
            
            {allItems.length > 1 && (
              <>
                <IconButton 
                  onClick={handlePrev}
                  sx={{ position: 'absolute', left: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                  <ChevronLeftIcon fontSize="large" />
                </IconButton>
                <IconButton 
                  onClick={handleNext}
                  sx={{ position: 'absolute', right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                  <ChevronRightIcon fontSize="large" />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  )
}