import { ScrollArea } from '@components/ui/scroll-area'
import { ExternalLink, FileBox } from 'lucide-react'
import { useFrappeEventListener } from 'frappe-react-sdk'
import _ from '@lib/translate'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { formatDate } from '@lib/date'
import ErrorBanner from '@components/ui/error-banner'
import { Skeleton } from '@components/ui/skeleton'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'
import { LinkSearchResult, useLinkSearch } from '@hooks/useLinkSearch'

interface SearchResultsLinksProps {
    searchValue?: string
    filters: SearchFilters
}

const SearchResultsLinks = ({ searchValue, filters }: SearchResultsLinksProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error, mutate } = useLinkSearch(searchValue, filters, 100)

    useFrappeEventListener("link_previews_updated", () => {
        mutate()
    })

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading ? <LinkPreviewSkeletonList /> :
                    results.length === 0 ? <div className="text-sm text-ink-gray-4 text-center py-8">{_("No links found.")}</div> :
                        <div className={'space-y-2'}>
                            {results.map((link) => {
                                const author = users?.find((u) => u.name === link.author)
                                return (
                                    <LinkPreviewCard
                                        key={`${link.id}-${link.url}`}
                                        link={link}
                                        author={author}
                                    />
                                )
                            })}
                        </div>}
            </ScrollArea>
        </div>
    )
}

const LinkPreviewSkeleton = ({ i = 0 }: { i?: number }) => {
    return (
        <div className="flex gap-3 p-4">
            <Skeleton className="h-20 w-20 rounded-md shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4" style={{ width: `${45 + (i % 4) * 15}%` }} />
                <Skeleton className="h-3" style={{ width: "70%" }} />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    )
}

const LinkPreviewSkeletonList = () => {
    return (
        <div className="flex w-full flex-1 flex-col lg:mx-auto space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <LinkPreviewSkeleton key={i} i={i} />
            ))}
        </div>
    )
}

export const LinkPreviewCard = ({ link, author }: {
    link: LinkSearchResult,
    author?: UserData,
}) => {
    const url = link.url
    const hostname = (() => {
        try { return new URL(url).hostname } catch { return url }
    })()
    const faviconUrl = `https://icons.duckduckgo.com/ip2/${hostname}.ico`
    const displayTitle = link.title || url
    const displaySubtitle = link.site_name || hostname

    return (
        <div
            className="group border border-outline-gray-2/70 rounded-lg hover:bg-surface-gray-2/50 transition-colors cursor-pointer overflow-hidden p-3"
            tabIndex={0}
            role="button"
            aria-label={`Open link: ${displayTitle}`}>
            <div className="flex gap-3">
                {link.image ? (
                    <img
                        src={link.image}
                        alt=""
                        className="w-20 h-20 object-cover rounded-md border border-outline-gray-2/40 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                ) : (
                    <div className="w-20 h-20 rounded-md bg-surface-gray-2 flex items-center justify-center shrink-0 border border-outline-gray-2/40">
                        <img
                            src={faviconUrl}
                            alt=""
                            className="w-10 h-10"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <FileBox className="w-8 h-8 text-ink-gray-4 hidden" />
                    </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-ink-gray-8 truncate w-[calc(100vw-20rem)]">{displayTitle}</h3>
                            <ExternalLink
                                className="h-3 w-3 text-ink-gray-4 opacity-0 group-hover:opacity-100 hover:text-ink-gray-8 transition-opacity duration-200 shrink-0"
                                onClick={(e) => { e.stopPropagation(); window.open(url, '_blank') }}
                            />
                        </div>
                        <span className="text-xs text-ink-gray-4 shrink-0">{formatDate(link.creation, "D MMMM YYYY h:mm A")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-gray-4/70 mt-0.5">
                        <img src={faviconUrl} alt="" className="w-3 h-3" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        <span className="truncate">{displaySubtitle}</span>
                    </div>
                    {link.description && (
                        <p className="text-xs text-ink-gray-4 mt-1 line-clamp-2">{link.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-ink-gray-4/80 mt-auto pt-2 flex-wrap">
                        {author && <>
                            <UserAvatar user={author} size="xs" showStatusIndicator={false} />
                            <span>{author.full_name}</span>
                        </>}
                        <span>•</span>
                        <ChannelOrDMLabel channelId={link.channel_id} parentChannelId={link.parent_channel_id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchResultsLinks
