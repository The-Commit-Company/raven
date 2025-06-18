import { MdLabelOutline } from 'react-icons/md'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import LabelItemMenu from './LabelItemMenu'
import LabelItemList from './LabelItemList'
import { useState, useMemo } from 'react'
import { useEnrichedLabelChannels } from '@/utils/channel/ChannelAtom'

interface LabelItemProps {
  label: string
  name: string
}

const LabelItem: React.FC<LabelItemProps> = ({ label, name }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const allChannels = useEnrichedLabelChannels()

  const { labeledChannels, totalCount } = useMemo(() => {
    const channels = allChannels
      .filter((ch) => Array.isArray(ch.user_labels) && ch.user_labels.includes(name))
      .map((ch) => ({
        channel_id: ch.name,
        channel_name: ch.channel_name || ch.name,
        is_direct_message: ch.group_type === 'dm',
        unread_count: ch.unread_count ?? 0
      }))

    const total = channels.reduce((sum, ch) => sum + ch.unread_count, 0)

    return { labeledChannels: channels, totalCount: total }
  }, [allChannels, name])

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
                {totalCount > 10 ? '99+' : totalCount}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Chỉ hiện menu khi đã expand hoặc không có unread */}
        {!(totalCount > 0 && !isExpanded) && <LabelItemMenu name={name} label={label} />}
      </div>

      {isExpanded && labeledChannels.length > 0 && (
        <div className='ml-4 space-y-1'>
          {labeledChannels.map((channel) => (
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
