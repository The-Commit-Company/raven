import { useFrappeGetCall } from 'frappe-react-sdk'
import { useMemo } from 'react'
import { Message } from '../../../../types/Messaging/Message'

type SavedMessage = Message & { workspace?: string }

export function useSavedMessages() {
  const { data, error, isLoading } = useFrappeGetCall<{
    message: SavedMessage[]
  }>('raven.api.raven_message.get_saved_messages', undefined, undefined, {
    revalidateOnFocus: false
  })

  // Tùy chọn: xử lý dữ liệu sau khi fetch
  const messages = useMemo(() => {
    if (!data) return []
    return data.message
  }, [data])

  return {
    messages,
    error,
    isLoading
  }
}
