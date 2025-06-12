import { useEffect } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useFrappePostCall, useFrappeEventListener } from 'frappe-react-sdk'
import { toast } from 'sonner'

import { doneListAtom } from '@/utils/channel/ChannelAtom'

// Kiểu channel tối thiểu cần quản lý
export interface Channel {
  name: string
  channel_name: string
  is_done: number
}

// Atom chứa toàn bộ channel (đã được enrich từ backend)
export const channelsAtom = atom<Channel[]>([])

export function useChannelDone() {
  const [channels, setChannels] = useAtom(channelsAtom)
  const doneList = useAtomValue(doneListAtom)
  const setDoneList = useSetAtom(doneListAtom)

  const { call: markDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_done')
  const { call: markNotDoneCall } = useFrappePostCall('raven.api.raven_channel.mark_channel_as_not_done')


  // ✅ Đồng bộ lại is_done cho từng channel trong channelsAtom
  useEffect(() => {
    setChannels((prev) =>
      prev.map((channel) => ({
        ...channel,
        is_done: doneList.includes(channel.name) ? 1 : 0
      }))
    )
  }, [doneList, setChannels])

  // ✅ Hàm đánh dấu đã xong
  const markAsDone = async (channelId: string) => {
    try {
      await markDoneCall({ channel_id: channelId })
      setDoneList((prev) => (prev.includes(channelId) ? prev : [...prev, channelId]))
      toast.success('Đã đánh dấu là đã xong')
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi đánh dấu đã xong')
    }
  }

  // ✅ Hàm bỏ đánh dấu đã xong
  const markAsNotDone = async (channelId: string) => {
    try {
      await markNotDoneCall({ channel_id: channelId })
      setDoneList((prev) => prev.filter((id) => id !== channelId))
      toast.success('Đã bỏ đánh dấu')
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi bỏ đánh dấu')
    }
  }

  return {
    channels,
    doneList,
    markAsDone,
    markAsNotDone
  }
}
