import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function Layout({ children }) {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
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

      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            <NavLink href="/catalog" icon="📚">
              Catalogue
            </NavLink>
            <NavLink href="/cart" icon="🛒">
              Panier
            </NavLink>
            <NavLink href="/commands" icon="📋">
              Mes commandes
            </NavLink>
            {(userProfile?.role === 'supervisor' || userProfile?.role === 'admin') && (
              <NavLink href="/validation" icon="✅">
                Validation
              </NavLink>
            )}
            {userProfile?.role === 'admin' && (
              <NavLink href="/admin" icon="⚙️">
                Administration
              </NavLink>
            )}
          </nav>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, children }) {
  const isActive = window.location.pathname === href
  
  return (
    <a 
      href={href}
      style={{
        ...styles.navLink,
        ...(isActive ? styles.navLinkActive : {})
      }}
    >
      <span style={styles.icon}>{icon}</span>
      {children}
    </a>
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
  main: {
    display: 'flex',
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  sidebar: {
    width: '250px',
    backgroundColor: 'white',
    padding: '20px',
    borderRight: '1px solid #ddd'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  navLinkActive: {
    backgroundColor: '#E6F1FB',
    color: '#185FA5',
    fontWeight: '500'
  },
  icon: {
    fontSize: '18px'
  },
  content: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#f5f5f5'
  }
}