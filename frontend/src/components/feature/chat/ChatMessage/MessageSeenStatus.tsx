'use client'

import { UserAvatar } from '@/components/common/UserAvatar'
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box } from '@radix-ui/themes'
import { BsCheckCircle } from 'react-icons/bs'
import { MdRadioButtonUnchecked } from 'react-icons/md'

interface MessageSeenStatusProps {
  hasBeenSeen: boolean
  channelType?: string
  seenByOthers?: any[]
  unseenByOthers?: any[]
  currentUserOwnsMessage: boolean
}

export const MessageSeenStatus = ({
  hasBeenSeen,
  channelType,
  seenByOthers = [],
  unseenByOthers = [],
  currentUserOwnsMessage
}: MessageSeenStatusProps) => {
  if (!currentUserOwnsMessage) return null

  const showPopover = channelType === 'channel' && (seenByOthers.length || unseenByOthers.length)

  return (
    <TooltipProvider>
      <Popover.Root>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover.Trigger asChild>
              <Box className='ml-1 cursor-pointer'>
                {hasBeenSeen ? (
                  <BsCheckCircle className='text-green-500' />
                ) : (
                  <MdRadioButtonUnchecked className='text-gray-400' />
                )}
              </Box>
            </Popover.Trigger>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            align='center'
            className='px-2 py-1 text-sm text-white bg-neutral-600 rounded shadow-md'
          >
            {channelType === 'channel' ? 'Đã xem' : hasBeenSeen ? 'Đã xem' : 'Chưa xem'}
            <TooltipArrow className='fill-neutral-600' />
          </TooltipContent>
        </Tooltip>

        {/* Popover content hiển thị khi click */}
        {showPopover && (
          <Popover.Portal>
            <Popover.Content
              side='top'
              align='center'
              className='z-50 bg-neutral-800 text-white p-4 rounded border border-neutral-600 shadow-md min-w-[260px] max-w-sm'
              sideOffset={6}
              collisionPadding={8}
            >
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <div className='font-semibold mb-1'>{seenByOthers.length} Read</div>
                  <div className='space-y-2'>
                    {seenByOthers.map((user) => (
                      <div key={user.name} className='flex items-center gap-2'>
                        <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                        <span>{user.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className='font-semibold mb-1'>{unseenByOthers.length} Unread</div>
                  <div className='space-y-2'>
                    {unseenByOthers.map((user) => (
                      <div key={user.name} className='flex items-center gap-2'>
                        <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                        <span>{user.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Popover.Arrow className='fill-neutral-600' />
            </Popover.Content>
          </Popover.Portal>
        )}
      </Popover.Root>
    </TooltipProvider>
  )
}
