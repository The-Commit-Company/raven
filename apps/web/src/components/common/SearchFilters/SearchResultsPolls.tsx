import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { BarChart3 } from 'lucide-react'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import { formatDate } from '@utils/date'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'

interface SearchResultsPollsProps {
    searchValue?: string
    filters: SearchFilters
}

export const PollResultCard = ({ poll, author }: {
    poll: SearchResult,
    author?: UserData,
}) => {
    const question = poll.content.split('\n')[0]
    const options = poll.content.split('\n').slice(1)
    return (
        <div
            key={poll.id}
            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            tabIndex={0}
            role="button"
            aria-label={`View poll: ${question}`}>
            <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1 min-w-0">{question}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(poll.creation, "D MMMM YYYY h:mm A")}</span>
                    </div>
                    {options.length > 0 && (
                        <ul className="space-y-1 mb-2">
                            {options.map((opt, i) => (
                                <li key={i} className="text-xs text-foreground/80">
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 flex-wrap">
                        {author && <><UserAvatar
                            user={author}
                            size="xs"
                            showStatusIndicator={false}
                        />
                            <span>{author.full_name}</span></>}
                        <span>•</span>
                        <ChannelOrDMLabel channelId={poll.channel_id} parentChannelId={poll.parent_channel_id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchResultsPolls = ({ searchValue, filters }: SearchResultsPollsProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error } = useSqliteSearch(searchValue, { ...filters, message_type: "Poll" })

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No polls found.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((poll) => {
                                const author = users?.find((u) => u.name === poll.author)
                                return <PollResultCard key={poll.id} poll={poll} author={author} />
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default SearchResultsPolls
