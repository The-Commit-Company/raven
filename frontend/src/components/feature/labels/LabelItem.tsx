import { MdLabelOutline } from 'react-icons/md'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import LabelItemMenu from './LabelItemMenu'
import LabelItemList from './LabelItemList'
import { useState, useMemo } from 'react'
import { useEnrichedLabelChannels } from '@/utils/channel/ChannelAtom'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'

interface LabelItemProps {
  label: string
  name: string
  channels: any[]
}

const LabelItem: React.FC<LabelItemProps> = ({ label, name, channels }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { unread_count } = useUnreadMessageCount()

  // Map từ channel_id → unread_count item
  const unreadMap = useMemo(() => {
    const map = new Map<string, { unread_count: number; last_message_content?: string }>()
    unread_count?.message?.forEach((item) => {
      map.set(item.name, {
        unread_count: item.unread_count,
        last_message_content: item.last_message_content
      })
    })
    return map
  }, [unread_count])

  // Hợp nhất mảng mới
  const mergedChannels = useMemo(() => {
    return channels.map((ch) => {
      const unreadItem = unreadMap.get(ch.channel_id)

      return {
        channel_id: ch.channel_id,
        channel_name: ch.channel_name,
        is_direct_message: ch.is_direct_message,
        unread_count: unreadItem?.unread_count ?? 0,
        last_message_content: unreadItem?.last_message_content ?? ''
      }
    })
  }, [channels, unreadMap])

  // Tổng số unread_count của các channel trong label
  const totalCount = useMemo(() => {
    return channels.reduce((sum, ch) => {
      const unreadItem = unreadMap.get(ch.channel_id)
      const count = unreadItem?.unread_count ?? 0
      return sum + count
    }, 0)
  }, [channels, unreadMap])

  const toggle = () => setIsExpanded((prev) => !prev)

  return (
    <div className='space-y-1'>
      <div className='relative'>
        <div onClick={toggle} className='px-3 py-2 rounded-md hover:bg-gray-3 transition-colors cursor-pointer'>
          <div className='flex items-center gap-2 text-sm text-gray-12'>
            {isExpanded ? (
              <HiChevronDown className='w-4 h-4 text-gray-11 shrink-0' />
            ) : (
              <HiChevronRight className='w-4 h-4 text-gray-11 shrink-0' />
            )}
            <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
            <span>{label}</span>

            {/* ✅ Chỉ hiển thị totalUnread nếu chưa expand */}
            {!isExpanded && totalCount > 0 && (
              <span className='ml-auto bg-red-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center'>
                {totalCount > 10 ? '9+' : totalCount}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Chỉ hiện menu khi đã expand hoặc không có unread */}
        {!(totalCount > 0 && !isExpanded) && <LabelItemMenu name={name} label={label} />}
      </div>

      {isExpanded && mergedChannels.length > 0 && (
        <div className='ml-4 space-y-1'>
          {mergedChannels.map((channel) => (
            <LabelItemList
              key={channel.channel_id}
              channelID={channel.channel_id}
              channelName={channel.channel_name}
              labelID={name}
              isDirectMessage={channel.is_direct_message}
              unreadCount={channel.unread_count}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LabelItem
