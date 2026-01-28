// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },


    modules: [
        '@nuxtjs/supabase',
        '@pinia/nuxt',
    ],


// Pratique pour ton projet
    runtimeConfig: {
        public: {
            appName: 'Klap',
        },
    },


    typescript: {
        strict: true,
    },


    supabase: {
// redirectOptions utiles si tu fais un login teacher
        redirectOptions: {
            login: '/teacher/login',
            callback: '/teacher/callback',
            include: ['/teacher/**'],
        },
    },
    compatibilityDate: '2025-07-15',
})
