import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

export default function AdminUsersManagement() {
  const { getUsers, updateUser, deleteUser, loading, error, success, clearMessages } = useAdmin()
  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingRole, setEditingRole] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const data = await getUsers()
    setUsers(data)
  }

  const handleEditRole = (user) => {
    setEditingId(user.id)
    setEditingRole(user.role)
  }

  const handleSaveRole = async (userId) => {
    clearMessages()
    await updateUser(userId, { role: editingRole })
    setEditingId(null)
    await loadUsers()
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet utilisateur?')) {
      clearMessages()
      await deleteUser(id)
      await loadUsers()
    }
  }

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => {
    const search = searchText.toLowerCase()
    return (
      user.email.toLowerCase().includes(search) ||
      user.nom.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#042C53', margin: 0 }}>Gestion des Utilisateurs</h2>
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

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#042C53', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Nom</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #185FA5' }}>Rôle</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #185FA5' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, idx) => (
            <tr key={user.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#E6F1FB', borderBottom: '1px solid #E6F1FB' }}>
              <td style={{ padding: '10px' }}>{user.email}</td>
              <td style={{ padding: '10px' }}>{user.nom}</td>
              <td style={{ padding: '10px' }}>
                {editingId === user.id ? (
                  <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} style={{ padding: '5px', border: '1px solid #185FA5', borderRadius: '4px' }}>
                    <option value="mechanic">Mécanicien</option>
                    <option value="supervisor">Chef de service</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span style={{ 
                    padding: '5px 10px', 
                    backgroundColor: user.role === 'admin' ? '#A32D2D' : user.role === 'supervisor' ? '#BA7517' : '#27500A',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {user.role === 'mechanic' ? '🔧 Mécanicien' : user.role === 'supervisor' ? '👨‍💼 Chef' : '⚙️ Admin'}
                  </span>
                )}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {editingId === user.id ? (
                  <>
                    <button onClick={() => handleSaveRole(user.id)} disabled={loading} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#27500A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#888780', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditRole(user)} style={{ padding: '5px 8px', marginRight: '5px', backgroundColor: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 8px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supp</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}