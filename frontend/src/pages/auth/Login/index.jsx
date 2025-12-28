import { useState } from "react"
import { Box } from "@mui/material"
import FormTextField from "@/components/forms/FormTextField"
import FormPassField from "@/components/forms/FormPassField"
import FormButton from "@/components/forms/FormButton"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import api from "@/services/api"
import MyMessage from "@/components/Message"

const Login = () => {
    const navigate = useNavigate()
    const { handleSubmit, control } = useForm()

    const [message, setMessage] = useState(null)

    const submission = (data) => {
        setMessage(null)

        api.post("api/accounts/login/", {
            email: data.email,
            password: data.password,
        })
            .then((response) => {
                localStorage.setItem("Token", response.data.token)
                navigate("/home")
            })
            .catch((error) => {
                const code = error.response?.data?.code
                const backendMessage = error.response?.data?.message

                if (code === "no_company") {
                    setMessage({
                        text: backendMessage,
                        color: "#F4A261",
                    })
                    return
                }

                if (code === "invalid_credentials") {
                    setMessage({
                        text: "Email ou senha inválidos.",
                        color: "#EC5A76",
                    })
                    return
                }

                setMessage({
                    text: "Erro ao realizar login. Tente novamente.",
                    color: "#EC5A76",
                })

                console.error(error)
            })
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

                    <Box className="itemBox" sx={{ flexDirection: "column" }}>
                        <Link to="/register">Não tem conta? Registre-se</Link>
                        <Link to="/request/password_reset">Esqueceu sua senha?</Link>
                    </Box>
                </Box>
            </form>
        </div>
    )
}

export default Login
