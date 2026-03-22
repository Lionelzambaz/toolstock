import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useCart } from '../hooks/useCart'
import { useCatalog } from '../hooks/useCatalog'
import PieceCard from '../components/Catalog/PieceCard'
import PieceModal from '../components/Catalog/PieceModal'

export default function CatalogPage() {
  const { addItem } = useCart()
  const { getSubAssemblyComposition } = useCatalog()
  const [pieces, setPieces] = useState([])
  const [projects, setProjects] = useState([])
  const [subAssemblies, setSubAssemblies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [searchText, setSearchText] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedSubAssembly, setSelectedSubAssembly] = useState('all')

  // Données filtrées pour les dropdowns intelligents
  const [availableSuppliers, setAvailableSuppliers] = useState([])
  const [availableProjects, setAvailableProjects] = useState([])
  const [availableSubAssemblies, setAvailableSubAssemblies] = useState([])

  // Modale et notification
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: piecesData } = await supabase.from('pieces').select('*').order('denomination')
      const { data: projectsData } = await supabase.from('projects').select('*').order('nom')
      const { data: subAssData } = await supabase.from('sub_assemblies').select('*').order('nom')

      setPieces(piecesData || [])
      setProjects(projectsData || [])
      setSubAssemblies(subAssData || [])
      
      // Init les listes disponibles
      const suppliers = [...new Set(piecesData?.map(p => p.fournisseur) || [])].sort()
      setAvailableSuppliers(suppliers)
      setAvailableProjects(projectsData || [])
      setAvailableSubAssemblies(subAssData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour TOUS les filtres intelligents
  const updateAvailableFilters = async (supplierId, projectId, subAssemblyId) => {
    try {
      // Récupérer toutes les pièces filtrées par les sélections actuelles
      let filteredPieces = pieces

      // Filtre fournisseur
      if (supplierId !== 'all') {
        filteredPieces = filteredPieces.filter(p => p.fournisseur === supplierId)
      }

      // Filtre projet (pièces DIRECTES + pièces des SOUS-ENSEMBLES du projet)
      if (projectId !== 'all') {
        // Pièces liées directement au projet
        const { data: piecesInProject } = await supabase
          .from('project_pieces')
          .select('piece_id')
          .eq('project_id', projectId)
        const pieceIdsInProject = piecesInProject?.map(p => p.piece_id) || []

        // Pièces dans les sous-ensembles du projet
        const { data: subAssInProject } = await supabase
          .from('project_sub_assembly')
          .select('sub_assembly_id')
          .eq('project_id', projectId)
        const subAssemblyIds = subAssInProject?.map(s => s.sub_assembly_id) || []

        let pieceIdsInSubAssemblies = []
        if (subAssemblyIds.length > 0) {
          const { data: piecesInSubAss } = await supabase
            .from('sub_assembly_pieces')
            .select('piece_id')
            .in('sub_assembly_id', subAssemblyIds)
          pieceIdsInSubAssemblies = piecesInSubAss?.map(p => p.piece_id) || []
        }

        // Combiner: pièces directes OU pièces des sous-ensembles
        const allPieceIds = [...new Set([...pieceIdsInProject, ...pieceIdsInSubAssemblies])]
        filteredPieces = filteredPieces.filter(p => allPieceIds.includes(p.id))
      }

      // Filtre sous-ensemble
      if (subAssemblyId !== 'all') {
        const { data: piecesInSubAsses } = await supabase
          .from('sub_assembly_pieces')
          .select('piece_id')
          .eq('sub_assembly_id', subAssemblyId)
        const pieceIds = piecesInSubAsses?.map(p => p.piece_id) || []
        filteredPieces = filteredPieces.filter(p => pieceIds.includes(p.id))
      }

      // Mettre à jour les fournisseurs disponibles
      const availableSuppliersSet = [...new Set(filteredPieces.map(p => p.fournisseur))]
      setAvailableSuppliers(availableSuppliersSet.sort())

      // Mettre à jour les projets disponibles
      if (subAssemblyId !== 'all') {
        const { data } = await supabase
          .from('project_sub_assembly')
          .select('project_id')
          .eq('sub_assembly_id', subAssemblyId)
        const projectIds = data?.map(p => p.project_id) || []
        const filtered = projects.filter(p => projectIds.includes(p.id))
        setAvailableProjects(filtered)
      } else {
        setAvailableProjects(projects)
      }

      // Mettre à jour les sous-ensembles disponibles
      if (projectId !== 'all') {
        const { data } = await supabase
          .from('project_sub_assembly')
          .select('sub_assembly_id')
          .eq('project_id', projectId)
        const subAssemblyIds = data?.map(s => s.sub_assembly_id) || []
        const filtered = subAssemblies.filter(s => subAssemblyIds.includes(s.id))
        setAvailableSubAssemblies(filtered)
      } else {
        setAvailableSubAssemblies(subAssemblies)
      }
    } catch (err) {
      console.error('Erreur lors du filtrage:', err)
    }
  }

  // Quand le fournisseur change
  const handleSupplierChange = (value) => {
    setSelectedSupplier(value)
    updateAvailableFilters(value, selectedProject, selectedSubAssembly)
  }

  // Quand le projet change
  const handleProjectChange = (value) => {
    setSelectedProject(value)
    updateAvailableFilters(selectedSupplier, value, selectedSubAssembly)
    // Réinitialiser le sous-ensemble si celui sélectionné n'est plus disponible
    if (value !== 'all' && selectedSubAssembly !== 'all') {
      supabase
        .from('project_sub_assembly')
        .select('sub_assembly_id')
        .eq('project_id', value)
        .then(result => {
          const subAssemblyIds = result.data?.map(s => s.sub_assembly_id) || []
          if (!subAssemblyIds.includes(selectedSubAssembly)) {
            setSelectedSubAssembly('all')
          }
        })
    }
  }

  // Quand le sous-ensemble change
  const handleSubAssemblyChange = (value) => {
    setSelectedSubAssembly(value)
    updateAvailableFilters(selectedSupplier, selectedProject, value)
    // Réinitialiser le projet si celui sélectionné n'est plus disponible
    if (value !== 'all' && selectedProject !== 'all') {
      supabase
        .from('project_sub_assembly')
        .select('project_id')
        .eq('sub_assembly_id', value)
        .then(result => {
          const projectIds = result.data?.map(p => p.project_id) || []
          if (!projectIds.includes(selectedProject)) {
            setSelectedProject('all')
          }
        })
    }
  }

  // Appliquer les filtres
  const getFilteredPieces = async () => {
    let filtered = pieces

    // Filtre recherche
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(p =>
        p.denomination.toLowerCase().includes(search) ||
        p.numero_interne.toLowerCase().includes(search) ||
        p.numero_fournisseur.toLowerCase().includes(search)
      )
    }

    // Filtre fournisseur
    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(p => p.fournisseur === selectedSupplier)
    }

    // Filtre projet (pièces DIRECTES + pièces des SOUS-ENSEMBLES du projet)
    if (selectedProject !== 'all') {
      // Pièces liées directement au projet
      const { data: piecesInProject } = await supabase
        .from('project_pieces')
        .select('piece_id')
        .eq('project_id', selectedProject)
      const pieceIdsInProject = piecesInProject?.map(p => p.piece_id) || []

      // Pièces dans les sous-ensembles du projet
      const { data: subAssInProject } = await supabase
        .from('project_sub_assembly')
        .select('sub_assembly_id')
        .eq('project_id', selectedProject)
      const subAssemblyIds = subAssInProject?.map(s => s.sub_assembly_id) || []

      let pieceIdsInSubAssemblies = []
      if (subAssemblyIds.length > 0) {
        const { data: piecesInSubAss } = await supabase
          .from('sub_assembly_pieces')
          .select('piece_id')
          .in('sub_assembly_id', subAssemblyIds)
        pieceIdsInSubAssemblies = piecesInSubAss?.map(p => p.piece_id) || []
      }

      // Combiner: pièces directes OU pièces des sous-ensembles
      const allPieceIds = [...new Set([...pieceIdsInProject, ...pieceIdsInSubAssemblies])]
      filtered = filtered.filter(p => allPieceIds.includes(p.id))
    }

    // Filtre sous-ensemble (pièces dans le sous-ensemble sélectionné)
    if (selectedSubAssembly !== 'all') {
      const { data: piecesInSubAsses } = await supabase
        .from('sub_assembly_pieces')
        .select('piece_id')
        .eq('sub_assembly_id', selectedSubAssembly)
      
      const pieceIdsInSubAsses = piecesInSubAsses?.map(p => p.piece_id) || []
      filtered = filtered.filter(p => pieceIdsInSubAsses.includes(p.id))
    }

    return filtered
  }

  const [filteredPieces, setFilteredPieces] = useState([])

  useEffect(() => {
    getFilteredPieces().then(setFilteredPieces)
  }, [searchText, selectedSupplier, selectedProject, selectedSubAssembly, pieces])

  const handleAddToCart = (piece, quantity) => {
    addItem(piece, quantity)
    setIsModalOpen(false)
    setSelectedPiece(null)
    
    // Afficher notification
    setNotification(`✅ ${quantity}× ${piece.denomination} ajouté au panier!`)
    
    // Masquer après 3 secondes
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCommandSubAssembly = async () => {
    if (!selectedSubAssembly || selectedSubAssembly === 'all') return

    // Demander combien de fois
    const count = prompt('Combien de fois ce sous-ensemble?', '1')
    if (!count || parseInt(count) < 1) return

    try {
      // Récupérer la composition du sous-ensemble
      const composition = await getSubAssemblyComposition(selectedSubAssembly)
      
      if (composition.length === 0) {
        setNotification('❌ Ce sous-ensemble est vide')
        setTimeout(() => setNotification(null), 3000)
        return
      }

      // Ajouter chaque pièce au panier (ignorer qty=0)
      let itemsAdded = 0
      composition.forEach(item => {
        if (item.quantite > 0) {
          addItem(item.pieces, item.quantite * parseInt(count))
          itemsAdded++
        }
      })

      // Notification
      const totalQty = composition
        .filter(c => c.quantite > 0)
        .reduce((sum, c) => sum + (c.quantite * parseInt(count)), 0)
      
      setNotification(`✅ ${totalQty} items ajoutés au panier!`)
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      console.error('Erreur:', err)
      setNotification('❌ Erreur lors de l\'ajout')
      setTimeout(() => setNotification(null), 3000)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Chargement du catalogue...</div>
  if (error) return <div style={{ padding: '20px', color: '#A32D2D' }}>Erreur: {error}</div>

  return (
    <>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#27500A',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 2000,
          fontSize: '14px',
          fontWeight: 'bold',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ color: '#042C53', marginTop: '0' }}>Catalogue de pièces</h1>
          <p style={{ color: '#888780' }}>{filteredPieces.length} pièce(s) trouvée(s)</p>
        </div>

        {/* FILTRES - BARRE HORIZONTALE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '25px',
          padding: '15px',
          backgroundColor: '#E6F1FB',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', color: '#042C53', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>🔍 Recherche</label>
            <input
              type="text"
              placeholder="N° interne, dénomination..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#042C53', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>🏭 Fournisseur</label>
            <select
              value={selectedSupplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tous</option>
              {availableSuppliers.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#042C53', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>🏢 Projet</label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tous les projets</option>
              {availableProjects.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#042C53', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>🔩 Sous-ensemble</label>
            <select
              value={selectedSubAssembly}
              onChange={(e) => handleSubAssemblyChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #185FA5',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tous</option>
              {availableSubAssemblies.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#042C53', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>&nbsp;</label>
            <button
              onClick={() => {
                setSearchText('')
                setSelectedSupplier('all')
                setSelectedProject('all')
                setSelectedSubAssembly('all')
                updateAvailableFilters('all', 'all', 'all')
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#888780',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              ↻ Réinitialiser
            </button>
          </div>
        </div>

        {/* BOUTON COMMANDER SOUS-ENSEMBLE */}
        {selectedSubAssembly !== 'all' && (
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={handleCommandSubAssembly}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#27500A',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Commander ce sous-ensemble complet
            </button>
          </div>
        )}

        {/* GRILLE DE CARTES - VERTICALES, EMPILÉES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '15px'
        }}>
          {filteredPieces.map(piece => (
            <PieceCard
              key={piece.id}
              piece={piece}
              onViewDetails={(p) => {
                setSelectedPiece(p)
                setIsModalOpen(true)
              }}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredPieces.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888780' }}>
            <p>Aucune pièce ne correspond à vos critères</p>
          </div>
        )}

        {/* MODALE */}
        <PieceModal
          piece={selectedPiece}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCart}
        />
      </div>
    </>
  )
}