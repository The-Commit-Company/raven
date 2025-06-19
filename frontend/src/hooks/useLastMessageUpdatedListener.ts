import { useFrappeEventListener } from 'frappe-react-sdk'
import { useSetAtom } from 'jotai'
import { setSortedChannelsAtom } from '@/utils/channel/ChannelAtom'

export const useLastMessageUpdatedListener = () => {
  const setSortedChannels = useSetAtom(setSortedChannelsAtom)

  useFrappeEventListener('new_message', (event) => {
    console.log('[EVENT] new_message', event)

    const { channel_id } = event

    setSortedChannels((prev) =>
      prev.map((ch) =>
        ch.name === channel_id
          ? {
              ...ch,
              last_message_content: '[Đã thu hồi]',
              last_message_timestamp: '',
              last_message_sender_name: ''
            }
          : ch
      )
    )
  })
}
