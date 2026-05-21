import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { MessageSquareText, Search } from 'lucide-react'
import { useState } from 'react'
import _ from '@lib/translate'
import { useSqliteSearch } from '@hooks/useSqliteSearch'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import { useChannelMembers } from '@hooks/useChannelMembers'
import { formatRelativeDate } from '@lib/date'
import MarkdownRenderer from '@components/ui/markdown'
import ErrorBanner from '@components/ui/error-banner'
import { Badge } from '@components/ui/badge'

const ChannelThreads = ({ channelID }: { channelID: string }) => {

    const [searchQuery, setSearchQuery] = useState('')
    const { members } = useChannelMembers(channelID)

    const { results, isLoading, error } = useSqliteSearch(searchQuery, {
        channel_id: channelID,
        is_thread: 1
    }, 100, (r) => r.content)


    return (
        <div className="px-1 space-y-2">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-gray-4" />
                <input
                    type="text"
                    placeholder={_("Search threads...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-surface-white border border-outline-gray-2/70 rounded-md focus:outline-none focus:ring-2 focus:ring-outline-gray-4 focus:border-transparent"
                />
            </div>
            {error && <ErrorBanner error={error} />}
            {/* Threads List */}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-ink-gray-4 text-center py-8">{searchQuery ? _("No threads found matching your search.") : _("No threads in this channel yet.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((thread) => {
                                const member = members.find((m) => m.name === thread.author)
                                return (
                                    <div
                                        key={thread.id}
                                        className="group p-3 border border-outline-gray-2/70 rounded-lg hover:bg-surface-gray-2/50 transition-colors cursor-pointer max-w-87"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Open thread: ${thread.content}`}>
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <MessageSquareText className="w-4 h-4 text-ink-gray-4 shrink-0" />
                                                <h3 className="text-sm font-medium text-ink-gray-8 truncate">
                                                    <MarkdownRenderer content={thread.content} />
                                                </h3>
                                            </div>
                                            {/* {thread.reply_count ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                    {thread.reply_count > 9 ? '9+' : thread.reply_count}
                                                </Badge>
                                            ) : null} */}
                                        </div>

                                        {/* <div className="text-sm mb-2 line-clamp-2">
                                            {channel?.last_message_details?.content}
                                        </div> */}

                                        <div className="flex items-center gap-2 text-xs text-ink-gray-4/80 pt-1">
                                            {member && <><UserAvatar
                                                user={member}
                                                size="xs"
                                                // fontSize="xs"
                                                // radius="full"
                                                showStatusIndicator={false}
                                            />
                                                <span>{member.full_name}</span>
                                                <span>•</span></>}
                                            <span>{formatRelativeDate(thread.creation)}</span>
                                        </div>
                                    </div>)
                            }
                            )}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default ChannelThreads