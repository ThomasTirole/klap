import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Session, Item, Response } from '~/types/database'

export const useRealtime = () => {
  const supabase = useSupabase()

  // Souscrire aux changements d'une session
  const subscribeToSession = (
    sessionId: string,
    callback: (session: Session) => void
  ): RealtimeChannel => {
    console.log('[Realtime] Subscribing to session:', sessionId)

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('[Realtime] Session updated:', payload.new)
          callback(payload.new as Session)
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Session subscription status:', status)
      })

    return channel
  }

  // Souscrire aux nouvelles réponses d'un item
  const subscribeToItemResponses = (
    itemId: string,
    callbacks: {
      onInsert?: (response: Response) => void
      onDelete?: (response: Response) => void
    }
  ): RealtimeChannel => {
    console.log('[Realtime] Subscribing to item responses:', itemId)

    const channel = supabase.channel(`item-responses:${itemId}`)

    if (callbacks.onInsert) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log('[Realtime] New response:', payload.new)
          callbacks.onInsert!(payload.new as Response)
        }
      )
    }

    if (callbacks.onDelete) {
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'responses',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log('[Realtime] Response deleted:', payload.old)
          callbacks.onDelete!(payload.old as Response)
        }
      )
    }

    channel.subscribe((status) => {
      console.log('[Realtime] Item responses subscription status:', status)
    })

    return channel
  }

  // Souscrire aux changements des items d'une session
  const subscribeToSessionItems = (
    sessionId: string,
    callbacks: {
      onInsert?: (item: Item) => void
      onUpdate?: (item: Item) => void
      onDelete?: (item: Item) => void
    }
  ): RealtimeChannel => {
    const channel = supabase.channel(`session-items:${sessionId}`)

    if (callbacks.onInsert) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'items',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          callbacks.onInsert!(payload.new as Item)
        }
      )
    }

    if (callbacks.onUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'items',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          callbacks.onUpdate!(payload.new as Item)
        }
      )
    }

    if (callbacks.onDelete) {
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'items',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          callbacks.onDelete!(payload.old as Item)
        }
      )
    }

    channel.subscribe()
    return channel
  }

  // Se désabonner d'un channel
  const unsubscribe = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel)
  }

  return {
    subscribeToSession,
    subscribeToItemResponses,
    subscribeToSessionItems,
    unsubscribe,
  }
}
