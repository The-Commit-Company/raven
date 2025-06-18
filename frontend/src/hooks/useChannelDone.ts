import { useSetAtom } from 'jotai'
import { useFrappePostCall, useFrappeEventListener } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { setSortedChannelsAtom } from '@/utils/channel/ChannelAtom'

export function useChannelDone() {
  const setSortedChannels = useSetAtom(setSortedChannelsAtom)

  const { call: markDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_done')
  const { call: markNotDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_not_done')

  useFrappeEventListener('channel_done_updated', ({ channel_id, is_done }) => {
    setSortedChannels((prev) => {
      return prev.map((channel) => (channel.name === channel_id ? { ...channel, is_done } : channel))
    })
  })
  const markAsDone = async (channelId: string) => {
    const res = await markDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      setSortedChannels((prev) =>
        prev.map((channel) => (channel.name === channelId ? { ...channel, is_done: 1 } : channel))
      )
      toast.success('Đã đánh dấu là đã xong')
    } else {
      toast.error('Lỗi khi đánh dấu đã xong')
    }
  }

  const markAsNotDone = async (channelId: string) => {
    const res = await markNotDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      setSortedChannels((prev) =>
        prev.map((channel) => (channel.name === channelId ? { ...channel, is_done: 0 } : channel))
      )
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
