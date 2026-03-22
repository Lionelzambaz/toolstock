import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

export default function AdminProjectsManagement() {
  const { getProjects, createProject, updateProject, deleteProject, loading, error, success, clearMessages } = useAdmin()
  const [projects, setProjects] = useState([])
  const [searchText, setSearchText] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    numero_projet: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const data = await getProjects()
    setProjects(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()

    if (editingId) {
      await updateProject(editingId, formData)
      setEditingId(null)
    } else {
      await createProject(formData)
    }

    setFormData({ nom: '', numero_projet: '', description: '' })
    await loadProjects()
  }

  const handleEdit = (project) => {
    setFormData(project)
    setEditingId(project.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce projet?')) {
      await deleteProject(id)
      await loadProjects()
    }
  }

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project => {
    const search = searchText.toLowerCase()
    return (
      project.nom.toLowerCase().includes(search) ||
      project.numero_projet.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#042C53', margin: 0 }}>Gestion des Projets</h2>
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
          <input type="text" name="nom" placeholder="Nom du projet" value={formData.nom} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <input type="text" name="numero_projet" placeholder="N° Projet" value={formData.numero_projet} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px' }} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #185FA5', borderRadius: '4px', gridColumn: '1 / -1' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editingId ? 'Mettre à jour' : 'Créer'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ nom: '', numero_projet: '', description: '' }) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>}
      </form>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#042C53', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Nom</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>N° Projet</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #185FA5' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project, idx) => (
            <tr key={project.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{project.nom}</td>
              <td style={{ padding: '10px' }}>{project.numero_projet}</td>
              <td style={{ padding: '10px' }}>{project.description}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(project)} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                <button onClick={() => handleDelete(project.id)} style={{ padding: '5px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supp</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}