export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path === '/teacher/login' || to.path === '/teacher/callback') return

    const user = useSupabaseUser()
    if (!user.value) {
        return navigateTo('/teacher/login')
    }
})
