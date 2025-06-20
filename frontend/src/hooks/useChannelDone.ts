// hooks/useChannelDone.ts
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'

export function useChannelDone() {
  const { call: markDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_done')
  const { call: markNotDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_not_done')

  const markAsDone = async (channelId: string) => {
    const res = await markDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      toast.success('Đã đánh dấu là đã xong')
      // Không update local ở đây — sẽ có event về
    } else {
      toast.error('Lỗi khi đánh dấu đã xong')
    }
  }

  const markAsNotDone = async (channelId: string) => {
    const res = await markNotDoneCall({ channel_id: channelId })
    if (res?.message?.status === 'success') {
      toast.success('Đã bỏ đánh dấu')
      // Không update local ở đây — sẽ có event về
    } else {
      toast.error('Lỗi khi bỏ đánh dấu')
    }
  }

  return {
    markAsDone,
    markAsNotDone
  }
}
