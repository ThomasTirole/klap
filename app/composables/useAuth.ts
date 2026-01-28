import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useState<User | null>('user', () => null)
  const loading = useState<boolean>('auth-loading', () => true)

  // Initialiser l'utilisateur au chargement
  const initUser = async () => {
    loading.value = true
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (error) {
      console.error('Error fetching user:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // S'inscrire
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    if (data.user) user.value = data.user

    return data
  }

  // Se connecter
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (data.user) user.value = data.user

    return data
  }

  // Se déconnecter
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    isAuthenticated,
    initUser,
    signUp,
    signIn,
    signOut,
  }
}
