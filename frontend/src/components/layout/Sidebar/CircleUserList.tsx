import { useMemo } from 'react'
import { useUnreadMessages } from '@/utils/layout/sidebar'
import { useCircleUserList } from '@/utils/users/CircleUserListProvider'
import { mergeUnreadCountToSelectedChannels } from '@/components/feature/direct-messages/DirectMessageListCustom'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetUser } from '@/hooks/useGetUser'
import { Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { FaUsers } from 'react-icons/fa6'

interface Props {
  channel: any
}

const CircleUserItem = ({ channel }: Props) => {
  const navigate = useNavigate()
  const isDM = channel.is_direct_message === 1
  const userInfo = useGetUser(channel?.peer_user_id) // hợp lệ ở đây
  const displayName = isDM ? userInfo?.full_name : channel.channel_name

  const channelID = useParams();
  const handleClick = () => {
    navigate(`/channel/${channel.name}`)
  }

  return (
    <div onClick={handleClick} className="flex flex-col items-center space-y-1 cursor-pointer">
      <Tooltip content={displayName} side="bottom">
        <div className="flex flex-col items-center space-y-1">
          <div
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
              isDM
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                : 'border-2 border-teal-400 text-teal-600'
            )}
          >
            {isDM ? (
              <span>{displayName?.slice(0, 2).toUpperCase()}</span>
            ) : (
              <FaUsers className="text-teal-500 w-5 h-5" />
            )}
          </div>
          <div className="text-xs text-center max-w-[72px] truncate">{displayName}</div>
        </div>
      </Tooltip>
    </div>
  )
}

const CircleUserList = () => {
  const { selectedChannels } = useCircleUserList()
  const unread_count = useUnreadMessages()

  const enrichedSelectedChannels = useMemo(() => {
    if (!unread_count?.message) return selectedChannels
    return mergeUnreadCountToSelectedChannels(selectedChannels, unread_count.message)
  }, [selectedChannels, unread_count])

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 px-2 py-1 min-w-fit">
        {enrichedSelectedChannels.map((channel) => (
          <CircleUserItem key={channel.name} channel={channel} />
        ))}
      </div>
    </div>
  )
}

export default CircleUserList
