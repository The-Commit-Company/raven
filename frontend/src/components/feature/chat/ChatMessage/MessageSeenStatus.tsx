'use client'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box } from '@radix-ui/themes'
import { BsCheckCircle } from 'react-icons/bs'
import { MdRadioButtonUnchecked } from 'react-icons/md'

interface SeenUser {
  name: string
  full_name: string
  user_image: string
}

interface MessageSeenStatusProps {
  hasBeenSeen: boolean
  channelType?: string
  seenByOthers?: SeenUser[]
  currentUserOwnsMessage: boolean
}

export const MessageSeenStatus = ({
  hasBeenSeen,
  channelType,
  seenByOthers = [],
  currentUserOwnsMessage
}: MessageSeenStatusProps) => {
  if (!currentUserOwnsMessage) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Box className='ml-1 cursor-pointer'>
            {hasBeenSeen ? (
              <BsCheckCircle className='text-green-500' />
            ) : (
              <MdRadioButtonUnchecked className='text-gray-400' />
            )}
          </Box>
        </TooltipTrigger>
        <TooltipContent
          side='top'
          align='center'
          className='px-2 py-1 text-sm text-white bg-neutral-600 rounded shadow-md max-h-40 overflow-y-auto'
        >
          {hasBeenSeen ? (
            <>
              {channelType === 'channel' && seenByOthers.length > 0 ? (
                <div>
                  <div className='font-medium mb-1'>Đã xem bởi:</div>
                  <div className='space-y-3'>
                    {seenByOthers.map((user) => (
                      <div key={user.name} className='flex items-center gap-2'>
                        <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                        <span>{user.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>Đã xem</div>
              )}
            </>
          ) : (
            'Chưa xem'
          )}
          <TooltipArrow className='fill-neutral-600' />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
