// components/DoneChannelList.tsx
import { useEnrichedSortedChannels } from '@/utils/channel/ChannelAtom'
import { DirectMessageItem } from '../direct-messages/DirectMessageListCustom'

export const DoneChannelList = () => {
  const doneChannels = useEnrichedSortedChannels(1)

  if (doneChannels?.length === 0) {
    return <div className='text-sm italic text-gray-500 p-4 text-center'>Không có cuộc trò chuyện nào đã xong</div>
  }

  return (
    <div className='flex flex-col gap-2'>
      {doneChannels?.map((channel) => (
        <div key={channel.name} className='relative group'>
          <DirectMessageItem dm_channel={channel} />
        </div>
      ))}
    </div>
  )
}
