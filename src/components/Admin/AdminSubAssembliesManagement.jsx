import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { supabase } from '../../utils/supabaseClient'

export default function AdminSubAssembliesManagement() {
  const { getSubAssemblies, createSubAssembly, updateSubAssembly, deleteSubAssembly, getPieces, loading, error, success, clearMessages } = useAdmin()
  const [subAssemblies, setSubAssemblies] = useState([])
  const [pieces, setPieces] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [selectedPieces, setSelectedPieces] = useState([])
  const [newPieceId, setNewPieceId] = useState('')
  const [newPieceQty, setNewPieceQty] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const subAss = await getSubAssemblies()
    const p = await getPieces()
    setSubAssemblies(subAss)
    setPieces(p)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPiece = () => {
    if (newPieceId && newPieceQty > 0) {
      setSelectedPieces([...selectedPieces, { piece_id: newPieceId, quantite: parseInt(newPieceQty) }])
      setNewPieceId('')
      setNewPieceQty(1)
    }
  }

  const handleRemovePiece = (idx) => {
    setSelectedPieces(selectedPieces.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()

    let subAssId = editingId
    if (!editingId) {
      const result = await createSubAssembly(formData)
      if (result.success) subAssId = result.data.id
    } else {
      await updateSubAssembly(editingId, formData)
    }

    // Ajouter/mettre à jour les pièces
    if (subAssId && selectedPieces.length > 0) {
      // Supprimer les anciennes relations
      await supabase.from('sub_assembly_pieces').delete().eq('sub_assembly_id', subAssId)
      
      // Ajouter les nouvelles
      for (const piece of selectedPieces) {
        await supabase.from('sub_assembly_pieces').insert({
          sub_assembly_id: subAssId,
          piece_id: piece.piece_id,
          quantite: piece.quantite
        })
      }
    }

    setFormData({ nom: '', description: '' })
    setSelectedPieces([])
    setEditingId(null)
    await loadData()
  }

  const handleEdit = async (subAssembly) => {
    setFormData({ nom: subAssembly.nom, description: subAssembly.description })
    setEditingId(subAssembly.id)
    
    // Charger les pièces de ce sous-ensemble
    const { data } = await supabase
      .from('sub_assembly_pieces')
      .select('*')
      .eq('sub_assembly_id', subAssembly.id)
    
    setSelectedPieces(data || [])
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce sous-ensemble?')) {
      await deleteSubAssembly(id)
      await loadData()
    }
  }

  return (
    <div>
      <h2 style={{ color: '#042C53' }}>Gestion des Sous-ensembles</h2>

      {error && <p style={{ color: '#A32D2D' }}>❌ {error}</p>}
      {success && <p style={{ color: '#27500A' }}>✅ {success}</p>}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#E6F1FB', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input type="text" name="nom" placeholder="Nom du sous-ensemble" value={formData.nom} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px', gridColumn: '1 / -1' }} />
        </div>

        {/* Ajouter des pièces */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <select value={newPieceId} onChange={(e) => setNewPieceId(e.target.value)} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }}>
            <option value="">Sélectionner une pièce</option>
            {pieces.map(p => (
              <option key={p.id} value={p.id}>{p.denomination} ({p.numero_interne})</option>
            ))}
          </select>
          <input type="number" value={newPieceQty} onChange={(e) => setNewPieceQty(e.target.value)} min="1" style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <button type="button" onClick={handleAddPiece} style={{ padding: '8px 15px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➕ Ajouter</button>
        </div>

        {/* Pièces sélectionnées */}
        {selectedPieces.length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h4>Pièces sélectionnées:</h4>
            {selectedPieces.map((sp, idx) => {
              const piece = pieces.find(p => p.id === sp.piece_id)
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', padding: '5px', backgroundColor: '#E6F1FB', borderRadius: '4px' }}>
                  <span>{piece?.denomination} × {sp.quantite}</span>
                  <button type="button" onClick={() => handleRemovePiece(idx)} style={{ padding: '3px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                </div>
              )
            })}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editingId ? 'Mettre à jour' : 'Créer'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ nom: '', description: '' }); setSelectedPieces([]) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
      </form>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#042C53', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Nom</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #185FA5' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subAssemblies.map((sub, idx) => (
            <tr key={sub.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{sub.nom}</td>
              <td style={{ padding: '10px' }}>{sub.description}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(sub)} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️ Éditer</button>
                <button onClick={() => handleDelete(sub.id)} style={{ padding: '5px 10px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}