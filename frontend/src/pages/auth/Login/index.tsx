import { useState } from 'react'
import { Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import FormTextField from '@/components/forms/FormTextField'
import FormPassField from '@/components/forms/FormPassField'
import FormButton from '@/components/forms/FormButton'
import MyMessage from '@/components/Message'

import api from '@/services/api'

interface LoginFormData {
  email: string
  password: string
}

interface MessageState {
  text: string
  color: string
}

interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    company_id: string
    company_name: string
    company_logo: string | null
  }
}

const Login = () => {
  const navigate = useNavigate()
  const { handleSubmit, control } = useForm<LoginFormData>()

  const [message, setMessage] = useState<MessageState | null>(null)

  const submission = async (data: LoginFormData) => {
    setMessage(null)

    try {
      const response = await api.post<LoginResponse>(
        'api/accounts/login/',
        {
          email: data.email,
          password: data.password,
        }
      )

      localStorage.setItem('Token', response.data.token)
      localStorage.setItem('CompanyName', response.data.user.company_name)
      
      if (response.data.user.company_logo) {
        localStorage.setItem('CompanyLogo', response.data.user.company_logo)
      } else {
        localStorage.removeItem('CompanyLogo')
      }

      navigate('/home')
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const err = error as {
          response?: {
            data?: {
              code?: string
              message?: string
            }
          }
        }

        const code = err.response?.data?.code
        const backendMessage = err.response?.data?.message

        if (code === 'no_company') {
          setMessage({
            text: backendMessage ?? 'Empresa não encontrada.',
            color: '#F4A261',
          })
          return
        }

        if (code === 'invalid_credentials') {
          setMessage({
            text: 'Email ou senha inválidos.',
            color: '#EC5A76',
          })
          return
        }
      }

      setMessage({
        text: 'Erro ao realizar login. Tente novamente.',
        color: '#EC5A76',
      })

      console.error(error)
    }
  }

  return (
    <div className="myBackground">
      {message && (
        <MyMessage
          text={message.text}
          color={message.color}
        />
      )}

      <form onSubmit={handleSubmit(submission)}>
        <Box className="whiteBox">
          <Box className="itemBox">
            <Box className="title">Login</Box>
          </Box>

          <Box className="itemBox">
            <FormTextField
              label="Email"
              name="email"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormPassField
              label="Senha"
              name="password"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormButton
              label="Entrar"
              type="submit"
            />
          </Box>

          <Box
            className="itemBox"
            sx={{ flexDirection: 'column' }}
          >
            <Link to="/register">
              Não tem conta? Registre-se
            </Link>
            <Link to="/request/password_reset">
              Esqueceu sua senha?
            </Link>
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default Login