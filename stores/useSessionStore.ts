import { defineStore } from 'pinia'

type SessionRow = {
    id: string
    title: string
    join_code: string
    is_open: boolean
    created_at: string
}

export const useSessionStore = defineStore('sessions', () => {
    const sessions = ref<SessionRow[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    function setSessions(rows: SessionRow[]) {
        sessions.value = rows
    }

    return {
        sessions,
        loading,
        error,
        setSessions,
    }
})
