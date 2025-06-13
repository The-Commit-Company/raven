import { useState } from 'react'
import ThreadsList from './ThreadsList'
import { useDebounce } from '@/hooks/useDebounce'
import { ChannelFilter, SearchFilter, UnreadFilter } from './Filters'
import { useStickyState } from '@/hooks/useStickyState'

type Props = {}
/**
 * Component for displaying participating threads - where the user is a member of the thread
 */
const ParticipatingThreads = (props: Props) => {

    const [search, setSearch] = useState('')

    const debouncedSearch = useDebounce(search, 250)

    const [channel, setChannel] = useState('all')

    const [onlyShowUnread, setOnlyShowUnread] = useStickyState(true, 'raven-participating-threads-only-show-unread')

    return (
        <div>
            <div className='flex gap-2 flex-wrap justify-between p-2 border-b border-gray-4'>

                <SearchFilter search={search} setSearch={setSearch} />


                <div className='flex gap-2'>
                    <ChannelFilter channel={channel} setChannel={setChannel} />
                    <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
                </div>
            </div>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <ThreadsList
                    content={debouncedSearch}
                    channel={channel}
                    onlyShowUnread={onlyShowUnread}
                />
            </div>
        </div>
    )
}

export default ParticipatingThreads