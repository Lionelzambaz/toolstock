import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const getPieces = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('pieces').select('*').order('denomination')
      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createPiece = useCallback(async (piece) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('pieces').insert([piece]).select()
      if (err) throw err
      setSuccess('Pièce créée')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePiece = useCallback(async (id, updates) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('pieces').update(updates).eq('id', id).select()
      if (err) throw err
      setSuccess('Pièce mise à jour')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePiece = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.from('pieces').delete().eq('id', id)
      if (err) throw err
      setSuccess('Pièce supprimée')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const getProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('projects').select('*').order('nom')
      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = useCallback(async (project) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('projects').insert([project]).select()
      if (err) throw err
      setSuccess('Projet créé')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (id, updates) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('projects').update(updates).eq('id', id).select()
      if (err) throw err
      setSuccess('Projet mis à jour')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProject = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.from('projects').delete().eq('id', id)
      if (err) throw err
      setSuccess('Projet supprimé')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const getSubAssemblies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('sub_assemblies').select('*').order('nom')
      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createSubAssembly = useCallback(async (subAssembly) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('sub_assemblies').insert([subAssembly]).select()
      if (err) throw err
      setSuccess('Sous-ensemble créé')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSubAssembly = useCallback(async (id, updates) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('sub_assemblies').update(updates).eq('id', id).select()
      if (err) throw err
      setSuccess('Sous-ensemble mis à jour')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSubAssembly = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.from('sub_assemblies').delete().eq('id', id)
      if (err) throw err
      setSuccess('Sous-ensemble supprimé')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const getUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('users').select('*').order('nom')
      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id, updates) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase.from('users').update(updates).eq('id', id).select()
      if (err) throw err
      setSuccess('Utilisateur mis à jour')
      return { success: true, data: data?.[0] }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.from('users').delete().eq('id', id)
      if (err) throw err
      setSuccess('Utilisateur supprimé')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  // ===== PROJECT_PIECES (Liaison Projet ↔ Pièce) =====
  const getProjectsForPiece = useCallback(async (pieceId) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('project_pieces')
        .select('project_id, projects(id, nom)')
        .eq('piece_id', pieceId)
      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const assignPieceToProject = useCallback(async (pieceId, projectId) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase
        .from('project_pieces')
        .insert({ piece_id: pieceId, project_id: projectId })
      if (err) throw err
      setSuccess('Pièce assignée au projet')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const removePieceFromProject = useCallback(async (pieceId, projectId) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase
        .from('project_pieces')
        .delete()
        .eq('piece_id', pieceId)
        .eq('project_id', projectId)
      if (err) throw err
      setSuccess('Pièce retirée du projet')
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading, error, success, clearMessages,
    getPieces, createPiece, updatePiece, deletePiece,
    getProjects, createProject, updateProject, deleteProject,
    getSubAssemblies, createSubAssembly, updateSubAssembly, deleteSubAssembly,
    getUsers, updateUser, deleteUser,
    getProjectsForPiece, assignPieceToProject, removePieceFromProject
  }
}