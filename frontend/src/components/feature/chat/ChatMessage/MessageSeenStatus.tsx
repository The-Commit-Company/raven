import { UserAvatar } from '@/components/common/UserAvatar'
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box } from '@radix-ui/themes'
import React from 'react'
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

const ProgressCircleIcon: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 16 }) => {
  const angle = (percentage / 100) * 360
  const radians = (angle - 90) * (Math.PI / 180)

  const centerX = 14
  const centerY = 14
  const radius = 7
  const endX = centerX + radius * Math.cos(radians)
  const endY = centerY + radius * Math.sin(radians)

  const largeArcFlag = angle > 180 ? 1 : 0
  const pathData = `M 14 7 A 7 7 0 ${largeArcFlag} 1 ${endX} ${endY} L 14 14 Z`

  return (
    <svg width={size} height={size} viewBox='0 0 28 28' className='text-current'>
      <g fill='none' fillRule='evenodd'>
        <g fillRule='nonzero'>
          <path
            className='text-green-500'
            stroke='currentColor'
            strokeWidth='3'
            fill='none'
            d='M14 25.5c6.351 0 11.5-5.149 11.5-11.5S20.351 2.5 14 2.5 2.5 7.649 2.5 14 7.649 25.5 14 25.5z'
          />
          {/* Core - hiển thị theo phần trăm */}
          {percentage > 0 && <path className='text-green-500' fill='currentColor' d={pathData} />}
        </g>
      </g>
    </svg>
  )
}

export const MessageSeenStatus = React.memo(
  ({
    hasBeenSeen,
    channelType,
    seenByOthers = [],
    unseenByOthers = [],
    currentUserOwnsMessage,
    position = 'center'
  }: MessageSeenStatusProps) => {
    if (!currentUserOwnsMessage) return null

    // Đảm bảo showPopover là boolean
    const showPopover = channelType !== 'dm' && (seenByOthers?.length > 0 || unseenByOthers?.length > 0)

    // Tính toán tỉ lệ đã đọc
    const totalUsers = seenByOthers?.length + unseenByOthers?.length
    const readPercentage = totalUsers > 0 ? (seenByOthers?.length / totalUsers) * 100 : 0

    // Xác định loại icon cần hiển thị
    const getIcon = () => {
      if (!hasBeenSeen) {
        return <MdRadioButtonUnchecked className='text-gray-400' />
      }

      // Nếu là DM hoặc tất cả đã đọc
      if (channelType === 'dm' || unseenByOthers?.length === 0) {
        return <FaRegCheckCircle className='text-green-500' />
      }

      // Nếu còn unread thì hiển thị progress circle
      return <ProgressCircleIcon percentage={readPercentage} />
    }

    // Hàm getTooltipMessage với logic hiển thị tên thành viên
    const getTooltipMessage = (hasBeenSeen: boolean, channelType?: string): string => {
      if (channelType !== 'channel') {
        return hasBeenSeen ? 'Đã xem' : 'Chưa xem'
      }
      if (!hasBeenSeen) {
        return 'Chưa xem'
      }
      if (unseenByOthers?.length === 0) {
        return 'Tất cả đã xem'
      }

      const firstTwoSeen = seenByOthers.slice(0, 2)
      const names = firstTwoSeen?.map((user) => user.full_name).join(', ')

      if (seenByOthers?.length > 2) {
        return `${names} và ${seenByOthers?.length - 2} người khác đã xem`
      }

      if (seenByOthers?.length > 0) {
        return `${names} đã xem`
      }

      return `${seenByOthers?.length}/${totalUsers} đã xem`
    }

    return (
      <TooltipProvider>
        <Popover.Root>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover.Trigger asChild>
                <Box className='ml-1 cursor-pointer'>{getIcon()}</Box>
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
                className='z-50 bg-neutral-800 text-white p-4 rounded shadow-md min-w-[350px] max-w-md border border-neutral-700 focus:outline-none focus:ring-0'
                sideOffset={6}
                collisionPadding={8}
              >
                <div className='flex divide-x divide-neutral-700 text-sm max-h-[400px]'>
                  {/* Cột Read */}
                  <div className='pr-4 w-1/2'>
                    <div className='font-semibold mb-2 sticky top-0 bg-neutral-800 pb-1'>
                      {seenByOthers?.length} Đã xem
                    </div>
                    <div className='space-y-2 overflow-y-auto max-h-[350px] pr-2'>
                      {seenByOthers?.map((user, index) => (
                        <div key={`seen-${index}`} className='flex items-center gap-2'>
                          <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                          <span className='text-xs max-w-[120px] truncate block' title={user.full_name}>
                            {user.full_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cột Unread */}
                  <div className='pl-4 w-1/2'>
                    <div className='font-semibold mb-2 sticky top-0 bg-neutral-800 pb-1'>
                      {unseenByOthers?.length} Chưa xem
                    </div>
                    <div className='space-y-2 overflow-y-auto max-h-[350px] pr-2'>
                      {unseenByOthers?.map((user, index) => (
                        <div key={`unseen-${index}`} className='flex items-center gap-2'>
                          <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                          <span className='text-xs max-w-[120px] truncate block' title={user.full_name}>
                            {user.full_name}
                          </span>
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
)
