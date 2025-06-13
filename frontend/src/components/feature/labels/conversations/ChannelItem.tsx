import { Checkbox } from '@radix-ui/themes'
import { FaUsers } from 'react-icons/fa'
import { useGetUser } from '@/hooks/useGetUser'
import clsx from 'clsx'

const ChannelItem = ({
  channel,
  selected,
  handleToggle,
  label
}: {
  channel: any
  selected: Set<string>
  handleToggle: (id: string) => void
  label: string
}) => {
  if (channel.is_self_message === 1) return null

  const isDM = channel.is_direct_message === 1
  const user = isDM ? useGetUser(channel.peer_user_id) : null

  const displayName = isDM ? user?.full_name || 'Người dùng' : channel.channel_name || channel.name
  const avatarChar = (displayName?.[0] || '?').toUpperCase()

  const isDisabled = channel.user_labels?.includes(label)

  return (
    <label
      className={clsx(
        'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-2 dark:hover:bg-gray-7',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      )}
    >
      <Checkbox
        checked={selected.has(channel.name)}
        onCheckedChange={() => {
          if (!isDisabled) handleToggle(channel.name)
        }}
        readOnly={isDisabled} // giữ cho checkbox không thay đổi được
        className={clsx(isDisabled && 'pointer-events-none opacity-50')}
      />
      <div className='flex items-center gap-2 text-sm truncate'>
        {isDM ? (
          <div
            className={clsx(
              'rounded-full flex items-center justify-center',
              'w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-bold uppercase'
            )}
          >
            {avatarChar}
          </div>
        ) : (
          <div className='rounded-full flex items-center justify-center border-2 border-teal-400 text-teal-600 w-7 h-7'>
            <FaUsers className='w-4 h-4' />
          </div>
        )}
        <div className='truncate'>{displayName}</div>
      </div>
    </label>
  )
}

export default ChannelItem
