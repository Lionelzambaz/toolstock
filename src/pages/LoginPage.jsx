import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError('Email et mot de passe requis')
      setLoading(false)
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/catalog')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src="/logo-512.png" alt="ToolStock" style={styles.logo} />
        </div>
        <h1 style={styles.title}>ToolStock</h1>
        <p style={styles.subtitle}>Gestion de commandes de pièces</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.ch"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain'
  },
  title: {
    textAlign: 'center',
    color: '#042C53',
    marginBottom: '10px',
    fontSize: '28px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#888780',
    marginBottom: '30px',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  button: {
    padding: '12px',
    backgroundColor: '#185FA5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    padding: '10px',
    backgroundColor: '#ffe0e0',
    color: '#A32D2D',
    borderRadius: '6px',
    fontSize: '14px'
  },
  info: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#888780',
    textAlign: 'center',
    lineHeight: '1.6'
  }
}