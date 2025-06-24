// hooks/useChannelDoneListener.ts
import { channelIsDoneAtom } from '@/utils/channel/channelIsDoneAtom'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useSetAtom } from 'jotai'

export function useChannelDoneListener() {
  const setChannelIsDone = useSetAtom(channelIsDoneAtom)

  useFrappeEventListener('raven:channel_done_updated', ({ channel_id, is_done }) => {
    setChannelIsDone((prev) => ({
      ...prev,
      [channel_id]: is_done
    }))
  })
}
