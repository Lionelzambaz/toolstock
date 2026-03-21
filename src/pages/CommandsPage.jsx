import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabaseClient'
import { generatePDF } from '../utils/pdfGenerator'
import { generateExcel } from '../utils/excelGenerator'

export default function CommandsPage() {
  const { user, userProfile } = useAuth()
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterCreator, setFilterCreator] = useState('')
  const [selectedCommand, setSelectedCommand] = useState(null)
  const [commandDetails, setCommandDetails] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchCommands()
    }
  }, [user?.id])

  async function fetchCommands() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('commands')
        .select(`
          *,
          projects(nom, numero_projet),
          users!user_id(nom),
          command_items(id)
        `)
      
      if (userProfile?.role === 'mechanic') {
        query = query.eq('user_id', user.id)
      }
      
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      setCommands(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCommandDetails(commandId) {
    try {
      const { data, error } = await supabase
        .from('command_items')
        .select(`
          *,
          pieces(numero_interne, denomination, fournisseur, numero_fournisseur)
        `)
        .eq('command_id', commandId)
      
      if (error) throw error
      setCommandDetails(data || [])
    } catch (err) {
      console.error(err)
    }
  }

async function handleViewCommand(command) {
  setSelectedCommand(command)
  fetchCommandDetails(command.id)
  
  // Récupérer le nom du supervisor si existe
  if (command.supervisor_id) {
    try {
      const { data } = await supabase
        .from('users')
        .select('nom')
        .eq('id', command.supervisor_id)
        .single()
      
      if (data) {
        command.supervisor_nom = data.nom
        setSelectedCommand({...command})
      }
    } catch (err) {
      console.error('Erreur supervisor:', err)
    }
  }
}

  function closeDetails() {
    setSelectedCommand(null)
    setCommandDetails(null)
  }

  async function handleDeleteCommand(commandId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
      try {
        const { error } = await supabase.from('commands').delete().eq('id', commandId)
        if (error) throw error
        await fetchCommands()
      } catch (err) {
        console.error('Erreur suppression:', err)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const filteredCommands = commands.filter(c => {
    const statusMatch = !filterStatus || c.status === filterStatus
    const projectMatch = !filterProject || c.projects?.nom === filterProject
    const creatorMatch = !filterCreator || c.users?.nom === filterCreator
    return statusMatch && projectMatch && creatorMatch
  })

  function getStatusColor(status) {
    const colors = {
      'draft': '#888780',
      'pending': '#BA7517',
      'validated': '#27500A',
      'rejected': '#A32D2D',
      'archived': '#185FA5'
    }
    return colors[status] || '#888780'
  }

  function getStatusLabel(status) {
    const labels = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'validated': 'Validée',
      'rejected': 'Refusée',
      'archived': 'Archivée'
    }
    return labels[status] || status
  }

  function calculateTotal(items) {
    return items.reduce((total, item) => total + (item.prix_unitaire * item.quantite), 0)
  }

  const uniqueProjects = [...new Set(commands.map(c => c.projects?.nom))].filter(Boolean).sort()

  const uniqueCreators = (userProfile?.role === 'supervisor' || userProfile?.role === 'admin')
    ? [...new Set(commands.map(c => c.users?.nom))].filter(Boolean).sort()
    : []

  async function handleExportExcel() {
    try {
      const commandsDetailsMap = {}
      
      for (const cmd of filteredCommands) {
        const { data, error } = await supabase
          .from('command_items')
          .select(`
            *,
            pieces(numero_interne, denomination, fournisseur, numero_fournisseur)
          `)
          .eq('command_id', cmd.id)
        
        if (error) throw error
        commandsDetailsMap[cmd.id] = data || []
      }
      
      generateExcel(filteredCommands, commandsDetailsMap, userProfile)
    } catch (err) {
      console.error('Erreur récupération détails:', err)
      alert('Erreur lors de la récupération des données: ' + err.message)
    }
  }

  return (
    <div>
<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
  <h2 style={styles.title}>Mes commandes</h2>
  {(userProfile?.role === 'supervisor' || userProfile?.role === 'admin') && (
    <button
      onClick={handleExportExcel}
      style={styles.excelBtn}
    >
      📊 Exporter en Excel
    </button>
  )}
</div>

      {error && <div style={styles.error}>Erreur: {error}</div>}

      <div style={styles.filtersContainer}>
        <div style={styles.filterBox}>
          <label style={styles.label}>Filtrer par statut</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="validated">Validée</option>
            <option value="rejected">Refusée</option>
            <option value="archived">Archivée</option>
          </select>
        </div>

        <div style={styles.filterBox}>
          <label style={styles.label}>Filtrer par projet</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            style={styles.select}
          >
            <option value="">Tous les projets</option>
            {uniqueProjects.map(projet => (
              <option key={projet} value={projet}>{projet}</option>
            ))}
          </select>
        </div>

        {(userProfile?.role === 'supervisor' || userProfile?.role === 'admin') && (
          <div style={styles.filterBox}>
            <label style={styles.label}>Filtrer par créateur</label>
            <select
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              style={styles.select}
            >
              <option value="">Tous les créateurs</option>
              {uniqueCreators.map(creator => (
                <option key={creator} value={creator}>{creator}</option>
              ))}
            </select>
          </div>
        )}

        <div style={styles.filterBox}>
          <label style={{...styles.label, visibility: 'hidden'}}>.</label>
          <button
            onClick={() => {
              setFilterStatus('')
              setFilterProject('')
              setFilterCreator('')
            }}
            style={styles.resetBtn}
          >
            ↻ Réinitialiser
          </button>
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredCommands.length === 0 ? (
        <p>Aucune commande trouvée</p>
      ) : (
        <div style={styles.commandsList}>
          {filteredCommands.map(command => (
            <div key={command.id} style={styles.commandCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>
                    Commande #{command.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p style={styles.cardDate}>
                    {new Date(command.created_at).toLocaleDateString('fr-CH')}
                  </p>
                  {(userProfile?.role === 'supervisor' || userProfile?.role === 'admin') && (
                    <p style={styles.cardCreator}>Créée par: {command.users?.nom || 'Inconnu'}</p>
                  )}
                </div>
                <div style={{...styles.statusBadge, backgroundColor: getStatusColor(command.status)}}>
                  {getStatusLabel(command.status)}
                </div>
              </div>

              <div style={styles.cardBody}>
                <p>
                  <strong>Projet :</strong> {command.projects?.nom || 'N/A'}
                </p>
                <p>
                  <strong>Nombre d'articles :</strong> {command.command_items?.length || 0}
                </p>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => handleViewCommand(command)}
                  style={{...styles.viewBtn, flex: 1}}
                >
                  Voir les détails
                </button>
                
                {(command.status === 'draft' || command.status === 'pending') && (
                  <button
                    onClick={() => handleDeleteCommand(command.id)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCommand && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Détails de la commande</h3>
              <button onClick={closeDetails} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <p><strong>Commande :</strong> #{selectedCommand.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Date :</strong> {new Date(selectedCommand.created_at).toLocaleDateString('fr-CH')}</p>
              <p><strong>Projet :</strong> {selectedCommand.projects?.nom}</p>
              <p>
                <strong>Statut :</strong> {getStatusLabel(selectedCommand.status)}
              </p>

              {/* Espacement */}
              <div style={{ marginBottom: '20px' }} />

              <p><strong>Créée par :</strong> {selectedCommand.users?.nom || 'Inconnu'}</p>

              {(selectedCommand.status === 'validated' || selectedCommand.status === 'rejected') && selectedCommand.supervisor_id && (
                <p>
                  <strong>{selectedCommand.status === 'validated' ? 'Validée par' : 'Refusée par'} :</strong> {selectedCommand.supervisor_nom || 'Inconnu'}
                </p>
              )}

              {/* Espacement après Validée/Refusée par */}
              {(selectedCommand.status === 'validated' || selectedCommand.status === 'rejected') && selectedCommand.supervisor_id && (
                <div style={{ marginBottom: '20px' }} />
              )}

              {selectedCommand.remarques && (
                <div style={styles.remarquesBox}>
                  <strong>📝 Remarques :</strong>
                  <p>{selectedCommand.remarques}</p>
                </div>
              )}

              {selectedCommand.supervisor_comments && (
                <div style={styles.comments}>
                  <strong>Commentaires du chef :</strong>
                  <p>{selectedCommand.supervisor_comments}</p>
                </div>
              )}

              <h4 style={styles.itemsTitle}>Pièces commandées</h4>
              {commandDetails && commandDetails.length > 0 ? (
                <div style={styles.itemsTable}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>N° Interne</th>
                        <th style={styles.th}>Dénomination</th>
                        <th style={styles.th}>Fournisseur</th>
                        <th style={styles.th}>Quantité</th>
                        <th style={styles.th}>Prix U</th>
                        <th style={styles.th}>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commandDetails.map((item, idx) => (
                        <tr key={item.id} style={{backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9'}}>
                          <td style={styles.td}>{item.pieces.numero_interne}</td>
                          <td style={styles.td}>{item.pieces.denomination}</td>
                          <td style={styles.td}>{item.pieces.fournisseur}</td>
                          <td style={styles.td}>{item.quantite}</td>
                          <td style={styles.td}>{item.prix_unitaire.toFixed(2)} CHF</td>
                          <td style={styles.td}><strong>{(item.prix_unitaire * item.quantite).toFixed(2)} CHF</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Aucun article</p>
              )}

              {commandDetails && (
                <div style={styles.total}>
                  <strong>Total : {calculateTotal(commandDetails).toFixed(2)} CHF</strong>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              {selectedCommand.status === 'validated' && (
                <button
                  onClick={() => generatePDF(selectedCommand, commandDetails, userProfile)}
                  style={styles.pdfBtn}
                >
                  📄 Exporter PDF
                </button>
              )}
              <button onClick={closeDetails} style={styles.closeModalBtn}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  title: {
    color: '#042C53',
    marginBottom: '20px'
  },
  error: {
    padding: '15px',
    backgroundColor: '#ffe0e0',
    color: '#A32D2D',
    borderRadius: '6px',
    marginBottom: '20px'
  },
  excelBtn: {
    padding: '10px 20px',
    backgroundColor: '#27500A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  filtersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#E6F1FB',
    borderRadius: '8px'
  },
  filterBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    fontSize: '12px',
    color: '#042C53'
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #185FA5',
    borderRadius: '4px',
    fontSize: '13px',
    boxSizing: 'border-box'
  },
  resetBtn: {
    padding: '8px 12px',
    backgroundColor: '#888780',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  commandsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  commandCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  cardTitle: {
    margin: '0 0 5px 0',
    color: '#042C53',
    fontSize: '16px'
  },
  cardDate: {
    margin: '0 0 5px 0',
    fontSize: '12px',
    color: '#888780'
  },
  cardCreator: {
    margin: 0,
    fontSize: '12px',
    color: '#333',
    fontStyle: 'italic'
  },
  statusBadge: {
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  cardBody: {
    marginBottom: '15px',
    fontSize: '14px'
  },
  cardFooter: {
    display: 'flex',
    gap: '10px'
  },
  viewBtn: {
    padding: '10px',
    backgroundColor: '#185FA5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteBtn: {
    padding: '10px 15px',
    backgroundColor: '#A32D2D',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    width: '90%'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #ddd'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#888780'
  },
  modalBody: {
    padding: '20px'
  },
  remarquesBox: {
    backgroundColor: '#E6F1FB',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '15px',
    marginBottom: '15px',
    borderLeft: '4px solid #185FA5'
  },
  comments: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '4px solid #BA7517'
  },
  itemsTitle: {
    marginTop: '20px',
    marginBottom: '15px',
    color: '#042C53'
  },
  itemsTable: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  tableHeader: {
    backgroundColor: '#185FA5',
    color: 'white'
  },
  th: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: '500'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee'
  },
  total: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#E6F1FB',
    borderRadius: '6px',
    textAlign: 'right',
    fontSize: '16px',
    color: '#185FA5'
  },
  modalFooter: {
    padding: '20px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  pdfBtn: {
    padding: '10px 20px',
    backgroundColor: '#185FA5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  closeModalBtn: {
    padding: '10px 20px',
    backgroundColor: '#888780',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
}