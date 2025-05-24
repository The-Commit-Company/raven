import { useIsMobile } from '@/hooks/useMediaQuery'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { MutableRefObject } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'

export interface GetMessagesResponse {
  message: {
    messages: Message[]
    has_old_messages: boolean
    has_new_messages: boolean
  }
}

export const useMessageAPI = (
  channelID: string,
  selected_message: string | null,
  highlightedMessage: string | null,
  scrollToBottom: () => void,
  scrollToMessageElement: (messageID: string) => void,
  latestMessagesLoadedRef: MutableRefObject<boolean>
) => {
  const isMobile = useIsMobile()

  const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>(
    'raven.api.chat_stream.get_messages',
    {
      channel_id: channelID,
      base_message: selected_message ? selected_message : undefined
    },
    {
      path: `get_messages_for_channel_${channelID}`,
      baseMessage: selected_message ? selected_message : undefined
    },
    {
      revalidateOnFocus: isMobile ? true : false,
      onSuccess: (data) => {
        if (!highlightedMessage) {
          if (!data.message.has_new_messages) {
            scrollToBottom()
            latestMessagesLoadedRef.current = true
          }
        } else {
          scrollToMessageElement(highlightedMessage)
        }
      }
    }
  )

  const { call: fetchOlderMessages, loading: loadingOlderMessages } = useFrappePostCall(
    'raven.api.chat_stream.get_older_messages'
  )

  const { call: fetchNewerMessages, loading: loadingNewerMessages } = useFrappePostCall(
    'raven.api.chat_stream.get_newer_messages'
  )

  const { call: trackVisit } = useFrappePostCall('raven.api.raven_channel_member.track_visit')

  return {
    data,
    isLoading,
    error,
    mutate,
    fetchOlderMessages,
    loadingOlderMessages,
    fetchNewerMessages,
    loadingNewerMessages,
    trackVisit
  }
}
