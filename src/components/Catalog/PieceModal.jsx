import { useState, useEffect } from 'react'
import { useCatalog } from '../../hooks/useCatalog'

export default function PieceModal({ piece, isOpen, onClose, onAddToCart }) {
  const { getProjectsForPiece, getSubAssembliesForPiece } = useCatalog()
  const [projects, setProjects] = useState([])
  const [subAssemblies, setSubAssemblies] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && piece) {
      loadData()
    }
  }, [isOpen, piece])

  const loadData = async () => {
    setLoading(true)
    const proj = await getProjectsForPiece(piece.id)
    const subAsses = await getSubAssembliesForPiece(piece.id)
    setProjects(proj)
    setSubAssemblies(subAsses)
    setLoading(false)
  }

  if (!isOpen || !piece) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#042C53', margin: '0 0 10px 0' }}>{piece.denomination}</h2>
            <p style={{ color: '#888780', margin: '0' }}>N° Interne: <strong>{piece.numero_interne}</strong></p>
          </div>
          <button onClick={onClose} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#E6F1FB', borderRadius: '6px' }}>
          <h4 style={{ color: '#042C53', marginTop: '0' }}>Description</h4>
          <p style={{ color: '#333', lineHeight: '1.6' }}>{piece.descriptif || 'Aucune description'}</p>
        </div>

        {/* Infos pièce */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '6px' }}>
            <p style={{ color: '#888780', fontSize: '12px', margin: '0 0 5px 0' }}>N° Fournisseur</p>
            <p style={{ color: '#042C53', fontWeight: 'bold', margin: '0' }}>{piece.numero_fournisseur}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '6px' }}>
            <p style={{ color: '#888780', fontSize: '12px', margin: '0 0 5px 0' }}>Fournisseur</p>
            <p style={{ color: '#042C53', fontWeight: 'bold', margin: '0' }}>{piece.fournisseur}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '6px' }}>
            <p style={{ color: '#888780', fontSize: '12px', margin: '0 0 5px 0' }}>Prix unitaire</p>
            <p style={{ color: '#27500A', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>{piece.prix_unitaire} CHF</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '6px' }}>
            <p style={{ color: '#888780', fontSize: '12px', margin: '0 0 5px 0' }}>Quantité</p>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" style={{ width: '100%', padding: '5px', border: '1px solid #185FA5', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold' }} />
          </div>
        </div>

        {/* Projets */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#F0F8FF', borderRadius: '6px' }}>
            <h4 style={{ color: '#042C53', marginTop: '0', marginBottom: '10px' }}>🏢 Projets liés</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projects.map(proj => (
                <div key={proj.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #E6F1FB' }}>
                  <span style={{ color: '#042C53', fontWeight: '500' }}>{proj.nom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sous-ensembles */}
        {subAssemblies.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#F0F8FF', borderRadius: '6px' }}>
            <h4 style={{ color: '#042C53', marginTop: '0', marginBottom: '10px' }}>🔩 Sous-ensembles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subAssemblies.map(subAsses => (
                <div key={subAsses.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #E6F1FB' }}>
                  <span style={{ color: '#042C53', fontWeight: '500' }}>{subAsses.nom}</span>
                  <span style={{ color: '#888780', fontSize: '13px' }}>× {subAsses.quantite}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => onAddToCart(piece, quantity)} disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            ➕ Ajouter au panier ({quantity})
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}