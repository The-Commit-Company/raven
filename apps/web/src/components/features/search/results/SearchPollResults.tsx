import { Virtuoso } from 'react-virtuoso'
import { useNavigate } from 'react-router-dom'
import { useSqliteSearch } from '@hooks/useSqliteSearch'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { MessageResultBlock } from '@components/common/MessageResultBlock/MessageResultBlock'
import { searchResultToMessage } from '@components/common/MessageResultBlock/searchResultToMessage'
import { buildMessageUrl } from '@components/common/MessageResultBlock/messageUrl'
import { useMessageRowLookups } from '@hooks/useMessageRowLookups'
import { SearchFilters } from '../types'

interface SearchPollResultsProps {
    searchValue?: string
    filters: SearchFilters
}

const SearchPollResults = ({ searchValue, filters }: SearchPollResultsProps) => {
    const navigate = useNavigate()
    const { results, isLoading, error } = useSqliteSearch(
        searchValue,
        { ...filters, message_type: 'Poll' },
        100,
        (r) => r.content
    )

    const { usersById, channelById, dmById, workspaceById } = useMessageRowLookups()

    if (error) return <ErrorBanner error={error} />
    if (isLoading || !results) return <MessageListSkeleton />
    if (results.length === 0) {
        return (
            <div className="text-sm text-ink-gray-4 text-center py-8">
                {_('No polls found.')}
            </div>
        )
    }

    return (
        <Virtuoso
            data={results}
            style={{ height: '100%' }}
            initialItemCount={Math.min(results.length, 10)}
            computeItemKey={(_idx, r) => r.id}
            itemContent={(_idx, r) => {
                const channel = channelById.get(r.channel_id)
                const dmChannel = dmById.get(r.channel_id)
                return (
                    <MessageResultBlock
                        message={searchResultToMessage(r)}
                        user={usersById.get(r.author)}
                        channel={channel}
                        dmChannel={dmChannel}
                        peer={dmChannel ? usersById.get(dmChannel.peer_user_id) : undefined}
                        workspace={channel?.workspace ? workspaceById.get(channel.workspace) : undefined}
                        onClick={() => navigate(buildMessageUrl(r.channel_id, channel, dmChannel, r.id))}
                    />
                )
            }}
        />
    )
}

export default SearchPollResults
