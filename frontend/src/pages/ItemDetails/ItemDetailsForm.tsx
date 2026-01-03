import { Box, Tabs, Tab, Typography, Chip, Stack, Alert } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

import Description from './fields/Description'
import Conversions from './fields/Conversions'
import Tags from './fields/Tags'
import Applications from './fields/Applications'

import { formContainerSx } from './ItemDetailsForm.styles'

// Interface duplicada localmente para evitar dependência circular
interface GlobalSuggestions {
  normalized_description: string | null
  conversions: string[]
  tags: string[]
  applications: string[]
}

interface ItemFormState {
  description: string
  conversions: string[]
  tags: string[]
  applications: string[]
}

interface ItemDetailsFormProps {
  form: ItemFormState
  globalSuggestions: GlobalSuggestions | null
  activeTab: number
  onTabChange: (newValue: number) => void
  onChange: <K extends keyof ItemFormState>(
    field: K
  ) => (value: ItemFormState[K]) => void
  onAcceptSuggestion: (
    field: keyof Omit<ItemFormState, 'description'>,
    value: string
  ) => void
}

const ItemDetailsForm = ({
  form,
  globalSuggestions,
  activeTab,
  onTabChange,
  onChange,
  onAcceptSuggestion,
}: ItemDetailsFormProps) => {

  const renderLocalTab = () => (
    <>
      <Description
        value={form.description}
        onChange={onChange('description')}
      />
      <Conversions
        value={form.conversions}
        onChange={onChange('conversions')}
      />
      <Tags
        value={form.tags}
        onChange={onChange('tags')}
      />
      <Applications
        applications={form.applications}
        onChange={onChange('applications')}
      />
    </>
  )

  const renderSuggestionsTab = () => {
    if (!globalSuggestions) {
      return (
        <Alert severity="info">
          Não há sugestões da comunidade disponíveis para este item no momento.
        </Alert>
      )
    }

    // Filtra o que tem no Global mas NÃO tem no Local
    const missingConversions = globalSuggestions.conversions.filter(
      (c) => !form.conversions.includes(c)
    )
    const missingTags = globalSuggestions.tags.filter(
      (t) => !form.tags.includes(t)
    )
    const missingApps = globalSuggestions.applications.filter(
      (a) => !form.applications.includes(a)
    )

    const hasSuggestions = 
      missingConversions.length > 0 || 
      missingTags.length > 0 || 
      missingApps.length > 0 ||
      (globalSuggestions.normalized_description && globalSuggestions.normalized_description !== form.description)

    return (
      <>
        {!hasSuggestions && (
          <Alert severity="success" sx={{ mb: 3 }}>
             Seu item já está atualizado com todas as definições da comunidade!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Descrição Padronizada (Referência)
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography color="text.primary">
                  {globalSuggestions.normalized_description || "Sem descrição padronizada disponível."}
              </Typography>
          </Box>
        </Box>

        <SuggestionsSection 
          title="Conversões Sugeridas" 
          items={missingConversions} 
          onAdd={(val) => onAcceptSuggestion('conversions', val)} 
        />

        <SuggestionsSection 
          title="Tags Sugeridas" 
          items={missingTags} 
          onAdd={(val) => onAcceptSuggestion('tags', val)} 
        />

        <SuggestionsSection 
          title="Aplicações Sugeridas" 
          items={missingApps} 
          onAdd={(val) => onAcceptSuggestion('applications', val)} 
        />
      </>
    )
  }

  return (
    <Box sx={formContainerSx}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
        >
          <Tab label="Sua empresa" />
          <Tab label="Sugestões da comunidade" />
        </Tabs>
      </Box>

      {activeTab === 0 ? renderLocalTab() : renderSuggestionsTab()}
    </Box>
  )
}

const SuggestionsSection = ({ 
    title, 
    items, 
    onAdd 
}: { 
    title: string, 
    items: string[], 
    onAdd: (val: string) => void 
}) => {
    if (items.length === 0) return null

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {items.map((item) => (
                    <Chip
                        key={item}
                        label={item}
                        onClick={() => onAdd(item)}
                        icon={<AddCircleOutlineIcon />}
                        color="primary"
                        variant="outlined"
                        clickable
                    />
                ))}
            </Stack>
        </Box>
    )
}

export default ItemDetailsForm