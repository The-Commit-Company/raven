import { useEffect, useMemo, useState } from 'react'
import { useLocalChannelList } from '@/utils/layout/sidebar'
import { DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { DirectMessageItem } from '../direct-messages/DirectMessageListCustom'

export const DoneChannelList = () => {
  const { localChannels, setChannels } = useLocalChannelList()
  const [synced, setSynced] = useState(false)

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

  if (doneChannels.length === 0) {
    return <div className='text-sm italic text-gray-500 p-4'>Không có kênh đã hoàn thành</div>
  }

  return (
    <div className='flex flex-col gap-2'>
      {doneChannels.map((channel) => (
        <DirectMessageItem key={channel.name} dm_channel={channel} />
      ))}
    </div>
  )
}
