import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useCatalog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getProjectsForPiece = useCallback(async (pieceId) => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('project_pieces')
        .select('projects(id, nom)')
        .eq('piece_id', pieceId)
      if (err) throw err
      return data?.map(p => p.projects) || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getSubAssembliesForPiece = useCallback(async (pieceId) => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('sub_assembly_pieces')
        .select('quantite, sub_assemblies(id, nom)')
        .eq('piece_id', pieceId)
      if (err) throw err
      return data?.map(p => ({ ...p.sub_assemblies, quantite: p.quantite })) || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getProjectsForPiece,
    getSubAssembliesForPiece
  }
}