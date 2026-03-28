import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import AdminMenuVertical from './AdminMenuVertical'

export function Layout({ children }) {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Menu vertical principal */}
      <AdminMenuVertical />

      {/* Header */}
      <header style={{ ...styles.header, marginLeft: isMobile ? 0 : '62px' }}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>ToolStock</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              {userProfile?.nom || 'Utilisateur'}
            </span>
            <span style={styles.userRole}>
              ({userProfile?.role || 'user'})
            </span>
            <button 
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ ...styles.content, marginLeft: isMobile ? 0 : '62px', padding: isMobile ? '15px' : '30px' }}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#042C53',
    color: 'white',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginLeft: '62px'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0'
  },
  logo: {
    fontSize: '24px',
    margin: 0,
    color: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userName: {
    fontSize: '14px'
  },
  userRole: {
    fontSize: '12px',
    opacity: 0.8
  },
  logoutBtn: {
    padding: '8px 12px',
    backgroundColor: '#185FA5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  content: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#f5f5f5',
    marginLeft: '62px',
    marginBottom: '56px'
  }
}