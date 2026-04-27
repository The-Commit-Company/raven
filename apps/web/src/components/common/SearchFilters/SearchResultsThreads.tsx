import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { MessageSquareText } from 'lucide-react'
import _ from '@lib/translate'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import { formatDate } from '@utils/date'
import MarkdownRenderer from '@components/ui/markdown'
import ErrorBanner from '@components/ui/error-banner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'

interface SearchResultsThreadsProps {
    searchValue?: string
    filters: SearchFilters
}

export const ThreadResultCard = ({ thread, author }: {
    thread: SearchResult,
    author?: UserData,
}) => {
    return (
        <div
            key={thread.id}
            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            tabIndex={0}
            role="button"
            aria-label={`Open thread: ${thread.content}`}>
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquareText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <h3 className="text-sm font-medium text-foreground truncate">
                                <MarkdownRenderer content={thread.content} />
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(thread.creation, "D MMMM YYYY h:mm A")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-auto pt-2 flex-wrap">
                        {author && <><UserAvatar
                            user={author}
                            size="xs"
                            showStatusIndicator={false}
                        />
                            <span>{author.full_name}</span></>}
                        <span>•</span>
                        <ChannelOrDMLabel channelId={thread.channel_id} parentChannelId={thread.parent_channel_id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchResultsThreads = ({ searchValue, filters }: SearchResultsThreadsProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error } = useSqliteSearch(searchValue, { ...filters, is_thread: 1 }, 100, (r) => r.content)

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No threads found.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((thread) => {
                                const author = users?.find((u) => u.name === thread.author)
                                return <ThreadResultCard key={thread.id} thread={thread} author={author} />
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default SearchResultsThreads
