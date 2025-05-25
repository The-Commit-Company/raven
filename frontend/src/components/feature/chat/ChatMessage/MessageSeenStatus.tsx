import { UserAvatar } from '@/components/common/UserAvatar'
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box } from '@radix-ui/themes'
import { FaRegCheckCircle } from 'react-icons/fa'
import { MdRadioButtonUnchecked } from 'react-icons/md'

// Định nghĩa type cho User
interface User {
  name: string // Có thể thay bằng id nếu có trường unique hơn
  user_image: string
  full_name: string
}

interface MessageSeenStatusProps {
  hasBeenSeen: boolean
  channelType?: string
  seenByOthers?: User[]
  unseenByOthers?: User[]
  currentUserOwnsMessage: boolean
  position?: 'center' | 'start' | 'end'
}

export const MessageSeenStatus = ({
  hasBeenSeen,
  channelType,
  seenByOthers = [],
  unseenByOthers = [],
  currentUserOwnsMessage,
  position = 'center'
}: MessageSeenStatusProps) => {
  if (!currentUserOwnsMessage) return null

  // Đảm bảo showPopover là boolean
  const showPopover = channelType !== 'dm' && (seenByOthers.length > 0 || unseenByOthers.length > 0)

  // Hàm getTooltipMessage được đơn giản hóa
  const getTooltipMessage = (hasBeenSeen: boolean, channelType?: string): string => {
    if (channelType !== 'channel') {
      return hasBeenSeen ? 'Đã xem' : 'Chưa xem'
    }
    if (!hasBeenSeen) {
      return 'Chưa xem'
    }
    if (unseenByOthers.length === 0) {
      return 'Tất cả đã xem'
    }
    return `${seenByOthers.length} Đã xem`
  }

  return (
    <TooltipProvider>
      <Popover.Root>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover.Trigger asChild>
              <Box className='ml-1 cursor-pointer'>
                {hasBeenSeen ? (
                  <FaRegCheckCircle className='text-green-500' />
                ) : (
                  <MdRadioButtonUnchecked className='text-gray-400' />
                )}
              </Box>
            </Popover.Trigger>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            align={position}
            className='px-2 py-1 text-sm text-white bg-neutral-600 rounded shadow-md z-50'
          >
            {getTooltipMessage(hasBeenSeen, channelType)}
            <TooltipArrow className='fill-neutral-600' />
          </TooltipContent>
        </Tooltip>

        {showPopover && (
          <Popover.Portal>
            <Popover.Content
              side='top'
              align={position}
              className='z-50 bg-neutral-800 text-white p-4 rounded shadow-md min-w-[250px] max-w-sm border border-neutral-700 focus:outline-none focus:ring-0'
              sideOffset={6}
              collisionPadding={8}
            >
              <div className='flex divide-x divide-neutral-700 text-sm'>
                {/* Cột Read */}
                <div className='pr-4 w-1/2'>
                  <div className='font-semibold mb-1'>{seenByOthers.length} Read</div>
                  <div className='space-y-2'>
                    {seenByOthers.map((user, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                        <span>{user.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột Unread */}
                <div className='pl-4 w-1/2'>
                  <div className='font-semibold mb-1'>{unseenByOthers.length} Unread</div>
                  <div className='space-y-2'>
                    {unseenByOthers.map((user, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                        <span>{user.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Popover.Arrow className='fill-neutral-700' />
            </Popover.Content>
          </Popover.Portal>
        )}
      </Popover.Root>
    </TooltipProvider>
  )
}
