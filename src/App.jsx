import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout/Layout'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'
import CommandsPage from './pages/CommandsPage'
import ValidationPage from './pages/ValidationPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {isAuthenticated ? (
          <>
            <Route path="/catalog" element={
              <Layout><CatalogPage /></Layout>
            } />
            <Route path="/cart" element={
              <Layout><CartPage /></Layout>
            } />
            <Route path="/commands" element={
              <Layout><CommandsPage /></Layout>
            } />
            <Route path="/validation" element={
              <Layout><ValidationPage /></Layout>
            } />
            <Route path="/admin" element={
              <Layout><AdminPage /></Layout>
            } />
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </>
        ) : (
          <>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}