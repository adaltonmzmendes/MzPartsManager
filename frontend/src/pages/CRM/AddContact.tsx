import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

interface AddContactProps {
  type: 'client' | 'supplier'
}

interface AddContactPayload {
  name: string
  document: string
  email: string
  phone: string
  is_client: boolean
  is_supplier: boolean
}

const formatPhone = (val: string) => {
  let v = val.replace(/\D/g, '')
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
  } else {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
  }
  return v.substring(0, 15)
}

const formatCPF = (val: string) => {
  let v = val.replace(/\D/g, '')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return v.substring(0, 14)
}

const formatCNPJ = (val: string) => {
  let v = val.replace(/\D/g, '')
  v = v.replace(/^(\d{2})(\d)/, '$1.$2')
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
  v = v.replace(/(\d{4})(\d)/, '$1-$2')
  return v.substring(0, 18)
}

export const AddContact = ({ type }: AddContactProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isClient = type === 'client'
  const title = isClient ? 'Adicionar Cliente' : 'Adicionar Fornecedor'

  const [name, setName] = useState('')
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>(isClient ? 'cpf' : 'cnpj')
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const mutation = useMutation({
    mutationFn: async (payload: AddContactPayload) => {
      const { data } = await api.post('/api/crm/contacts/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      navigate('/crm')
    },
    onError: (error: any) => {
      const msg = error.response?.data?.name?.[0] || 'Ocorreu um erro ao salvar o contato.'
      setErrorMsg(msg)
    }
  })

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDocument(docType === 'cpf' ? formatCPF(val) : formatCNPJ(val))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    mutation.mutate({
      name,
      document,
      email,
      phone,
      is_client: isClient,
      is_supplier: !isClient,
    })
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          {title}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <TextField
              label="Nome"
              required
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrorMsg('')
              }}
              disabled={mutation.isPending}
              error={!!errorMsg}
              helperText={errorMsg}
            />

            {isClient && (
              <FormControl>
                <FormLabel>Tipo de Documento</FormLabel>
                <RadioGroup
                  row
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value as 'cpf' | 'cnpj')
                    setDocument('')
                  }}
                >
                  <FormControlLabel value="cpf" control={<Radio />} label="CPF" />
                  <FormControlLabel value="cnpj" control={<Radio />} label="CNPJ" />
                </RadioGroup>
              </FormControl>
            )}

            <TextField
              label={docType === 'cpf' ? 'CPF' : 'CNPJ'}
              fullWidth
              value={document}
              onChange={handleDocumentChange}
              disabled={mutation.isPending}
            />

            <TextField
              label="Telefone"
              fullWidth
              value={phone}
              onChange={handlePhoneChange}
              disabled={mutation.isPending}
              placeholder="(00) 00000-0000"
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)} 
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!name.trim() || mutation.isPending}
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}