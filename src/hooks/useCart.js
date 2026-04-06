import { useState, useEffect, useCallback } from 'react'

const CART_STORAGE_KEY = 'toolstock_cart'

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    // Charger depuis localStorage au démarrage
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      const items = saved ? JSON.parse(saved) : []
      // Normaliser : s'assurer que cartKey existe (rétrocompatibilité)
      return items.map(item => ({ ...item, cartKey: item.cartKey || String(item.id) }))
    } catch (err) {
      console.error('Erreur lecture panier:', err)
      return []
    }
  })

  // Sauvegarder chaque changement
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  // sousEnsembleMeta = { id, nom, quantite } ou null pour une pièce individuelle
  const addItem = useCallback((piece, quantity = 1, sousEnsembleMeta = null) => {
    setCartItems(prev => {
      const cartKey = sousEnsembleMeta
        ? `${piece.id}_se_${sousEnsembleMeta.id}`
        : String(piece.id)

      const existing = prev.find(item => item.cartKey === cartKey)

      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantite: item.quantite + quantity }
            : item
        )
      } else {
        return [...prev, {
          cartKey,
          id: piece.id,
          numero_interne: piece.numero_interne,
          denomination: piece.denomination,
          fournisseur: piece.fournisseur,
          numero_fournisseur: piece.numero_fournisseur,
          prix_unitaire: piece.prix_unitaire,
          numero_dessin: piece.numero_dessin,
          position_dessin: piece.position_dessin,
          quantite: quantity,
          ...(sousEnsembleMeta ? {
            sous_ensemble_id: sousEnsembleMeta.id,
            sous_ensemble_nom: sousEnsembleMeta.nom,
            sous_ensemble_quantite: sousEnsembleMeta.quantite
          } : {})
        }]
      }
    })
  }, [])

  const removeItem = useCallback((cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey))
  }, [])

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      removeItem(cartKey)
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantite: quantity }
            : item
        )
      )
    }
  }, [removeItem])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.prix_unitaire * item.quantite), 0)
  }, [cartItems])

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantite, 0)
  }, [cartItems])

  return {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  }
}