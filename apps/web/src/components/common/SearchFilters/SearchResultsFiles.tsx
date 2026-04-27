import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { Download } from 'lucide-react'
import FileTypeIcon from '@components/common/FileIcons/FileTypeIcon'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import { formatDate } from '@utils/date'
import { formatFileSize } from '@utils/fileUtils'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'
import MarkdownRenderer from '@components/ui/markdown'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'

interface SearchResultsFilesProps {
    searchValue?: string
    filters: SearchFilters
}

export const FileResultCard = ({ file, author }: {
    file: SearchResult,
    author?: UserData,
}) => {
    return (
        <div
            key={file.id}
            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            tabIndex={0}
            role="button"
            aria-label={`View ${file.title}`}>
            <div className="flex gap-3">
                <div className="shrink-0">
                    {file.message_type === 'Image' && file.internal_link ? (
                        <div className="relative">
                            <img
                                src={file.internal_link}
                                alt={file.title}
                                className="h-20 w-20 object-cover rounded-md border border-border/40"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-md" />
                        </div>
                    ) : (
                        <FileTypeIcon fileType={file.file_type || "File"} size="xl" className="h-20 w-20 rounded-md" />
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-foreground truncate min-w-0">
                                <MarkdownRenderer content={file.title} />
                            </h3>
                            <a href={file.internal_link} download onClick={(e) => e.stopPropagation()}>
                                <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity duration-200 shrink-0" />
                            </a>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(file.creation, "D MMMM YYYY h:mm A")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                        {file.file_size ? <span>{formatFileSize(file.file_size)}</span> : <span>0 B</span>}
                        <span>•</span>
                        <span className="uppercase">{file.file_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-auto pt-2 flex-wrap">
                        {author && <><UserAvatar
                            user={author}
                            size="xs"
                            showStatusIndicator={false}
                        />
                            <span>{author.full_name}</span></>}
                        <span>•</span>
                        <ChannelOrDMLabel channelId={file.channel_id} parentChannelId={file.parent_channel_id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchResultsFiles = ({ searchValue, filters }: SearchResultsFilesProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])

    const { results, isLoading, error } = useSqliteSearch(searchValue, { ...filters, message_type: filters.message_type || ["File", "Image"] }, 100, (r) => r.title)

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <MessageListSkeleton /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No files found.")}</div> :
                        <div className="space-y-2 pb-1">
                            {results.map((file) => {
                                const author = users?.find((u) => u.name === file.author)
                                return <FileResultCard key={file.id} file={file} author={author} />
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

export default SearchResultsFiles
