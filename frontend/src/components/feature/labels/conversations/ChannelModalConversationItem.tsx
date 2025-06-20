import { Checkbox } from '@radix-ui/themes'
import { FaUsers } from 'react-icons/fa'
import { HiOutlineInformationCircle } from 'react-icons/hi'
import clsx from 'clsx'
import { useChannelDisplayInfo } from '@/utils/channel/getChannelInfo'

type Props = {
  name: string // label_id
  channel: any
  selected: Set<string>
  handleToggle: (id: string) => void
  onOpenModal?: (channel: any) => void
}

const ChannelModalConversationItem = ({ name, channel, selected, handleToggle, onOpenModal }: Props) => {
  const { isDM, displayName, avatarChar } = useChannelDisplayInfo(channel)

  if (channel?.is_self_message === 1) return null

  const isAlreadyLabeled =
    Array.isArray(channel?.user_labels) &&
    channel.user_labels.some((label: { label_id: string }) => label.label_id === name)

  const isSelected = selected.has(channel?.name)
  const isChecked = isSelected || isAlreadyLabeled

  const disabledStyle = isAlreadyLabeled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-2 py-1 rounded relative',
        disabledStyle,
        'hover:bg-gray-2 dark:hover:bg-gray-7'
      )}
    >
      <label className='flex items-center gap-2 flex-1'>
        <Checkbox
          checked={isChecked}
          disabled={isAlreadyLabeled}
          onCheckedChange={() => {
            if (!isAlreadyLabeled) handleToggle(channel.name)
          }}
          className={clsx(disabledStyle)}
        />

        {isDM ? (
          <div className='rounded-full w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white flex items-center justify-center text-xs font-bold uppercase'>
            {avatarChar}
          </div>
        ) : (
          <div className='rounded-full w-7 h-7 border-2 border-teal-400 text-teal-600 flex items-center justify-center'>
            <FaUsers className='w-4 h-4' />
          </div>
        )}

        <div className={clsx('truncate text-sm', disabledStyle)}>{displayName}</div>
      </label>

      <div
        onClick={(e) => {
          e.stopPropagation()
          onOpenModal?.(channel)
        }}
        className={clsx(
          'w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2',
          'flex items-center justify-center rounded-md',
          'hover:bg-gray-3 dark:hover:bg-gray-6',
          'text-gray-500 hover:text-black dark:hover:text-white',
          'transition duration-150 cursor-pointer'
        )}
        title='Thông tin kênh channel'
      >
        <HiOutlineInformationCircle className='w-4 h-4' />
      </div>
    </div>
  )
}

export default ChannelModalConversationItem
