import { IoMdClose } from 'react-icons/io'
import { FaUsers } from 'react-icons/fa'
import clsx from 'clsx'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsMobile } from '@/hooks/useMediaQuery'

const SelectedChannelItem = ({ channel, handleToggle }: { channel: any; handleToggle: (id: string) => void }) => {
  const isDM = channel.is_direct_message === 1
  const user = isDM ? useGetUser(channel.peer_user_id) : null
  const isMobile = useIsMobile()

  const displayName = isDM ? user?.full_name || 'Người dùng' : channel.channel_name || channel.name
  const avatarChar = (displayName?.[0] || '?').toUpperCase()

  return (
    <div
      className={clsx(
        'relative',
        isMobile ? 'w-10 h-10' : 'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-2 dark:hover:bg-gray-7'
      )}
    >
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

        {!isMobile && (
          <div className='truncate text-sm text-gray-12 flex items-center gap-1'>
            <span className='truncate'>{displayName}</span>
            {channel.is_external === 1 && (
              <span className='text-[10px] bg-blue-100 text-blue-700 px-1 rounded'>Bên ngoài</span>
            )}
          </div>
        )}
      </div>

      {/* Nút X */}
      <button
        type='button'
        onClick={() => handleToggle(channel.name)}
        aria-label='Xoá khỏi danh sách'
        className={clsx(
          'transition-colors p-1',
          isMobile
            ? 'absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 flex items-center justify-center shadow'
            : 'text-gray-500 hover:text-black dark:hover:text-white bg-transparent'
        )}
      >
        <IoMdClose className='w-3.5 h-3.5' />
      </button>
    </div>
  )
}

export default SelectedChannelItem
