import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import { formatDate } from '@utils/date'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import MarkdownRenderer from '@components/ui/markdown'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'

interface SearchResultsMessagesProps {
    searchValue?: string
    filters: SearchFilters
}

export const MessageResultCard = ({ message, author }: {
    message: SearchResult,
    author?: UserData,
}) => {
    return (
        <div
            key={message.id}
            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            tabIndex={0}
            role="button"
            aria-label={`Open message`}>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2 mb-0.5">
                    <div className="text-sm text-foreground line-clamp-3 max-w-[calc(100vw-20rem)]">
                        <MarkdownRenderer content={message.content} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(message.creation, "D MMMM YYYY h:mm A")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-auto pt-2 flex-wrap">
                    {author && <><UserAvatar
                        user={author}
                        size="xs"
                        showStatusIndicator={false}
                    />
                        <span>{author.full_name}</span></>}
                    <span>•</span>
                    <ChannelOrDMLabel channelId={message.channel_id} parentChannelId={message.parent_channel_id} />
                </div>
            </div>
        </div>
    )
}

const SearchResultsMessages = ({ searchValue, filters }: SearchResultsMessagesProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error } = useSqliteSearch(searchValue, { ...filters, message_type: filters.message_type || "Text" }, 100, (r) => r.content)

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No messages found.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((message) => {
                                const author = users?.find((u) => u.name === message.author)
                                return <MessageResultCard key={message.id} message={message} author={author} />
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default SearchResultsMessages
