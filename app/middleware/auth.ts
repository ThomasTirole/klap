export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, initUser, loading } = useAuth()

  // Initialiser l'utilisateur si ce n'est pas déjà fait
  if (loading.value) {
    await initUser()
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user.value) {
    return navigateTo('/login')
  }
})
