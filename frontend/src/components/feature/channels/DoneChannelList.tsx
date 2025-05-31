import { useEffect, useMemo, useState } from 'react'
import { useLocalChannelList } from '@/utils/layout/sidebar'
import { useCircleUserList } from '@/utils/users/CircleUserListProvider'
import { DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { DirectMessageItem } from '../direct-messages/DirectMessageListCustom'

export const DoneChannelList = () => {
  const { localChannels, setChannels } = useLocalChannelList()
  const { selectedChannels, setSelectedChannels } = useCircleUserList()
  const [synced, setSynced] = useState(false)

  // Đồng bộ từ localStorage vào localChannels
  useEffect(() => {
    const stored = localStorage.getItem('done_channels')
    const doneList: string[] = stored ? JSON.parse(stored) : []

    if (!synced && doneList.length > 0) {
      setChannels((prev) =>
        prev.map((c) =>
          doneList.includes(c.name) ? { ...c, is_done: 1 } : c
        )
      )
      setSynced(true)
    }
  }, [synced, setChannels])

  const doneChannels = useMemo(
    () =>
      localChannels.filter(
        (c: DMChannelWithUnreadCount & { is_done?: number }) => c.is_done === 1
      ),
    [localChannels]
  )

  const handleMarkAsUnread = (channelName: string) => {
    // Cập nhật lại localChannels
    setChannels((prev) =>
      prev.map((c) =>
        c.name === channelName ? { ...c, is_done: 0 } : c
      )
    )

    // Cập nhật lại selectedChannels dùng trong CircleUserList
    setSelectedChannels((prev) =>
      prev.map((c) =>
        c.name === channelName ? { ...c, is_done: 0 } : c
      )
    )
  }

  if (doneChannels.length === 0) {
    return <div className='text-sm italic text-gray-500 p-4 text-center'>Không có cuộc trò chuyện nào đã xong</div>
  }

  return (
    <div className='flex flex-col gap-2'>
      {doneChannels.map((channel) => (
        <div key={channel.name} className='relative'>
          <DirectMessageItem dm_channel={channel} />
        </div>
      ))}
    </div>
  )
}
