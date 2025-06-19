import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { DirectMessageItem } from '../direct-messages/DirectMessageListCustom'
import { sortedChannelsAtom } from '@/utils/channel/ChannelAtom'
import { useUnreadContext } from '@/utils/layout/sidebar'
import { channelDoneVersionAtom } from '@/hooks/useChannelDone'

export const DoneChannelList = () => {
  const sortedChannels = useAtomValue(sortedChannelsAtom)
  const doneVersion = useAtomValue(channelDoneVersionAtom)

  const unreadContext = useUnreadContext()

  const doneChannels = useMemo(() => {
    return sortedChannels
      .filter((channel) => channel.is_done === 1)
      .map((channel) => {
        const unreadItem = unreadContext.message.find((c) => c.name === channel.name)
        return {
          ...channel,
          unread_count: unreadItem?.unread_count ?? channel.unread_count ?? 0
        }
      })
  }, [sortedChannels, unreadContext, doneVersion])

  if (doneChannels.length === 0) {
    return <div className='text-sm italic text-gray-500 p-4 text-center'>Không có cuộc trò chuyện nào đã xong</div>
  }

  return (
    <div className='flex flex-col gap-2'>
      {doneChannels.map((channel) => (
        <div key={channel.name} className='relative group'>
          <DirectMessageItem dm_channel={channel} />
        </div>
      ))}
    </div>
  )
}
