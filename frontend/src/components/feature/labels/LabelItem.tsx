import { MdLabelOutline } from 'react-icons/md'
import { HiChevronRight, HiChevronDown } from 'react-icons/hi'
import LabelItemMenu from './LabelItemMenu'
import LabelItemList from './LabelItemList'
import { useState } from 'react'

interface LabelItemProps {
  label: string
  name: string
  onEdit?: () => void
  onDelete?: () => void
  channelList: {
    is_direct_message: boolean
    channel_id: string
    channel_name: string
  }[]
}

const LabelItem: React.FC<LabelItemProps> = ({ label, name, onEdit, onDelete, channelList }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [channels, setChannels] = useState(channelList) // NEW

  const toggle = () => setIsExpanded((prev) => !prev)

  const handleRemoveChannel = (channelIDToRemove: string) => {
    setChannels((prev) => prev.filter((ch) => ch.channel_id !== channelIDToRemove))
  }
  return (
    <div className='space-y-1'>
      {/* header toggle */}
      <div className='relative'>
        <div onClick={toggle} className='px-3 py-2 rounded-md hover:bg-gray-3 transition-colors cursor-pointer'>
          <div className='flex items-center gap-2 text-sm text-gray-12'>
            {/* Chevron icon */}
            {isExpanded ? (
              <HiChevronDown className='w-4 h-4 text-gray-11 shrink-0' />
            ) : (
              <HiChevronRight className='w-4 h-4 text-gray-11 shrink-0' />
            )}
            <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
            <span>{label}</span>
          </div>
        </div>
        <LabelItemMenu name={name} label={label} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* danh sách channel */}
      {isExpanded && channels.length > 0 && (
        <div className='ml-4 space-y-1'>
          {channels.map((channel) => (
            <LabelItemList
              key={channel.channel_id}
              channelID={channel.channel_id}
              channelName={channel.channel_name}
              labelID={name}
              isDirectMessage={channel.is_direct_message}
              onRemoveLocally={handleRemoveChannel} // NEW
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LabelItem
