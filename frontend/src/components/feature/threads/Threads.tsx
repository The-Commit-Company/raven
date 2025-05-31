import { PageHeader } from '@/components/layout/Heading/PageHeader'
import { Box, Flex, Heading, Tabs } from '@radix-ui/themes'
import { BiChevronLeft } from 'react-icons/bi'
import { Link, Outlet, useParams } from 'react-router-dom'
import ParticipatingThreads from './ThreadManager/ParticipatingThreads'
import clsx from 'clsx'
import AIThreads from './ThreadManager/AIThreads'
import OtherThreads from './ThreadManager/OtherThreads'

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
  const { workspaceID, threadID } = useParams()

  return (
    <Flex direction='column' gap='0'>
      <PageHeader>
        <Flex align='center' gap='3' className='h-8'>
          <Link
            to={`/${workspaceID}`}
            className='block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden'
          >
            <BiChevronLeft size='24' className='block text-gray-12' />
          </Link>
          <Heading size='5'>Threads</Heading>
        </Flex>
      </PageHeader>
      <div className='flex w-full'>
        <div className={clsx('h-screen w-full', threadID ? 'block' : 'hidden')}>
          <Outlet />
        </div>
      </div>
    </Flex>
  )
}

export const Component = Threads
