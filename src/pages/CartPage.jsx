import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function CartPage() {
  const { cartItems, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [projectId, setProjectId] = useState('')
  const [remarques, setRemarques] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [projects_loading, setProjectsLoading] = useState(true)

  // Charger les projets
  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('nom', { ascending: true })
      
      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setProjectsLoading(false)
    }
  }

  async function handleSubmitCommand() {
    if (!projectId) {
      setError('Veuillez sélectionner un projet')
      return
    }

    if (cartItems.length === 0) {
      setError('Le panier est vide')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Créer la commande
      const { data: command, error: cmdError } = await supabase
        .from('commands')
        .insert({
          user_id: user.id,
          project_id: projectId,
          status: 'pending',
          remarques: remarques || null
        })
        .select()
        .single()

      if (cmdError) throw cmdError

      // Ajouter les items à la commande
      const items = cartItems.map(item => ({
        command_id: command.id,
        piece_id: item.id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire
      }))

      const { error: itemsError } = await supabase
        .from('command_items')
        .insert(items)

      if (itemsError) throw itemsError

      // Vider le panier et rediriger
      clearCart()
      setRemarques('')
      alert('Commande créée avec succès !')
      navigate('/commands')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Panier</h2>

      {error && <div style={styles.error}>{error}</div>}

      {cartItems.length === 0 ? (
        <div style={styles.emptyCart}>
          <p>Votre panier est vide</p>
          <button 
            onClick={() => navigate('/catalog')}
            style={styles.continueBtn}
          >
            Continuer les achats
          </button>
        </div>
      ) : (
        <>
          {/* Tableau du panier */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>N° Interne</th>
                  <th style={styles.th}>Dénomination</th>
                  {!isMobile && <th style={styles.th}>N° Fournisseur</th>}
                  {!isMobile && <th style={styles.th}>Fournisseur</th>}
                  {!isMobile && <th style={styles.th}>N° Dessin</th>}
                  {!isMobile && <th style={styles.th}>Position</th>}
                  <th style={styles.th}>Prix U</th>
                  <th style={styles.th}>Qté</th>
                  {!isMobile && <th style={styles.th}>Sous-total</th>}
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={item.id} style={{...styles.row, backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9'}}>
                    <td style={styles.td}>{item.numero_interne}</td>
                    <td style={styles.td}>{item.denomination}</td>
                    {!isMobile && <td style={styles.td}>{item.numero_fournisseur}</td>}
                    {!isMobile && <td style={styles.td}>{item.fournisseur}</td>}
                    {!isMobile && <td style={styles.td}>{item.numero_dessin || '-'}</td>}
                    {!isMobile && <td style={styles.td}>{item.position_dessin || '-'}</td>}
                    <td style={styles.td}>{item.prix_unitaire.toFixed(2)} CHF</td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantite}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        style={styles.qtyInput}
                      />
                    </td>
                    {!isMobile && <td style={styles.td}>
                      <strong>{(item.prix_unitaire * item.quantite).toFixed(2)} CHF</strong>
                    </td>}
                    <td style={styles.td}>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={styles.removeBtn}
                      >
                        {isMobile ? '✕' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Résumé */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Nombre d'articles :</span>
              <strong>{getTotalItems()}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Montant total :</span>
              <strong style={styles.totalPrice}>{getTotalPrice().toFixed(2)} CHF</strong>
            </div>
          </div>

          {/* Sélection du projet et submission */}
          <div style={styles.checkoutBox}>
            <div style={styles.projectSelection}>
              <label style={styles.label}>Projet</label>
              {projects_loading ? (
                <p>Chargement des projets...</p>
              ) : (
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                >
                  <option value="">-- Sélectionner un projet --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.numero_projet})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Remarques */}
            <div style={styles.remarquesBox}>
              <label style={styles.label}>📝 Remarques (optionnel)</label>
              <textarea
                value={remarques}
                onChange={(e) => setRemarques(e.target.value)}
                placeholder="Ajouter une remarque pour cette commande..."
                style={styles.textarea}
                disabled={loading}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => navigate('/catalog')}
                style={styles.continueBtn}
                disabled={loading}
              >
                Continuer
              </button>
              <button
                onClick={handleSubmitCommand}
                style={styles.submitBtn}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Envoi...' : 'Soumettre la commande'}
              </button>
              <button
                onClick={clearCart}
                style={styles.clearBtn}
                disabled={loading}
              >
                Vider le panier
              </button>
            </div>
          </div>
        </>
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
  emptyCart: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerRow: {
    backgroundColor: '#185FA5',
    color: 'white'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '500',
    fontSize: '14px'
  },
  row: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px'
  },
  qtyInput: {
    width: '60px',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'center'
  },
  removeBtn: {
    padding: '6px 12px',
    backgroundColor: '#A32D2D',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  summary: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #185FA5'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px'
  },
  totalPrice: {
    fontSize: '18px',
    color: '#185FA5'
  },
  checkoutBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px'
  },
  projectSelection: {
    marginBottom: '20px'
  },
  remarquesBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#E6F1FB',
    borderRadius: '8px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #185FA5',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  continueBtn: {
    padding: '12px 24px',
    backgroundColor: '#888780',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  submitBtn: {
    padding: '12px 24px',
    backgroundColor: '#27500A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  clearBtn: {
    padding: '12px 24px',
    backgroundColor: '#BA7517',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
}