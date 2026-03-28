import { useState, useEffect, useCallback } from 'react'

const CART_STORAGE_KEY = 'toolstock_cart'

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    // Charger depuis localStorage au démarrage
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (err) {
      console.error('Erreur lecture panier:', err)
      return []
    }
  })

  // Sauvegarder chaque changement
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addItem = useCallback((piece, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === piece.id)
      
      if (existing) {
        return prev.map(item =>
          item.id === piece.id
            ? { ...item, quantite: item.quantite + quantity }
            : item
        )
      } else {
        return [...prev, {
          id: piece.id,
          numero_interne: piece.numero_interne,
          denomination: piece.denomination,
          fournisseur: piece.fournisseur,
          numero_fournisseur: piece.numero_fournisseur,
          prix_unitaire: piece.prix_unitaire,
          numero_dessin: piece.numero_dessin,
          position_dessin: piece.position_dessin,
          quantite: quantity
        }]
      }
    })
  }, [])

  const removeItem = useCallback((pieceId) => {
    setCartItems(prev => prev.filter(item => item.id !== pieceId))
  }, [])

  const updateQuantity = useCallback((pieceId, quantity) => {
    if (quantity <= 0) {
      removeItem(pieceId)
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === pieceId
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