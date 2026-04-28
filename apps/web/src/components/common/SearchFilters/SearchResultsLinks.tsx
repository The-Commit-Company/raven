import { ScrollArea } from '@components/ui/scroll-area'
import { ExternalLink, FileBox } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import { useFrappePostCall, useFrappeEventListener } from 'frappe-react-sdk'
import _ from '@lib/translate'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { formatDate } from '@utils/date'
import ErrorBanner from '@components/ui/error-banner'
import { Skeleton } from '@components/ui/skeleton'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from '@db'
import { ChannelOrDMLabel } from './ChannelOrDMLabel'
import { SearchFilters } from './types'

export type LinkPreviewData = {
    url: string
    title?: string
    description?: string
    image?: string
    site_name?: string
    document_id?: string
}

export function parsePreviews(previewDataJson?: string): LinkPreviewData[] {
    if (!previewDataJson) return []
    try {
        return JSON.parse(previewDataJson)
    } catch {
        return []
    }
}

const getLinkRowField = (r: SearchResult) =>
    parsePreviews(r.preview_data).map(p => p.title ?? '').join(' ')

type RichPreview = {
    link: SearchResult
    preview: LinkPreviewData
    index: number
}

interface SearchResultsLinksProps {
    searchValue?: string
    filters: SearchFilters
}

const SearchResultsLinks = ({ searchValue, filters }: SearchResultsLinksProps) => {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { results, isLoading, error, mutate } = useSqliteSearch(searchValue, { ...filters, has_link: 1 }, 100, getLinkRowField)

    useFrappeEventListener("link_previews_updated", () => {
        mutate()
    })

    const { previews, previewlessUrls } = useMemo(() => {
        const previews: RichPreview[] = []
        const previewlessUrlSet = new Set<string>()

        if (results) {
            for (const link of results) {
                for (const [index, preview] of parsePreviews(link.preview_data).entries()) {
                    previews.push({ link, preview, index })
                    if (!preview.title) {
                        previewlessUrlSet.add(preview.url)
                    }
                }
            }
        }

        return { previews, previewlessUrls: [...previewlessUrlSet] }
    }, [results])

    const { call: updatePreviewLinks } = useFrappePostCall('raven.api.preview_links.update_link_previews_in_background')
    const backfillFired = useRef(false)

    useEffect(() => {
        if (previewlessUrls.length > 0 && !backfillFired.current) {
            backfillFired.current = true
            updatePreviewLinks({ urls: JSON.stringify(previewlessUrls) })
        }
    }, [previewlessUrls])

    return (
        <div className="space-y-2">
            {error && <ErrorBanner error={error} />}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <LinkPreviewSkeletonList /> :
                    previews.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No links found.")}</div> :
                        <div className={'space-y-2'}>
                            {previews.map(({ link, preview, index }) => {
                                const author = users?.find((u) => u.name === link.author)
                                return (
                                    <LinkPreviewCard
                                        key={`${link.id}-${index}`}
                                        link={link}
                                        preview={preview}
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

export const LinkPreviewCard = ({ link, preview, author }: {
    link: SearchResult,
    preview: LinkPreviewData,
    author?: UserData,
}) => {
    const url = preview.url
    const hostname = new URL(url).hostname
    const faviconUrl = `https://icons.duckduckgo.com/ip2/${hostname}.ico`
    const displayTitle = preview?.title || url
    const displaySubtitle = preview?.document_id ? preview.document_id : (preview?.site_name || hostname)

    return (
        <div
            className="group border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden p-3"
            tabIndex={0}
            role="button"
            aria-label={`Open link: ${displayTitle}`}>
            <div className="flex gap-3">
                {preview.image ? (
                    <img
                        src={preview.image}
                        alt=""
                        className="w-20 h-20 object-cover rounded-md border border-border/40 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                ) : preview.document_id ? (
                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/40">
                        <FileBox className="w-8 h-8 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/40">
                        <img
                            src={faviconUrl}
                            alt=""
                            className="w-10 h-10"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-foreground truncate min-w-0 max-w-[calc(100vw-20rem)]">{displayTitle}</h3>
                            <ExternalLink
                                className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity duration-200 shrink-0"
                                onClick={(e) => { e.stopPropagation(); window.open(url, '_blank') }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(link.creation, "D MMMM YYYY h:mm A")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-0.5">
                        {!preview.document_id && (
                            <img src={faviconUrl} alt="" className="w-3 h-3" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        )}
                        <span className="truncate">{displaySubtitle}</span>
                    </div>
                    {preview.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preview.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-auto pt-2 flex-wrap">
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
