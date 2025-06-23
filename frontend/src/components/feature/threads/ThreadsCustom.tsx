import { Box, Tabs } from '@radix-ui/themes'
import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import OtherThreads from './ThreadManager/OtherThreads'
import ParticipatingThreads from './ThreadManager/ParticipatingThreads'

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

const ThreadsCustom = () => {
  const { threadID } = useParams()

  return (
    <div className='flex gap-0'>
      <Box className={clsx('w-full', threadID ? 'hidden sm:block' : 'block')}>
        {/* Show only regular threads now since this needs pagination */}
        <Tabs.Root defaultValue='Participating'>
          <Tabs.List>
            {/* <Tabs.Trigger className='cursor-pointer' value='Participating'>
              Đang tham gia
            </Tabs.Trigger>
            <Tabs.Trigger className='cursor-pointer' value='Other'>
              Khác
            </Tabs.Trigger> */}
            {/* <Tabs.Trigger className='cursor-pointer' value='AI Threads'>AI Agents</Tabs.Trigger> */}
          </Tabs.List>
          <Tabs.Content value='Participating'>
            <ParticipatingThreads />
          </Tabs.Content>
          {/* <Tabs.Content value='Other' className='h-[calc(100vh-6rem)] overflow-y-auto'>
            <OtherThreads />
          </Tabs.Content> */}
          {/* <Tabs.Content value='AI Threads' className='h-[calc(100vh-6rem)] overflow-y-auto'>
            <AIThreads />
          </Tabs.Content> */}
        </Tabs.Root>
      </Box>
    </div>
  )
}

export default ThreadsCustom
