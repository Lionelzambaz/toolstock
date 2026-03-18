import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { supabase } from '../../utils/supabaseClient'

export default function AdminPiecesManagement() {
  const { getPieces, getProjects, createPiece, updatePiece, deletePiece, getProjectsForPiece, assignPieceToProject, removePieceFromProject, loading, error, success, clearMessages } = useAdmin()
  const [pieces, setPieces] = useState([])
  const [projects, setProjects] = useState([])
  const [formData, setFormData] = useState({
    numero_fournisseur: '',
    numero_interne: '',
    fournisseur: '',
    denomination: '',
    descriptif: '',
    prix_unitaire: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [newProjectId, setNewProjectId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const p = await getPieces()
    const proj = await getProjects()
    setPieces(p)
    setProjects(proj)
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

    let pieceId = editingId
    if (!editingId) {
      const result = await createPiece(formData)
      if (result.success) pieceId = result.data.id
    } else {
      await updatePiece(editingId, formData)
    }

    // Ajouter/mettre à jour les projets
    if (pieceId && selectedProjects.length > 0) {
      await supabase.from('project_pieces').delete().eq('piece_id', pieceId)
      
      for (const projectId of selectedProjects) {
        await supabase.from('project_pieces').insert({
          piece_id: pieceId,
          project_id: projectId
        })
      }
    }

    setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '' })
    setSelectedProjects([])
    setEditingId(null)
    await loadData()
  }

  const handleEdit = async (piece) => {
    setFormData(piece)
    setEditingId(piece.id)
    
    const projForPiece = await getProjectsForPiece(piece.id)
    setSelectedProjects(projForPiece.map(p => p.projects.id))
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette pièce?')) {
      await deletePiece(id)
      await loadData()
    }
  }

  const handleAddProject = () => {
    if (newProjectId && !selectedProjects.includes(newProjectId)) {
      setSelectedProjects([...selectedProjects, newProjectId])
      setNewProjectId('')
    }
  }

  const handleRemoveProject = (projectId) => {
    setSelectedProjects(selectedProjects.filter(p => p !== projectId))
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

        {/* Ajouter des projets */}
        <h4 style={{ color: '#042C53', marginTop: '15px' }}>Projets utilisant cette pièce</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }}>
            <option value="">Sélectionner un projet</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <button type="button" onClick={handleAddProject} style={{ padding: '8px 15px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➕ Ajouter</button>
        </div>

        {/* Projets sélectionnés */}
        {selectedProjects.length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h5>Projets sélectionnés:</h5>
            {selectedProjects.map((projectId) => {
              const project = projects.find(p => p.id === projectId)
              return (
                <div key={projectId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', padding: '5px', backgroundColor: '#E6F1FB', borderRadius: '4px' }}>
                  <span>{project?.nom}</span>
                  <button type="button" onClick={() => handleRemoveProject(projectId)} style={{ padding: '3px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                </div>
              )
            })}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editingId ? 'Mettre à jour' : 'Créer'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '' }); setSelectedProjects([]) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
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