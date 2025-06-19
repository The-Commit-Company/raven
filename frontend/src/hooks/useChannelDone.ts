import { atom, useSetAtom } from 'jotai'
import { useFrappePostCall, useFrappeEventListener } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { setSortedChannelsAtom } from '@/utils/channel/ChannelAtom'
import { useChannelList } from '@/utils/channel/ChannelListProvider'

export const channelDoneVersionAtom = atom(0)

// biến toàn cục chia sẻ giữa các hook instance
let debounceTimer: NodeJS.Timeout | null = null

// debounce helper: clear timer cũ, set timer mới
function scheduleMutate(mutateFn: () => void, delay = 500) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    mutateFn()
    debounceTimer = null
  }, delay)
}

export function useChannelDone() {
  // đây là mutate() của ChannelListProvider (đã fetch get_all_channels)
  const { mutate } = useChannelList()
  const setSortedChannels = useSetAtom(setSortedChannelsAtom)

  const { call: markDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_done')
  const { call: markNotDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_not_done')

  // realtime event: cập nhật ngay local và debounce re-fetch
  useFrappeEventListener('raven:channel_done_updated', ({ channel_id, is_done }) => {
    setSortedChannels((prev) => prev.map((ch) => (ch.name === channel_id ? { ...ch, is_done } : ch)))
    scheduleMutate(mutate)
  })

  const markAsDone = async (channelId: string) => {
    const res = await markDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      setSortedChannels((prev) => prev.map((ch) => (ch.name === channelId ? { ...ch, is_done: 1 } : ch)))
      scheduleMutate(mutate)
      toast.success('Đã đánh dấu là đã xong')
    } else {
      toast.error('Lỗi khi đánh dấu đã xong')
    }
  }

  const markAsNotDone = async (channelId: string) => {
    const res = await markNotDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      setSortedChannels((prev) => prev.map((ch) => (ch.name === channelId ? { ...ch, is_done: 0 } : ch)))
      scheduleMutate(mutate)
      toast.success('Đã bỏ đánh dấu')
    } else {
      toast.error('Lỗi khi bỏ đánh dấu')
    }
  }

  return {
    markAsDone,
    markAsNotDone
  }
}
