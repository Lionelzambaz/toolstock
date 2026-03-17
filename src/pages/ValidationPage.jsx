import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function ValidationPage() {
  const { userProfile } = useAuth()
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCommand, setSelectedCommand] = useState(null)
  const [commandDetails, setCommandDetails] = useState(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPendingCommands()
  }, [])

  async function fetchPendingCommands() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('commands')
        .select(`
          *,
          projects(nom, numero_projet)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      
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

  function handleSelectCommand(command) {
    setSelectedCommand(command)
    setComments('')
    fetchCommandDetails(command.id)
  }

  async function handleValidate() {
    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('commands')
        .update({
          status: 'validated',
          supervisor_id: userProfile.id,
          supervisor_comments: comments,
          validated_at: new Date().toISOString()
        })
        .eq('id', selectedCommand.id)
      
      if (error) throw error
      
      alert('✅ Commande validée !')
      setSelectedCommand(null)
      fetchPendingCommands()
    } catch (err) {
      alert('Erreur: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!comments.trim()) {
      alert('Veuillez ajouter un commentaire pour refuser')
      return
    }

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('commands')
        .update({
          status: 'rejected',
          supervisor_id: userProfile.id,
          supervisor_comments: comments
        })
        .eq('id', selectedCommand.id)
      
      if (error) throw error
      
      alert('✅ Commande refusée !')
      setSelectedCommand(null)
      fetchPendingCommands()
    } catch (err) {
      alert('Erreur: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function calculateTotal(items) {
    return items.reduce((total, item) => total + (item.prix_unitaire * item.quantite), 0)
  }

  // Vérification du rôle
  if (userProfile?.role !== 'supervisor' && userProfile?.role !== 'admin') {
    return (
      <div style={styles.accessDenied}>
        <h2>Accès refusé</h2>
        <p>Seul le chef de service et l'admin peuvent valider les commandes.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={styles.title}>Validation des commandes</h2>

      {error && <div style={styles.error}>Erreur: {error}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : commands.length === 0 ? (
        <div style={styles.noCommands}>
          <p>✅ Aucune commande en attente !</p>
        </div>
      ) : (
        <div style={styles.container}>
          {/* Liste des commandes en attente */}
          <div style={styles.listPanel}>
            <h3 style={styles.panelTitle}>Commandes en attente ({commands.length})</h3>
            <div style={styles.commandsList}>
              {commands.map(command => (
                <div 
                  key={command.id}
                  onClick={() => handleSelectCommand(command)}
                  style={{
                    ...styles.listItem,
                    backgroundColor: selectedCommand?.id === command.id ? '#E6F1FB' : 'white',
                    borderLeft: selectedCommand?.id === command.id ? '4px solid #185FA5' : '4px solid transparent'
                  }}
                >
                  <p style={styles.listItemTitle}>#{command.id.slice(0, 8).toUpperCase()}</p>
                  <p style={styles.listItemDate}>{new Date(command.created_at).toLocaleDateString('fr-CH')}</p>
                  <p style={styles.listItemProject}>{command.projects?.nom}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Détails de la commande sélectionnée */}
          {selectedCommand && (
            <div style={styles.detailPanel}>
              <h3 style={styles.panelTitle}>Détails de la commande</h3>

              <div style={styles.commandInfo}>
                <p><strong>Commande :</strong> #{selectedCommand.id.slice(0, 8).toUpperCase()}</p>
                <p><strong>Date :</strong> {new Date(selectedCommand.created_at).toLocaleDateString('fr-CH')}</p>
                <p><strong>Projet :</strong> {selectedCommand.projects?.nom}</p>
              </div>

              {commandDetails && commandDetails.length > 0 && (
                <div>
                  <h4 style={styles.itemsTitle}>Pièces commandées</h4>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>N° Interne</th>
                        <th style={styles.th}>Dénomination</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Prix U</th>
                        <th style={styles.th}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commandDetails.map((item, idx) => (
                        <tr key={item.id} style={{backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9'}}>
                          <td style={styles.td}>{item.pieces.numero_interne}</td>
                          <td style={styles.td}>{item.pieces.denomination}</td>
                          <td style={styles.td}>{item.quantite}</td>
                          <td style={styles.td}>{item.prix_unitaire.toFixed(2)} CHF</td>
                          <td style={styles.td}><strong>{(item.prix_unitaire * item.quantite).toFixed(2)} CHF</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={styles.total}>
                    Montant total : <strong>{calculateTotal(commandDetails).toFixed(2)} CHF</strong>
                  </div>
                </div>
              )}

              <div style={styles.commentsBox}>
                <label style={styles.label}>Commentaires (optionnel pour valider, obligatoire pour refuser)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Ajouter des commentaires..."
                  style={styles.textarea}
                  disabled={submitting}
                />
              </div>

              <div style={styles.actions}>
                <button
                  onClick={handleValidate}
                  style={styles.validateBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Traitement...' : '✅ Valider'}
                </button>
                <button
                  onClick={handleReject}
                  style={styles.rejectBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Traitement...' : '❌ Refuser'}
                </button>
              </div>
            </div>
          )}
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
  accessDenied: {
    backgroundColor: '#ffe0e0',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#A32D2D'
  },
  noCommands: {
    backgroundColor: '#e0ffe0',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#27500A'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px'
  },
  listPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    height: 'fit-content'
  },
  detailPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px'
  },
  panelTitle: {
    color: '#042C53',
    marginTop: 0,
    marginBottom: '15px',
    borderBottom: '2px solid #185FA5',
    paddingBottom: '10px'
  },
  commandsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  listItem: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  listItemTitle: {
    margin: '0 0 5px 0',
    fontWeight: 'bold',
    color: '#042C53'
  },
  listItemDate: {
    margin: '0 0 3px 0',
    fontSize: '12px',
    color: '#888780'
  },
  listItemProject: {
    margin: 0,
    fontSize: '12px',
    color: '#333'
  },
  commandInfo: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px'
  },
  itemsTitle: {
    color: '#042C53',
    marginTop: '20px',
    marginBottom: '10px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '15px'
  },
  tableHeader: {
    backgroundColor: '#185FA5',
    color: 'white'
  },
  th: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: '500',
    fontSize: '13px'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    fontSize: '13px'
  },
  total: {
    padding: '10px',
    backgroundColor: '#E6F1FB',
    borderRadius: '6px',
    textAlign: 'right',
    color: '#185FA5',
    fontWeight: '500'
  },
  commentsBox: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'inherit',
    fontSize: '14px',
    minHeight: '80px',
    boxSizing: 'border-box'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  validateBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27500A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  },
  rejectBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#A32D2D',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  }
}