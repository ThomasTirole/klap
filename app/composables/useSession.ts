import type { Session, SessionInsert, Item, ItemInsert } from '~/types/database'

export const useSession = () => {
  const supabase = useSupabase()
  const { user } = useAuth()

  // Créer une nouvelle session avec un code unique
  const createSession = async (title: string): Promise<Session> => {
    if (!user.value) throw new Error('User not authenticated')

    // Générer un code unique
    const joinCode = await generateUniqueCode()

    const sessionData: SessionInsert = {
      owner_user_id: user.value.id,
      title,
      join_code: joinCode,
      status: 'draft',
      active_item_id: null,
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Générer un code unique de 6 caractères
  const generateUniqueCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    let isUnique = false

    while (!isUnique) {
      code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      // Vérifier que le code n'existe pas déjà
      const { data } = await supabase
        .from('sessions')
        .select('id')
        .eq('join_code', code)
        .single()

      isUnique = !data
    }

    return code
  }

  // Récupérer une session par ID
  const getSession = async (id: string): Promise<Session | null> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching session:', error)
      return null
    }

    return data
  }

  // Récupérer une session par code de join
  const getSessionByCode = async (code: string): Promise<Session | null> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('join_code', code.toUpperCase())
      .single()

    if (error) {
      console.error('Error fetching session by code:', error)
      return null
    }

    return data
  }

  // Récupérer toutes les sessions de l'utilisateur
  const getUserSessions = async (): Promise<Session[]> => {
    if (!user.value) return []

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('owner_user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user sessions:', error)
      return []
    }

    return data || []
  }

  // Mettre à jour une session
  const updateSession = async (id: string, updates: Partial<Session>) => {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Supprimer une session
  const deleteSession = async (id: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Ajouter un item à une session
  const addItem = async (sessionId: string, itemData: Omit<ItemInsert, 'session_id' | 'order_index'>): Promise<Item> => {
    // Récupérer le dernier order_index
    const { data: items } = await supabase
      .from('items')
      .select('order_index')
      .eq('session_id', sessionId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextIndex = items && items.length > 0 ? items[0].order_index + 1 : 0

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...itemData,
        session_id: sessionId,
        order_index: nextIndex,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Récupérer les items d'une session
  const getSessionItems = async (sessionId: string): Promise<Item[]> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching session items:', error)
      return []
    }

    return data || []
  }

  // Mettre à jour un item
  const updateItem = async (itemId: string, updates: Partial<Item>) => {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Supprimer un item
  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  }

  return {
    createSession,
    getSession,
    getSessionByCode,
    getUserSessions,
    updateSession,
    deleteSession,
    addItem,
    updateItem,
    deleteItem,
    getSessionItems,
  }
}
