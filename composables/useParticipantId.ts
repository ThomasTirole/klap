import { v4 as uuidv4 } from 'uuid'

export function useParticipantId() {
    const key = 'klap_participant_id'
    const id = ref<string>('')

    if (process.client) {
        const existing = localStorage.getItem(key)
        if (existing) id.value = existing
        else {
            const newId = uuidv4()
            localStorage.setItem(key, newId)
            id.value = newId
        }
    }

    return computed(() => id.value)
}
