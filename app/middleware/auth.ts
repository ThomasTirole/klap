export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, initUser, loading } = useAuth()
  const supabase = useSupabase()

  // Initialiser l'utilisateur si ce n'est pas déjà fait
  if (loading.value) {
    await initUser()
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Vérifier si l'enseignant est approuvé
  const { data: profile } = await supabase
    .from('teacher_profiles')
    .select('approved')
    .eq('user_id', user.value.id)
    .single()

  if (profile && !profile.approved) {
    return navigateTo('/pending-approval')
  }
})
