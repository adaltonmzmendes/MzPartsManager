import { useState } from 'react'
import { Box } from '@mui/material'
import FormTextField from '@/components/forms/FormTextField'
import FormButton from '@/components/forms/FormButton'
import { useForm } from 'react-hook-form'
import api from '@/services/api'
import MyMessage from '@/components/Message'

const PasswordResetRequest = () => {
    const { handleSubmit, control } = useForm()
    const [ShowMessage, setShowMessage] = useState(false)

    const submission = (data) => {
        api.post(`api/password_reset/`, {
            email: data.email,
        })
        .then(() => {
            setShowMessage(true)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    return (
        <div className="myBackground">
            {ShowMessage && (
                <MyMessage
                    text="Se o seu email existe, você recebeu um email com as instruções para recuperar sua senha" color='#69C9AB'
                />
            )}

            <form onSubmit={handleSubmit(submission)}>
                <Box className="whiteBox">

                    <Box className="itemBox">
                        <Box className="title">
                            Redefinir Senha
                        </Box>
                    </Box>

                    <Box className="itemBox">
                        <MyTextField
                            label="Email"
                            name="email"
                            control={control}
                        />
                    </Box>

                    <Box className="itemBox">
                        <MyButton
                            label="Solicitar redefinição de senha"
                            type="submit"
                        />
                    </Box>

                </Box>
            </form>
        </div>
    )
}

export default PasswordResetRequest
