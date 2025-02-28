import { useState } from 'react'
import ThreadsList from './ThreadsList'
import { useDebounce } from '@/hooks/useDebounce'
import { ChannelFilter, SearchFilter } from './Filters'

type Props = {}
/**
 * Component for displaying other threads - where the user is not a member of the thread but is a member of the channel
 */
const OtherThreads = (props: Props) => {

    const [search, setSearch] = useState('')

    const debouncedSearch = useDebounce(search, 250)

    const [channel, setChannel] = useState('all')

    return (
        <div>
            <div className='flex gap-2 justify-between p-2 border-b border-gray-4'>

                <SearchFilter search={search} setSearch={setSearch} />


                <div className='flex gap-2'>
                    <ChannelFilter channel={channel} setChannel={setChannel} />
                </div>
            </div>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <ThreadsList
                    content={debouncedSearch}
                    endpoint='raven.api.threads.get_other_threads'
                    channel={channel}
                />
            </div>
        </div>
    )
}

export default OtherThreads