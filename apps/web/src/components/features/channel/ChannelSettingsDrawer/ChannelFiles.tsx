import { UserAvatar } from '@components/features/message/UserAvatar'
import { ArrowDownToLine, Search } from 'lucide-react'
import { useState } from 'react'
import FileTypeIcon from '@components/common/FileIcons/FileTypeIcon'
import { useSqliteSearch } from '@hooks/useSqliteSearch'
import { useChannelMembers } from '@hooks/useChannelMembers'
import { formatRelativeDate } from '@lib/date'
import { formatFileSize } from '@utils/fileUtils'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import MarkdownRenderer from '@components/ui/markdown'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { Input } from '@components/ui/input'

const ChannelFiles = ({ channelID }: { channelID: string }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const { results, isLoading, error } = useSqliteSearch(searchQuery, { channel_id: channelID, message_type: ["File", "Image"] }, 100, (r) => r.title)
    const { members } = useChannelMembers(channelID)

    return (
        <div className="px-1 space-y-2">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-gray-4" />
                <Input
                    placeholder={_("Search files...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>
            {error && <ErrorBanner error={error} />}
            {/* Files List */}
            <div>
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-ink-gray-4 text-center py-8">{searchQuery ? _("No files found matching your search.") : _("No files shared in this channel yet.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((file) => {
                                const member = members.find((m) => m.name === file.author)
                                return (
                                    <div
                                        key={file.id}
                                        className="group p-3 border border-outline-gray-2/70 rounded-lg hover:bg-surface-gray-2/50 transition-colors cursor-pointer w-full"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View ${file.title}`}>
                                        <div className="flex gap-3 min-w-0">
                                            <div className="shrink-0 mt-0.5">
                                                {file.message_type === 'Image' && file.internal_link ? (
                                                    <div className="relative">
                                                        <img
                                                            src={file.internal_link}
                                                            alt={file.title}
                                                            className="h-8 w-8 object-cover rounded-md border border-outline-gray-2/40"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-md" />
                                                    </div>
                                                ) : (
                                                    <FileTypeIcon fileType={file.file_type || "File"} size="lg" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <h3 className="text-sm font-medium text-ink-gray-8 truncate flex-1 min-w-0 pr-2">
                                                        <MarkdownRenderer content={file.title} />
                                                    </h3>
                                                    <a href={file.internal_link} download>
                                                        <ArrowDownToLine className="h-3 w-3 text-ink-gray-4 opacity-0 group-hover:opacity-100 hover:text-ink-gray-8 transition-opacity duration-200 shrink-0 mt-0.5" />
                                                    </a>
                                                </div>

                                                <div className="flex items-center gap-2 text-2xs text-ink-gray-4/70">
                                                    {file.file_size ? <span>{formatFileSize(file.file_size)}</span> : <span>0 B</span>}
                                                    <span>•</span>
                                                    <span className="uppercase">{file.file_type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-ink-gray-4/80 mt-2 ml-11">
                                            {member && <><UserAvatar
                                                user={member}
                                                size="xs"
                                                showStatusIndicator={false}
                                            />
                                                <span>{member.full_name}</span>
                                                <span>•</span></>}
                                            <span>{formatRelativeDate(file.creation)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>}
            </div>
        </div>
    )
}

export default ChannelFiles