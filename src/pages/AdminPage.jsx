import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Wrench, CableCar, Layers, Users } from 'lucide-react'
import AdminPiecesManagement from '../components/Admin/AdminPiecesManagement'
import AdminProjectsManagement from '../components/Admin/AdminProjectsManagement'
import AdminSubAssembliesManagement from '../components/Admin/AdminSubAssembliesManagement'
import AdminUsersManagement from '../components/Admin/AdminUsersManagement'

export default function AdminPage() {
  const { user, role } = useAuth()
  const [activeTab, setActiveTab] = useState('pieces')

  // Vérifier que l'utilisateur est admin
  if (!role || role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#A32D2D', fontSize: '16px' }}>❌ Accès refusé - Admin seulement</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#042C53', marginBottom: '20px' }}>Administration</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #E6F1FB', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('pieces')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'pieces' ? '#185FA5' : '#E6F1FB',
            color: activeTab === 'pieces' ? 'white' : '#042C53',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Wrench size={18} />
          Pièces
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'projects' ? '#185FA5' : '#E6F1FB',
            color: activeTab === 'projects' ? 'white' : '#042C53',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CableCar size={18} />
          Projets
        </button>
        <button
          onClick={() => setActiveTab('subassemblies')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'subassemblies' ? '#185FA5' : '#E6F1FB',
            color: activeTab === 'subassemblies' ? 'white' : '#042C53',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={18} />
          Sous-ensembles
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'users' ? '#185FA5' : '#E6F1FB',
            color: activeTab === 'users' ? 'white' : '#042C53',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          Utilisateurs
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'pieces' && <AdminPiecesManagement />}
        {activeTab === 'projects' && <AdminProjectsManagement />}
        {activeTab === 'subassemblies' && <AdminSubAssembliesManagement />}
        {activeTab === 'users' && <AdminUsersManagement />}
      </div>
    </div>
  )
}