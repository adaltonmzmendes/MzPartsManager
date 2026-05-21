import axios from 'axios'

const api = axios.create({
  baseURL: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:8000'
    : '/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Token')
  const isAuthRoute = config.url?.match(/\/(accounts\/login|accounts\/register)/)

  if (token && !isAuthRoute) {
    config.headers.set('Authorization', `Token ${token}`)
  } else {
    config.headers.delete('Authorization')
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/accounts/login')) {
      localStorage.removeItem('Token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api