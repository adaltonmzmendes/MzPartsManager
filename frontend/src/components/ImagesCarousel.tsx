import { Box, IconButton, Typography, Dialog, AppBar, Toolbar, Slide } from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useRef, useState, forwardRef } from 'react'
import type { ReactElement } from 'react'
import type { TransitionProps } from '@mui/material/transitions'
import imageCompression from 'browser-image-compression'

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
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    setIsCompressing(true)
    const files = Array.from(e.target.files)
    const compressedFiles: File[] = []

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp' as const
    }

    for (const file of files) {
      try {
        const compressedBlob = await imageCompression(file, options)
        const compressedFile = new File(
          [compressedBlob], 
          file.name.replace(/\.[^/.]+$/, ".webp"), 
          { type: 'image/webp' }
        )
        compressedFiles.push(compressedFile)
      } catch (error) {
        compressedFiles.push(file)
      }
    }

    onAddImages(compressedFiles)
    setIsCompressing(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        Fotos do Item {isCompressing && '(Comprimindo...)'}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1.5, sm: 2 }, 
        overflowX: 'auto', 
        pb: 2,
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}>
        <Box 
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          sx={{ 
            width: { xs: 90, sm: 120 },
            minWidth: { xs: 90, sm: 120 }, 
            height: { xs: 120, sm: 160 }, 
            borderRadius: { xs: 2, sm: 4 }, 
            bgcolor: isCompressing ? 'action.disabledBackground' : 'action.hover', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: isCompressing ? 'wait' : 'pointer',
            scrollSnapAlign: 'start',
            flexShrink: 0,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: isCompressing ? 'action.disabledBackground' : 'action.selected' }
          }}
        >
          <AddPhotoAlternateIcon color={isCompressing ? "disabled" : "action"} sx={{ fontSize: { xs: 32, sm: 40 } }} />
          <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
        </Box>
        
        {allItems.map((item, i) => (
          <Box 
            key={item.type === 'existing' ? `ext-${item.id}` : `new-${item.index}`} 
            onClick={() => setViewerIndex(i)}
            sx={{ 
              position: 'relative', 
              width: { xs: 90, sm: 120 },
              minWidth: { xs: 90, sm: 120 }, 
              height: { xs: 120, sm: 160 }, 
              borderRadius: { xs: 2, sm: 4 }, 
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