import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { supabase } from '../../utils/supabaseClient'

export default function AdminSubAssembliesManagement() {
  const { getSubAssemblies, getPieces, getProjects, createSubAssembly, updateSubAssembly, deleteSubAssembly, loading, error, success, clearMessages } = useAdmin()
  const [subAssemblies, setSubAssemblies] = useState([])
  const [pieces, setPieces] = useState([])
  const [projects, setProjects] = useState([])
  const [searchText, setSearchText] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [selectedPieces, setSelectedPieces] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [newPieceId, setNewPieceId] = useState('')
  const [newPieceQty, setNewPieceQty] = useState(1)
  const [newProjectId, setNewProjectId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const subAss = await getSubAssemblies()
    const p = await getPieces()
    const proj = await getProjects()
    setSubAssemblies(subAss)
    setPieces(p)
    setProjects(proj)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

    const handleAddPiece = () => {
        if (newPieceId && newPieceQty >= 0) {
          setSelectedPieces([...selectedPieces, { piece_id: newPieceId, quantite: parseInt(newPieceQty) }])
          setNewPieceId('')
          setNewPieceQty(1)
        }
      }

  const handleRemovePiece = (idx) => {
    setSelectedPieces(selectedPieces.filter((_, i) => i !== idx))
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
      await supabase.from('sub_assembly_pieces').delete().eq('sub_assembly_id', subAssId)
      
      for (const piece of selectedPieces) {
        await supabase.from('sub_assembly_pieces').insert({
          sub_assembly_id: subAssId,
          piece_id: piece.piece_id,
          quantite: piece.quantite
        })
      }
    }

    // Ajouter/mettre à jour les projets
    if (subAssId && selectedProjects.length > 0) {
      await supabase.from('project_sub_assembly').delete().eq('sub_assembly_id', subAssId)
      
      for (const projectId of selectedProjects) {
        await supabase.from('project_sub_assembly').insert({
          sub_assembly_id: subAssId,
          project_id: projectId
        })
      }
    }

    setFormData({ nom: '', description: '' })
    setSelectedPieces([])
    setSelectedProjects([])
    setEditingId(null)
    await loadData()
  }

  const handleEdit = async (subAssembly) => {
    setFormData({ nom: subAssembly.nom, description: subAssembly.description })
    setEditingId(subAssembly.id)
    
    // Charger les pièces de ce sous-ensemble
    const { data: piecesData } = await supabase
      .from('sub_assembly_pieces')
      .select('*')
      .eq('sub_assembly_id', subAssembly.id)
    
    setSelectedPieces(piecesData || [])

    // Charger les projets de ce sous-ensemble
    const { data: projectsData } = await supabase
      .from('project_sub_assembly')
      .select('project_id')
      .eq('sub_assembly_id', subAssembly.id)
    
    setSelectedProjects(projectsData?.map(p => p.project_id) || [])
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce sous-ensemble?')) {
      await deleteSubAssembly(id)
      await loadData()
    }
  }

  // Filtrer les sous-ensembles selon la recherche
  const filteredSubAssemblies = subAssemblies.filter(sub => {
    const search = searchText.toLowerCase()
    return sub.nom.toLowerCase().includes(search)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#042C53', margin: 0 }}>Gestion des Sous-ensembles</h2>
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #185FA5',
            borderRadius: '4px',
            fontSize: '13px',
            width: '250px'
          }}
        />
      </div>

      {error && <p style={{ color: '#A32D2D' }}>❌ {error}</p>}
      {success && <p style={{ color: '#27500A' }}>✅ {success}</p>}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#E6F1FB', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input type="text" name="nom" placeholder="Nom du sous-ensemble" value={formData.nom} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px', gridColumn: '1 / -1' }} />
        </div>

{/* Ajouter des pièces */}
        <h4 style={{ color: '#042C53', marginTop: '15px' }}>Pièces du sous-ensemble</h4>
        <p style={{ fontSize: '13px', color: '#888780', marginTop: '0', marginBottom: '10px' }}>
          💡 <strong>Quantité 0 = Pièce optionnelle:</strong> Elle n'est pas ajoutée au panier quand on commande ce sous-ensemble, mais reste visible dans le catalogue.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <select value={newPieceId} onChange={(e) => setNewPieceId(e.target.value)} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }}>
            <option value="">Sélectionner une pièce</option>
            {pieces.map(p => (
              <option key={p.id} value={p.id}>{p.denomination} ({p.numero_interne})</option>
            ))}
          </select>
          <input type="number" value={newPieceQty} onChange={(e) => setNewPieceQty(e.target.value)} min="0" style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <button type="button" onClick={handleAddPiece} style={{ padding: '8px 15px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➕ Ajouter</button>
        </div>

        {/* Pièces sélectionnées */}
        {selectedPieces.length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h5>Pièces sélectionnées:</h5>
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

        {/* Ajouter des projets */}
        <h4 style={{ color: '#042C53', marginTop: '15px' }}>Projets utilisant ce sous-ensemble</h4>
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
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ nom: '', description: '' }); setSelectedPieces([]); setSelectedProjects([]) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
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
          {filteredSubAssemblies.map((sub, idx) => (
            <tr key={sub.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{sub.nom}</td>
              <td style={{ padding: '10px' }}>{sub.description}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(sub)} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                <button onClick={() => handleDelete(sub.id)} style={{ padding: '5px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supp</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}