import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout/Layout'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'
import CommandsPage from './pages/CommandsPage'

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
        {/* Route Login - accessible à tout le monde */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées - nécessitent d'être connecté */}
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
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </>
        ) : (
          <>
            {/* Si pas connecté, tout redirige vers login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

// Composants placeholder (à créer plus tard)
function ValidationPage() {
  return <div><h2>Validation des commandes</h2><p>À venir...</p></div>
}

function AdminPage() {
  return <div><h2>Administration</h2><p>À venir...</p></div>
}