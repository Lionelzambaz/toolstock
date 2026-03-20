import React from 'react'
import { useCart } from '../../hooks/useCart'

export default function PieceCard({ piece, onViewDetails, onAddToCart }) {
  const { addToCart } = useCart()
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768)
  const [quantity, setQuantity] = React.useState(1)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

const handleAddToCart = () => {
  console.log('handleAddToCart appelé avec:', piece, quantity, onAddToCart)
  if (onAddToCart) {
    onAddToCart(piece, quantity)
    setQuantity(1)
  } else {
    console.log('onAddToCart est undefined!')
  }
}

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '15px',
      border: '1px solid #E6F1FB',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
      gap: '15px',
      alignItems: 'start'
    }}
    onMouseEnter={(e) => !isMobile && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)')}
    onMouseLeave={(e) => !isMobile && (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)')}
    >
      {/* PARTIE GAUCHE - Infos principales */}
      <div>
        <div style={{ marginBottom: '8px' }}>
          <p style={{ color: '#888780', fontSize: '12px', margin: '0 0 3px 0' }}>N° Interne</p>
          <h3 style={{ color: '#042C53', margin: '0', fontSize: '18px', fontWeight: 'bold' }}>
            {piece.numero_interne}
          </h3>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <p style={{ color: '#333', fontSize: '15px', margin: '0', fontWeight: '500', lineHeight: '1.3' }}>
            {piece.denomination}
          </p>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <p style={{ color: '#888780', fontSize: '13px', margin: '0' }}>
            {piece.fournisseur}
          </p>
        </div>

        {/* Description courte */}
        {piece.descriptif && (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ 
              color: '#666', 
              fontSize: '12px', 
              margin: '0', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4'
            }}>
              {piece.descriptif}
            </p>
          </div>
        )}
      </div>

      {/* PARTIE DROITE - Prix et Actions (Desktop) */}
      {!isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* N° Fournisseur et Prix */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#888780', fontSize: '11px', margin: '0 0 2px 0' }}>N° Fournisseur</p>
            <p style={{ color: '#042C53', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              {piece.numero_fournisseur}
            </p>
            <p style={{ color: '#27500A', fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              {piece.prix_unitaire} CHF
            </p>
          </div>

          {/* Quantité */}
          <div>
            <label style={{ display: 'block', color: '#888780', fontSize: '11px', margin: '0 0 5px 0', fontWeight: '500' }}>Quantité</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '7px 8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '7px 10px',
                backgroundColor: '#27500A',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                whiteSpace: 'nowrap'
              }}
            >
              ➕ Panier
            </button>
            <button
              onClick={() => onViewDetails(piece)}
              style={{
                flex: 1,
                padding: '7px 10px',
                backgroundColor: '#185FA5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                whiteSpace: 'nowrap'
              }}
            >
              👁️ Détails
            </button>
          </div>
        </div>
      )}

      {/* PARTIE DROITE - Prix et Actions (Mobile) */}
      {isMobile && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px',
          borderTop: '1px solid #E6F1FB',
          paddingTop: '10px'
        }}>
          <div>
            <p style={{ color: '#888780', fontSize: '11px', margin: '0 0 3px 0' }}>N° Fournisseur</p>
            <p style={{ color: '#042C53', fontSize: '13px', fontWeight: 'bold', margin: '0' }}>
              {piece.numero_fournisseur}
            </p>
          </div>

          <div>
            <p style={{ color: '#888780', fontSize: '11px', margin: '0 0 3px 0' }}>Prix</p>
            <p style={{ color: '#27500A', fontSize: '15px', fontWeight: 'bold', margin: '0' }}>
              {piece.prix_unitaire} CHF
            </p>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', color: '#888780', fontSize: '11px', margin: '0 0 5px 0', fontWeight: '500' }}>Quantité</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '7px 8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box',
                marginBottom: '10px'
              }}
            />
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              gridColumn: '1 / -1',
              padding: '7px',
              backgroundColor: '#27500A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            ➕ Ajouter au panier
          </button>

          <button
            onClick={() => onViewDetails(piece)}
            style={{
              gridColumn: '1 / -1',
              padding: '7px',
              backgroundColor: '#185FA5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            👁️ Voir détails
          </button>
        </div>
      )}
    </div>
  )
}