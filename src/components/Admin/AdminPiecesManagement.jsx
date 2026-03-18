import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

export default function AdminPiecesManagement() {
  const { getPieces, createPiece, updatePiece, deletePiece, loading, error, success, clearMessages } = useAdmin()
  const [pieces, setPieces] = useState([])
  const [formData, setFormData] = useState({
    numero_fournisseur: '',
    numero_interne: '',
    fournisseur: '',
    denomination: '',
    descriptif: '',
    prix_unitaire: ''
  })
  const [editingId, setEditingId] = useState(null)

  // Charger les pièces au montage
  useEffect(() => {
    loadPieces()
  }, [])

  const loadPieces = async () => {
    const data = await getPieces()
    setPieces(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix_unitaire' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()

    if (editingId) {
      await updatePiece(editingId, formData)
      setEditingId(null)
    } else {
      await createPiece(formData)
    }

    setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '' })
    await loadPieces()
  }

  const handleEdit = (piece) => {
    setFormData(piece)
    setEditingId(piece.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette pièce?')) {
      await deletePiece(id)
      await loadPieces()
    }
  }

  return (
    <div>
      <h2 style={{ color: '#042C53' }}>Gestion des Pièces</h2>

      {error && <p style={{ color: '#A32D2D' }}>❌ {error}</p>}
      {success && <p style={{ color: '#27500A' }}>✅ {success}</p>}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#E6F1FB', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input type="text" name="numero_fournisseur" placeholder="N° Fournisseur" value={formData.numero_fournisseur} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="numero_interne" placeholder="N° Interne" value={formData.numero_interne} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="fournisseur" placeholder="Fournisseur" value={formData.fournisseur} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="denomination" placeholder="Dénomination" value={formData.denomination} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="number" name="prix_unitaire" placeholder="Prix unitaire (CHF)" value={formData.prix_unitaire} onChange={handleInputChange} step="0.01" required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <textarea name="descriptif" placeholder="Descriptif" value={formData.descriptif} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px', gridColumn: '1 / -1' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editingId ? 'Mettre à jour' : 'Créer'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '' }) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
      </form>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#042C53', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>N° Interne</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Dénomination</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Fournisseur</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Prix</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #185FA5' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((piece, idx) => (
            <tr key={piece.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{piece.numero_interne}</td>
              <td style={{ padding: '10px' }}>{piece.denomination}</td>
              <td style={{ padding: '10px' }}>{piece.fournisseur}</td>
              <td style={{ padding: '10px' }}>{piece.prix_unitaire} CHF</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(piece)} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️ Éditer</button>
                <button onClick={() => handleDelete(piece.id)} style={{ padding: '5px 10px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}