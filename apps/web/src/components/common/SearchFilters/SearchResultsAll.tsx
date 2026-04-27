import { ScrollArea } from '@components/ui/scroll-area'
import { useSqliteSearch } from '@hooks/useSqliteSearch'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@db'
import { FileResultCard } from './SearchResultsFiles'
import { PollResultCard } from './SearchResultsPolls'
import { ThreadResultCard } from './SearchResultsThreads'
import { MessageResultCard } from './SearchResultsMessages'
import { LinkPreviewCard, parsePreviews } from './SearchResultsLinks'
import { SearchFilters } from './types'

interface SearchResultsAllProps {
    searchValue?: string
    filters: SearchFilters
}

const SearchResultsAll = ({ searchValue, filters }: SearchResultsAllProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error } = useSqliteSearch(searchValue, filters)
    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No results found.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((r) => {
                                const author = users?.find((u) => u.name === r.author)

                                if (r.is_thread === 1) {
                                    return <ThreadResultCard key={r.id} thread={r} author={author} />
                                }
                                if (r.message_type === 'File' || r.message_type === 'Image') {
                                    return <FileResultCard key={r.id} file={r} author={author} />
                                }
                                if (r.message_type === 'Poll') {
                                    return <PollResultCard key={r.id} poll={r} author={author} />
                                }
                                if (r.has_link === 1 && r.preview_data) {
                                    const previews = parsePreviews(r.preview_data)
                                    return (
                                        <div key={r.id} className="space-y-2">
                                            {previews.map((preview, i) => (
                                                <LinkPreviewCard key={`${r.id}-${i}`} link={r} preview={preview} author={author} />
                                            ))}
                                        </div>
                                    )
                                }
                                return <MessageResultCard key={r.id} message={r} author={author} />
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default SearchResultsAll
