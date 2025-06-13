import { IoMdClose } from 'react-icons/io'
import { FaUsers } from 'react-icons/fa'
import clsx from 'clsx'
import { useGetUser } from '@/hooks/useGetUser'

const SelectedChannelItem = ({
  channel,
  handleToggle,
}: {
  channel: any
  handleToggle: (id: string) => void
}) => {
  const isDM = channel.is_direct_message === 1
  const user = isDM ? useGetUser(channel.peer_user_id) : null

  const displayName =
    isDM ? user?.full_name || 'Người dùng' : channel.channel_name || channel.name

  const avatarChar = (displayName?.[0] || '?').toUpperCase()

  return (
    <div className='flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-gray-2 dark:hover:bg-gray-7'>
      <div className='flex items-center gap-2 truncate'>
        {isDM ? (
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0',
              'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
            )}
          >
            {avatarChar}
          </div>
        ) : (
          <div
            className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center text-teal-600 border-2 border-teal-400 shrink-0'
            )}
          >
            <FaUsers className='w-4 h-4' />
          </div>
        )}
        <div className='truncate text-sm text-gray-12 flex items-center gap-1'>
          <span className='truncate'>{displayName}</span>
          {channel.is_external === 1 && (
            <span className='text-[10px] bg-blue-100 text-blue-700 px-1 rounded'>Bên ngoài</span>
          )}
        </div>
      </div>
      <button
        type='button'
        onClick={() => handleToggle(channel.name)}
        className='cursor-pointer bg-transparent text-gray-500 hover:text-black dark:hover:text-white transition-colors p-1'
        aria-label='Xoá khỏi danh sách'
      >
        <IoMdClose className='w-4 h-4' />
      </button>
    </div>
  )
}

export default SelectedChannelItem
