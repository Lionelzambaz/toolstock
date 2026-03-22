import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ShoppingCart, FileText, CheckCircle, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AdminMenuVertical() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userProfile } = useAuth()
  const [showLabels, setShowLabels] = useState(false)

  const buttons = [
    {
      label: 'Catalogue',
      to: '/catalog',
      icon: <BookOpen size={20} strokeWidth={1.7} />
    },
    {
      label: 'Panier',
      to: '/cart',
      icon: <ShoppingCart size={20} strokeWidth={1.7} />
    },
    {
      label: 'Mes commandes',
      to: '/commands',
      icon: <FileText size={20} strokeWidth={1.7} />
    },
    ...(userProfile?.role === 'supervisor' || userProfile?.role === 'admin' ? [{
      label: 'Validation',
      to: '/validation',
      icon: <CheckCircle size={20} strokeWidth={1.7} />
    }] : []),
    ...(userProfile?.role === 'admin' ? [{
      label: 'Admin',
      to: '/admin',
      icon: <Settings size={20} strokeWidth={1.7} />
    }] : [])
  ]

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  const navGrey = '#dde3ed'

  const handleClick = (to) => {
    navigate(to)
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .menu-mobile {
            display: flex !important;
          }
          .menu-desktop {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .menu-mobile {
            display: none !important;
          }
          .menu-desktop {
            display: block !important;
          }
        }
      `}</style>

      {/* MOBILE (< 768px) : barre en bas */}
      <div
        className="menu-mobile"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          background: '#042C53',
          borderTop: '1px solid rgba(255,255,255,0.12)'
        }}
      >
        {buttons.map((btn) => (
          <button
            key={btn.to}
            onClick={() => handleClick(btn.to)}
            style={{
              height: '100%',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isActive(btn.to) ? '#185FA5' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* DESKTOP (>= 768px) : menu vertical + volet hover */}
      <div className="menu-desktop" style={{ display: 'none' }}>
        {/* Bande verticale slim */}
        <div
          style={{
            background: '#042C53',
            color: 'white',
            height: '100vh',
            width: '62px',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            paddingTop: '80px',
            paddingBottom: '16px',
            zIndex: 10000,
            paddingLeft: '10px',
            paddingRight: '10px'
          }}
          onMouseEnter={() => setShowLabels(true)}
          onMouseLeave={() => setShowLabels(false)}
        >
          {buttons.map((btn) => (
            <button
              key={btn.to}
              onClick={() => handleClick(btn.to)}
              style={{
                width: '100%',
                height: '48px',
                background: isActive(btn.to) ? '#185FA5' : '#1a3a52',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Volet de survol (labels) */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '62px',
            height: '100vh',
            background: '#042C53',
            color: 'white',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            paddingTop: '80px',
            paddingBottom: '16px',
            boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
            minWidth: '140px',
            transform: showLabels ? 'translateX(0)' : 'translateX(-140px)',
            transition: 'transform 0.3s ease-in-out',
            pointerEvents: showLabels ? 'auto' : 'none'
          }}
          onMouseEnter={() => setShowLabels(true)}
          onMouseLeave={() => setShowLabels(false)}
        >
          {buttons.map((btn) => (
            <button
              key={btn.to}
              onClick={() => handleClick(btn.to)}
              style={{
                height: '48px',
                background: isActive(btn.to) ? '#185FA5' : '#1a3a52',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '12px',
                fontWeight: 300,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
                color: navGrey,
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              title={btn.label}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Spacer pour éviter que le contenu se chevauche */}
        <div style={{ width: '62px' }} />
      </div>
    </>
  )
}