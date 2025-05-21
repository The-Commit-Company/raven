import { useGetUser } from '@/hooks/useGetUser'
import { DateMonthAtHourMinuteAmPm } from '@/utils/dateConversions'
import { FileExtensionIcon } from '@/utils/layout/FileExtIcon'
import { getFileExtension, getFileName } from '@/utils/operations'
import { Box, Flex, FlexProps, Separator, Text } from '@radix-ui/themes'
import { clsx } from 'clsx'
import parse from 'html-react-parser'
import { MdOutlineBarChart } from 'react-icons/md'
import { FileMessage, Message, PollMessage, TextMessage } from '../../../../../../../types/Messaging/Message'

type ReplyMessageBoxProps = FlexProps & {
  message: Partial<Message>
  currentUser: string | null | undefined
}
/**
 * UI component to show the message being replied to
 * @param props
 * @returns
 */
export const ReplyMessageBox = ({ currentUser, message, children, className, ...props }: ReplyMessageBoxProps) => {
  const user = useGetUser(message.owner)
  const isCurrentUser = currentUser === message?.owner

  return (
    <Flex
      className={clsx(
        'p-2 items-start border border-gray-5 shadow-sm dark:border-gray-6 rounded-md overflow-hidden',
        !isCurrentUser ? 'bg-atom-1 dark:bg-atom-2' : 'bg-gray-3 dark:bg-gray-4',
        className
      )}
      {...props}
    >
      <Flex gap='1' direction='column' className='border-l-2 pl-2 border-gray-8'>
        <Flex gap='2' align='center'>
          <Text as='span' size='1' weight='medium' truncate>
            {user?.full_name ?? message.owner}
          </Text>
          <Separator orientation='vertical' />
          <Text as='span' size='1' color='gray'>
            {message.creation && <DateMonthAtHourMinuteAmPm date={message.creation} />}
          </Text>
        </Flex>
        <Box className='max-w-[75vw]'>
          {message.message_type === 'Poll' ? (
            <Text as='span' size='2' className='line-clamp-2 flex items-center'>
              <MdOutlineBarChart size='14' className='inline mr-1' />
              Poll: {(message as PollMessage).content?.split('\n')?.[0]}
            </Text>
          ) : ['File', 'Image'].includes(message.message_type ?? 'Text') ? (
            <Flex gap='2' align='center'>
              {message.message_type === 'File' && message.file && (
                <FileExtensionIcon ext={getFileExtension(message.file)} size='18' />
              )}
              {message.message_type === 'Image' && (
                <img
                  src={message.file}
                  alt={`Image sent by ${message.owner}`}
                  height='30'
                  width='30'
                  className='object-cover rounded-md'
                />
              )}

              <Text as='span' size='2'>
                {getFileName((message as FileMessage).file)}
              </Text>
            </Flex>
          ) : (
            <Text as='span' size='2' className='line-clamp-2 text-ellipsis'>
              {parse((message as TextMessage).content ?? '')}
            </Text>
          )}
        </Box>
      </Flex>
      {children}
    </Flex>
  )
}
