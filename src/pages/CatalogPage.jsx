import { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import { supabase } from '../utils/supabaseClient'

export default function CatalogPage() {
  const [pieces, setPieces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFournisseur, setFilterFournisseur] = useState('')
  const [fournisseurs, setFournisseurs] = useState([])
  const { addItem } = useCart()

  useEffect(() => {
    fetchPieces()
    fetchFournisseurs()
  }, [])

  async function fetchPieces() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pieces')
        .select('*')
        .order('denomination', { ascending: true })
      
      if (error) throw error
      setPieces(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFournisseurs() {
    try {
      const { data, error } = await supabase
        .from('pieces')
        .select('fournisseur')
        .order('fournisseur', { ascending: true })
      
      if (error) throw error
      
      const unique = [...new Set(data?.map(p => p.fournisseur) || [])]
      setFournisseurs(unique)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredPieces = pieces.filter(piece => {
    const matchSearch = piece.denomination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       piece.numero_interne.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       piece.numero_fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchFournisseur = !filterFournisseur || piece.fournisseur === filterFournisseur
    
    return matchSearch && matchFournisseur
  })

  function addToCart(piece) {
    addItem(piece, 1)
    alert(`✅ Ajouté au panier: ${piece.denomination}`)
  }

  return (
    <div>
      <h2 style={styles.title}>Catalogue de pièces</h2>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Rechercher</label>
          <input
            type="text"
            placeholder="Dénomination, N° interne, N° fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Fournisseur</label>
          <select
            value={filterFournisseur}
            onChange={(e) => setFilterFournisseur(e.target.value)}
            style={styles.input}
          >
            <option value="">Tous les fournisseurs</option>
            {fournisseurs.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <p style={styles.resultCount}>
            {filteredPieces.length} pièce(s) trouvée(s)
          </p>
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <div style={styles.error}>Erreur: {error}</div>
      ) : filteredPieces.length === 0 ? (
        <p>Aucune pièce trouvée</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>N° Interne</th>
                <th style={styles.th}>Dénomination</th>
                <th style={styles.th}>Fournisseur</th>
                <th style={styles.th}>N° Fournisseur</th>
                <th style={styles.th}>Prix</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPieces.map((piece, idx) => (
                <tr key={piece.id} style={{...styles.row, backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9'}}>
                  <td style={styles.td}>{piece.numero_interne}</td>
                  <td style={styles.td}>{piece.denomination}</td>
                  <td style={styles.td}>{piece.fournisseur}</td>
                  <td style={styles.td}>{piece.numero_fournisseur}</td>
                  <td style={styles.td}>{piece.prix_unitaire.toFixed(2)} CHF</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => addToCart(piece)}
                      style={styles.addBtn}
                    >
                      Ajouter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  filters: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  filterGroup: {
    flex: 1,
    minWidth: '200px'
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
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  resultCount: {
    margin: '0',
    fontSize: '14px',
    color: '#888780'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
  addBtn: {
    padding: '6px 12px',
    backgroundColor: '#27500A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  error: {
    padding: '15px',
    backgroundColor: '#ffe0e0',
    color: '#A32D2D',
    borderRadius: '6px'
  }
}