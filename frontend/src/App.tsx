import { Routes, Route, useLocation } from 'react-router-dom'

import Home from '@/pages/Home'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoutes'
import PasswordResetRequest from '@/pages/auth/PasswordResetRequest'
import PasswordReset from '@/pages/auth/PasswordReset'
import Purchases from '@/pages/Purchases'
import AddItem from '@/pages/AddItem'
import ArchivedItems from '@/pages/ArchivedItems'
import EditPrices from '@/pages/Purchases/EditPrices'
import Transactions from '@/pages/Transactions'
import TransactionDetails from '@/pages/Transactions/details' // Ajuste o caminho conforme a estrutura do seu projeto

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
                <Route path="/transactions" element={<Transactions />} />
                {/* Nota: Atualize o onClick do botão na tela de Transactions para usar `/transactions/${t.id}` mantendo o padrão em inglês das rotas */}
                <Route path="/transactions/:id" element={<TransactionDetails />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/purchases/add" element={<AddItem />} />
                <Route path="/purchases/:id/prices" element={<EditPrices />} />
                <Route path="/archived" element={<ArchivedItems />} />
              </Route>
            </Routes>
          }
        />
      )}
    </>
  )
}

export default App