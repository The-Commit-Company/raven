import { MdLabelOutline } from 'react-icons/md'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import LabelItemMenu from './LabelItemMenu'
import LabelItemList from './LabelItemList'
import { useState, useMemo } from 'react'
import { useEnrichedChannels } from '@/utils/channel/ChannelAtom'

interface LabelItemProps {
  label: string
  name: string
  onEdit?: () => void
  onDelete?: () => void
}

const LabelItem: React.FC<LabelItemProps> = ({ label, name, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const allChannels = useEnrichedChannels()

  const toggle = () => setIsExpanded((prev) => !prev)

  // ✅ Đồng bộ danh sách channel có nhãn này
  const labeledChannels = useMemo(() => {
    return allChannels
      .filter((ch) => Array.isArray(ch.user_labels) && ch.user_labels.includes(name))
      .map((ch) => ({
        channel_id: ch.name,
        channel_name: ch.channel_name || ch.name,
        is_direct_message: ch.group_type === 'dm',
        unread_count: ch.unread_count ?? 0 // 👈 thêm unread_count vào
      }))
  }, [allChannels, name])

  const totalUnreadCount = useMemo(() => {
    return labeledChannels.reduce((sum, ch) => sum + (ch.unread_count ?? 0), 0)
  }, [labeledChannels])

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
          </div>

          {totalUnreadCount > 0 && (
            <div className='absolute top-1/2 right-3 -translate-y-1/2 bg-red-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center'>
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </div>
          )}
        </div>

        {!totalUnreadCount && <LabelItemMenu name={name} label={label} onEdit={onEdit} onDelete={onDelete} />}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LabelItem
