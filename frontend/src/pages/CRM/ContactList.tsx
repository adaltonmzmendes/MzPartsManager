import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import api from '@/services/api'
import { Search } from '@/components/Search'

interface Contact {
  id: number
  name: string
  document: string
  email: string
  phone: string
  is_client: boolean
  is_supplier: boolean
}

export const ContactList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabIndex, setTabIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const typeParams = {
    ...(tabIndex === 0 ? { is_client: true } : { is_supplier: true }),
    ...(searchTerm ? { search: searchTerm } : {})
  }

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts', tabIndex, searchTerm],
    queryFn: async () => {
      const { data } = await api.get('api/crm/contacts/', { params: typeParams })
      return data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`api/crm/contacts/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>CRM - Contatos</Typography>
      
      <Tabs 
        value={tabIndex} 
        onChange={(_, v) => {
          setTabIndex(v)
          setSearchTerm('')
        }} 
        sx={{ mb: 2 }}
      >
        <Tab label="Clientes" />
        <Tab label="Fornecedores" />
      </Tabs>

      <Search 
        onSearch={setSearchTerm} 
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate(tabIndex === 0 ? '/crm/client/add' : '/crm/supplier/add')}
          >
            Adicionar {tabIndex === 0 ? 'Cliente' : 'Fornecedor'}
          </Button>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.document}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Excluir">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}