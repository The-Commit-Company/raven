import { memo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useNavigate } from 'react-router-dom'
import { MessageSquareMore } from 'lucide-react'
import _ from '@lib/translate'
import { formatDate } from '@lib/date'
import { useSqliteSearch, SearchResult } from '@hooks/useSqliteSearch'
import { useMessageRowLookups } from '@hooks/useMessageRowLookups'
import { buildMessageUrl } from '@components/common/MessageResultBlock/messageUrl'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import FileTypeIcon from '@components/common/FileIcons/FileTypeIcon'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import ErrorBanner from '@components/ui/error-banner'
import { formatBytes } from '@lib/file'
import { UserData } from '@db'
import { WorkspaceFields } from '@hooks/useWorkspaces'
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { SearchFilters } from '../types'

interface SearchFileResultsProps {
    searchValue?: string
    filters: SearchFilters
}

const SearchFileResults = ({ searchValue, filters }: SearchFileResultsProps) => {
    const navigate = useNavigate()
    const { results, isLoading, error } = useSqliteSearch(
        searchValue,
        { ...filters, message_type: filters.message_type || ['File', 'Image'] },
        100,
        (r) => r.title
    )
    const { usersById, channelById, dmById, workspaceById } = useMessageRowLookups()

    if (error) return <ErrorBanner error={error} />
    if (isLoading || !results) return <MessageListSkeleton />
    if (results.length === 0) {
        return (
            <div className="text-sm text-ink-gray-4 text-center py-8">
                {_('No files found.')}
            </div>
        )
    }

    return (
        <Virtuoso
            data={results}
            style={{ height: '100%' }}
            initialItemCount={Math.min(results.length, 10)}
            computeItemKey={(_idx, file) => `${file.id}::${file.internal_link ?? ''}`}
            itemContent={(_idx, file) => {
                const channel = channelById.get(file.channel_id)
                const dmChannel = dmById.get(file.channel_id)
                return (
                    <FileResultRow
                        file={file}
                        user={usersById.get(file.author)}
                        channel={channel}
                        dmChannel={dmChannel}
                        peer={dmChannel ? usersById.get(dmChannel.peer_user_id) : undefined}
                        workspace={channel?.workspace ? workspaceById.get(channel.workspace) : undefined}
                        onClick={() => navigate(buildMessageUrl(file.channel_id, channel, dmChannel, file.id))}
                    />
                )
            }}
        />
    )
}

interface FileResultRowProps {
    file: SearchResult
    user?: UserData
    channel?: ChannelListItem
    dmChannel?: DMChannelListItem
    peer?: UserData
    workspace?: WorkspaceFields
    onClick: () => void
}

const FileResultRowInner = ({ file, user, channel, dmChannel, peer, workspace, onClick }: FileResultRowProps) => {
    const peerName = peer?.full_name ?? dmChannel?.peer_user_id ?? ''
    const isImage = file.message_type === 'Image'
    const ext = (file.file_type || file.title?.split('.').pop() || '').toLowerCase()
    const sizeLabel = file.file_size ? formatBytes(file.file_size) : null
    const dateLabel = formatDate(file.creation, 'D MMMM YYYY, h:mm A')

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
            className="group relative flex gap-3 p-3 pb-4 rounded transition-colors cursor-pointer hover:bg-surface-gray-1 active:bg-surface-gray-2"
        >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-outline-gray-2 mx-1" />
            {user && <UserAvatar user={user} size="md" showStatusIndicator={false} />}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 text-base md:text-sm">
                    {user && <span className="font-medium text-ink-gray-8 truncate">{user.full_name}</span>}
                    {workspace && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <span className="text-ink-gray-4 truncate min-w-0">{workspace.workspace_name}</span>
                        </>
                    )}
                    {channel && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <ChannelIcon type={channel.type} className="h-3 w-3 shrink-0 self-center text-ink-gray-4" />
                            <span className="text-ink-gray-4 truncate min-w-0 -ml-0.5">{channel.channel_name}</span>
                        </>
                    )}
                    {dmChannel && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <MessageSquareMore className="h-3 w-3 shrink-0 self-center text-ink-gray-4" />
                            <span className="text-ink-gray-4 truncate min-w-0 -ml-0.5">{peerName}</span>
                        </>
                    )}
                    <span className="ml-auto shrink-0 text-xs text-ink-gray-4">{dateLabel}</span>
                </div>

                <div className="flex gap-3 mt-2">
                    {isImage && file.internal_link ? (
                        <img
                            src={file.internal_link}
                            alt={file.title ?? ''}
                            className="w-20 h-20 object-cover rounded-md border border-outline-gray-2/40 shrink-0 bg-surface-gray-2"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                    ) : (
                        <FileTypeIcon fileType={ext} size="xl" className="shrink-0 w-20 h-20" />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-sm font-medium text-ink-gray-8 truncate">{file.title || _('Untitled')}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-ink-gray-4 mt-0.5">
                            {ext && <span className="uppercase">{ext}</span>}
                            {ext && sizeLabel && <span>·</span>}
                            {sizeLabel && <span>{sizeLabel}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const FileResultRow = memo(FileResultRowInner)

export default SearchFileResults
