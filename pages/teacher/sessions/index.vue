<script setup lang="ts">
definePageMeta({ middleware: ['teacher-auth'] })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const sessions = ref<any[]>([])
const loading = ref(true)

async function loadSessions() {
  loading.value = true
  const { data, error } = await supabase
      .from('sessions')
      .select('id,title,join_code,is_open,created_at')
      .eq('owner_user_id', user.value?.id)
      .order('created_at', { ascending: false })

  sessions.value = data ?? []
  loading.value = false
  if (error) console.error(error)
}

async function logout() {
  await supabase.auth.signOut()
  navigateTo('/')
}

onMounted(loadSessions)
</script>

<template>
  <main style="padding: 24px;">
    <header style="display:flex; gap:12px; align-items:center;">
      <h1 style="margin:0;">Sessions</h1>
      <NuxtLink to="/teacher/sessions/new">+ Nouvelle</NuxtLink>
      <button @click="logout" style="margin-left:auto;">Déconnexion</button>
    </header>

    <p v-if="loading">Chargement…</p>

    <ul v-else>
      <li v-for="s in sessions" :key="s.id" style="margin: 10px 0;">
        <strong>{{ s.title }}</strong>
        — code: <code>{{ s.join_code }}</code>
        — {{ s.is_open ? 'ouverte' : 'fermée' }}
        —
        <NuxtLink :to="`/teacher/sessions/${s.id}/builder`">builder</NuxtLink>
        |
        <NuxtLink :to="`/teacher/sessions/${s.id}/live`">live</NuxtLink>
      </li>
    </ul>
  </main>
</template>
