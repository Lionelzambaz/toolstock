import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { supabase } from '../../utils/supabaseClient'

export default function AdminPiecesManagement() {
  const { getPieces, getProjects, getSubAssemblies, createPiece, updatePiece, deletePiece, getProjectsForPiece, assignPieceToProject, removePieceFromProject, loading, error, success, clearMessages } = useAdmin()
  const [pieces, setPieces] = useState([])
  const [projects, setProjects] = useState([])
  const [subAssemblies, setSubAssemblies] = useState([])
  const [searchText, setSearchText] = useState('')
  const [formData, setFormData] = useState({
      numero_fournisseur: '',
      numero_interne: '',
      fournisseur: '',
      denomination: '',
      descriptif: '',
      prix_unitaire: '',
      numero_dessin: '',
      position_dessin: ''
    })
  const [editingId, setEditingId] = useState(null)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedSubAssemblies, setSelectedSubAssemblies] = useState([])
  const [newProjectId, setNewProjectId] = useState('')
  const [newSubAssemblyId, setNewSubAssemblyId] = useState('')
  const [newSubAssemblyQty, setNewSubAssemblyQty] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const p = await getPieces()
    const proj = await getProjects()
    const subAss = await getSubAssemblies()
    setPieces(p)
    setProjects(proj)
    setSubAssemblies(subAss)
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

    setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '', numero_dessin: '', position_dessin: '' })
    setSelectedProjects([])
    setSelectedSubAssemblies([])
    await loadData()
  }

  const handleEdit = async (piece) => {
    setFormData(piece)
    setEditingId(piece.id)
    const projForPiece = await getProjectsForPiece(piece.id)
    setSelectedProjects(projForPiece.map(p => p.projects.id))
    
    // Récupérer les sous-ensembles
    const { data: subAssData } = await supabase
      .from('sub_assembly_pieces')
      .select('sub_assembly_id, quantite')
      .eq('piece_id', piece.id)
    setSelectedSubAssemblies(subAssData || [])
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette pièce?')) {
      await deletePiece(id)
      await loadData()
    }
  }

  const handleAddProject = async (pieceId) => {
    if (newProjectId) {
      await assignPieceToProject(pieceId, newProjectId)
      setNewProjectId('')
      const projForPiece = await getProjectsForPiece(pieceId)
      setSelectedProjects(projForPiece.map(p => p.projects.id))
    }
  }

  const handleRemoveProject = async (pieceId, projectId) => {
    await removePieceFromProject(pieceId, projectId)
    const projForPiece = await getProjectsForPiece(pieceId)
    setSelectedProjects(projForPiece.map(p => p.projects.id))
  }

  const handleAddSubAssembly = async (pieceId) => {
    if (newSubAssemblyId && newSubAssemblyQty > 0) {
      await supabase.from('sub_assembly_pieces').insert({
        piece_id: pieceId,
        sub_assembly_id: newSubAssemblyId,
        quantite: parseInt(newSubAssemblyQty)
      })
      setNewSubAssemblyId('')
      setNewSubAssemblyQty(1)
      const { data: subAssData } = await supabase
        .from('sub_assembly_pieces')
        .select('sub_assembly_id, quantite')
        .eq('piece_id', pieceId)
      setSelectedSubAssemblies(subAssData || [])
    }
  }

  const handleRemoveSubAssembly = async (pieceId, subAssemblyId) => {
    await supabase.from('sub_assembly_pieces').delete().eq('piece_id', pieceId).eq('sub_assembly_id', subAssemblyId)
    const { data: subAssData } = await supabase
      .from('sub_assembly_pieces')
      .select('sub_assembly_id, quantite')
      .eq('piece_id', pieceId)
    setSelectedSubAssemblies(subAssData || [])
  }

  // Filtrer les pièces selon la recherche
  const filteredPieces = pieces.filter(piece => {
    const search = searchText.toLowerCase()
    return (
      piece.denomination.toLowerCase().includes(search) ||
      piece.numero_interne.toLowerCase().includes(search) ||
      piece.numero_fournisseur.toLowerCase().includes(search) ||
      piece.fournisseur.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#042C53', margin: 0 }}>Gestion des Pièces</h2>
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
          <input type="text" name="numero_fournisseur" placeholder="N° Fournisseur" value={formData.numero_fournisseur} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="numero_interne" placeholder="N° Interne" value={formData.numero_interne} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="fournisseur" placeholder="Fournisseur" value={formData.fournisseur} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="denomination" placeholder="Dénomination" value={formData.denomination} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="number" name="prix_unitaire" placeholder="Prix unitaire (CHF)" value={formData.prix_unitaire} onChange={handleInputChange} step="0.01" required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="numero_dessin" placeholder="N° Dessin" value={formData.numero_dessin} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="position_dessin" placeholder="Position sur dessin" value={formData.position_dessin} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <textarea name="descriptif" placeholder="Descriptif" value={formData.descriptif} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px', gridColumn: '1 / -1' }} />
        </div>

        {/* Projets */}
        <h4 style={{ color: '#042C53', marginTop: '15px' }}>Projets utilisant cette pièce</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }}>
            <option value="">Sélectionner un projet</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <button type="button" onClick={() => editingId && handleAddProject(editingId)} disabled={!editingId || !newProjectId} style={{ padding: '8px 15px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>➕ Ajouter</button>
        </div>

        {selectedProjects.length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h5>Projets sélectionnés:</h5>
            {selectedProjects.map((projId) => {
              const proj = projects.find(p => p.id === projId)
              return (
                <div key={projId} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#D4E5F7', padding: '3px 5px', borderRadius: '3px', marginBottom: '2px' }}>
                  <span>{proj?.nom}</span>
                  <button type="button" onClick={() => editingId && handleRemoveProject(editingId, projId)} style={{ padding: '0px 4px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Sous-ensembles */}
        <h4 style={{ color: '#042C53', marginTop: '15px' }}>Sous-ensembles utilisant cette pièce</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <select value={newSubAssemblyId} onChange={(e) => setNewSubAssemblyId(e.target.value)} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }}>
            <option value="">Sélectionner un sous-ensemble</option>
            {subAssemblies.map(s => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
          <input type="number" value={newSubAssemblyQty} onChange={(e) => setNewSubAssemblyQty(e.target.value)} min="1" style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <button type="button" onClick={() => editingId && handleAddSubAssembly(editingId)} disabled={!editingId || !newSubAssemblyId} style={{ padding: '8px 15px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>➕ Ajouter</button>
        </div>

        {selectedSubAssemblies.length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h5>Sous-ensembles sélectionnés:</h5>
            {selectedSubAssemblies.map((subAssItem) => {
              const subAss = subAssemblies.find(s => s.id === subAssItem.sub_assembly_id)
              return (
                <div key={subAssItem.sub_assembly_id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#D4E5F7', padding: '3px 5px', borderRadius: '3px', marginBottom: '2px' }}>
                  <span>{subAss?.nom} (× {subAssItem.quantite})</span>
                  <button type="button" onClick={() => editingId && handleRemoveSubAssembly(editingId, subAssItem.sub_assembly_id)} style={{ padding: '0px 4px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editingId ? 'Mettre à jour' : 'Créer'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ numero_fournisseur: '', numero_interne: '', fournisseur: '', denomination: '', descriptif: '', prix_unitaire: '', numero_dessin: '', position_dessin: '' }); setSelectedProjects([]); setSelectedSubAssemblies([]) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
      </form>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#042C53', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>N° Interne</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Dénomination</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>N° Fournisseur</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Fournisseur</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>N° Dessin</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Position</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Prix</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #185FA5' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPieces.map((piece, idx) => (
            <tr key={piece.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{piece.numero_interne}</td>
              <td style={{ padding: '10px' }}>{piece.denomination}</td>
              <td style={{ padding: '10px' }}>{piece.numero_fournisseur}</td>
              <td style={{ padding: '10px' }}>{piece.fournisseur}</td>
              <td style={{ padding: '10px' }}>{piece.numero_dessin || '-'}</td>
              <td style={{ padding: '10px' }}>{piece.position_dessin || '-'}</td>
              <td style={{ padding: '10px' }}>{piece.prix_unitaire} CHF</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(piece)} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                <button onClick={() => handleDelete(piece.id)} style={{ padding: '5px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supp</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}