// hooks/useChannelActions.ts
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import { addToMarked, manuallyMarkedAtom, removeFromMarked } from '@/utils/atoms/manuallyMarkedAtom'
import { useCircleUserList } from '@/utils/users/CircleUserListProvider'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useAtom, useSetAtom } from 'jotai'

export const useChannelActions = () => {
  const { pushChannel, removeChannel, selectedChannels } = useCircleUserList()
  const { updateCount } = useUnreadMessageCount()
  const { call } = useFrappePostCall('raven.api.raven_channel_member.mark_channel_as_unread')

  const [manuallyMarked] = useAtom(manuallyMarkedAtom)
  const addManuallyMarked = useSetAtom(addToMarked)
  const removeManuallyMarked = useSetAtom(removeFromMarked)

  const isPinned = (channelId: string) => selectedChannels.some((c) => c.name === channelId)

  const togglePin = (channel: any) => {
    if (isPinned(channel.name)) {
      removeChannel(channel.name)
    } else {
      pushChannel(channel)
    }
  }

  const markAsUnread = async (channel: any) => {
    await call({ channel_id: channel.name })
    addManuallyMarked(channel.name)
    updateCount(
      (prev): any => {
        if (!prev) return prev
        const exists = prev.message.some((item) => item.name === channel.name)
        const updatedList = exists
          ? prev.message?.map((item) => (item.name === channel.name ? { ...item, unread_count: 1 } : item))
          : [
              ...prev.message,
              {
                name: channel.name,
                unread_count: 1,
                is_direct_message: channel.is_direct_message,
                last_message_content: ''
              }
            ]
        return { message: updatedList }
      },
      { revalidate: false }
    )
  }

  const clearManualMark = (channelId: string) => {
    removeManuallyMarked(channelId)
  }

  const isManuallyMarked = (channelId: string) => {
    return manuallyMarked.has(channelId)
  }

  return {
    isPinned,
    togglePin,
    markAsUnread,
    clearManualMark,
    isManuallyMarked,
    manuallyMarked // nếu cần dùng để mergeUnread
  }
}
