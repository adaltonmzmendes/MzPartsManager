import { useState } from 'react'
import { Box } from '@mui/material'
import FormPassField from '@/components/forms/FormPassField'
import FormButton from '@/components/forms/FormButton'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '@/services/api'
import MyMessage from '@/components/Message'

const PasswordReset = () => {
    const navigate = useNavigate()
    const { handleSubmit, control } = useForm()
    const { token } = useParams()
    const [ShowMessage, setShowMessage] = useState(false)

    const submission = (data) => {
        api.post(`api/password_reset/confirm/`, {
            password: data.password,
            token: token,
        })
        .then(() => {
            setShowMessage(true)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    return (
        <div className="myBackground">
            {ShowMessage && (
                <MyMessage text="Sua senha foi redefinida com sucesso!" color='#69C9AB'/>
            )}

            <form onSubmit={handleSubmit(submission)}>
                <Box className="whiteBox">

                    <Box className="itemBox">
                        <Box className="title">
                            Redefinindo senha
                        </Box>
                    </Box>

                    <Box className="itemBox">
                        <FormPassField
                            label="Senha"
                            name="password"
                            control={control}
                        />
                    </Box>

                    <Box className="itemBox">
                        <FormPassField
                            label="Confirmar senha"
                            name="password2"
                            control={control}
                        />
                    </Box>

                    <Box className="itemBox">
                        <FormButton
                            label="Redefinir senha"
                            type="submit"
                        />
                    </Box>

                </Box>
            </form>
        </div>
    )
}

export default PasswordReset
