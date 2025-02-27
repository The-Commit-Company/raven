import { useDebounce } from '@/hooks/useDebounce'
import { useState } from 'react'
import { SearchFilter, UnreadFilter } from './Filters'
import ThreadsList from './ThreadsList'

type Props = {}

/**
 * Component for displaying AI threads - these are all DMs with the AI
 */
const AIThreads = (props: Props) => {
    const [search, setSearch] = useState('')

    const debouncedSearch = useDebounce(search, 250)

    const [onlyShowUnread, setOnlyShowUnread] = useState(false)

    return (
        <div>
            <div className='flex gap-2 justify-between p-2 border-b border-gray-4'>

                <SearchFilter search={search} setSearch={setSearch} />

                <div className='flex gap-2'>
                    <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
                </div>
            </div>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <ThreadsList
                    content={debouncedSearch}
                    aiThreads={1}
                    onlyShowUnread={onlyShowUnread}
                />
            </div>
        </div>
    )
}

export default AIThreads