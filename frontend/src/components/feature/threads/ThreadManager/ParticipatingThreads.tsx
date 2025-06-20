import { useDebounce } from '@/hooks/useDebounce'
import { useStickyState } from '@/hooks/useStickyState'
import { useState } from 'react'
import { ChannelFilter, SearchFilter, UnreadFilter } from './Filters'
import ThreadsList from './ThreadsList'

/**
 * Component for displaying participating threads - where the user is a member of the thread
 */
const ParticipatingThreads = () => {
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 250)

  const [channel, setChannel] = useState('all')

  const [onlyShowUnread, setOnlyShowUnread] = useStickyState(true, 'raven-participating-threads-only-show-unread')

  return (
    <div>
      <div className='flex flex-col gap-2 justify-between p-2 border-b border-gray-4'>
        <div className='flex gap-2 w-full'>
          <ChannelFilter channel={channel} setChannel={setChannel} />
          <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
        </div>
        <SearchFilter search={search} setSearch={setSearch} />
      </div>
      <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
        <ThreadsList content={debouncedSearch} channel={channel} onlyShowUnread={onlyShowUnread} />
      </div>
    </div>
  )
}

export default ParticipatingThreads
