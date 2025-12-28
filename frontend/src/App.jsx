import './App.css'
import Home from '@/pages/Home'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import About from '@/pages/About'
import Navbar from '@/components/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from '@/pages/auth/PasswordResetRequest'
import PasswordReset from '@/pages/auth/PasswordReset'

function App() {
  const location = useLocation()

  const noNavbarRoutes = [
    '/',
    '/register',
    '/request/password_reset',
  ]

  const noNavbar =
    noNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/password_reset/')

  return (
    <>
      {noNavbar ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/request/password_reset"
            element={<PasswordResetRequest />}
          />
          <Route
            path="/password_reset/:token"
            element={<PasswordReset />}
          />
        </Routes>
      ) : (
        <Navbar
          content={
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
              </Route>
            </Routes>
          }
        />
      )}
    </>
  )
}

export default App
