import { Flex } from '@radix-ui/themes'
import clsx from 'clsx'
import { Outlet, useParams } from 'react-router-dom'

export type ThreadMessage = {
  bot: string
  channel_id: string
  content: string
  creation: string
  file: string
  hide_link_preview: 0 | 1
  image_height: string
  image_width: string
  is_bot_message: 0 | 1
  last_message_timestamp: string
  link_doctype: string
  link_document: string
  message_type: 'Text' | 'Image' | 'File' | 'Poll'
  name: string
  owner: string
  poll_id: string
  text: string
  thread_message_id: string
  participants: { user_id: string }[]
  workspace?: string
  reply_count?: number
}

const Threads = () => {
  const { threadID } = useParams()

  return (
    <Flex direction='column' gap='0'>
      <div className='flex w-full'>
        <div className={clsx('h-screen w-full', threadID ? 'block' : 'hidden')}>
          <Outlet />
        </div>
      </div>
    </Flex>
  )
}

export const Component = Threads
