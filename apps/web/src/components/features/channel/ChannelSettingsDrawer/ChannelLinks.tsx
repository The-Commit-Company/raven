import { ScrollArea } from '@components/ui/scroll-area'
import { Search, ExternalLink, LayoutPanelTop, Rows4, Link } from 'lucide-react'
import { useState } from 'react'
import { SearchResult, useSqliteSearch } from '@hooks/useSqliteSearch'
import _ from '@lib/translate'
import { useLinkPreview } from '@raven/lib/hooks/useLinkPreview'
import { Skeleton } from '@components/ui/skeleton'
import { ChannelMemberData, useChannelMembers } from '@hooks/useChannelMembers'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { formatRelativeDate } from '@utils/date'

const ChannelLinks = ({ channelID }: { channelID: string }) => {
    const { members } = useChannelMembers(channelID)
    const [searchQuery, setSearchQuery] = useState('')
    const [showPreviews, setShowPreviews] = useState(false)

    const { results, isLoading, error } = useSqliteSearch("", {
        channel_id: channelID,
        has_link: 1
    }, 100)


    return (
        <div className="px-1 space-y-2">
            {/* Search Bar and Toggle */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={_("Search links...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border/70 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                </div>

                {/* View Toggle Button */}
                <button
                    onClick={() => setShowPreviews(!showPreviews)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title={showPreviews ? "Switch to list view" : "Switch to preview view"}
                >
                    {showPreviews ? (
                        <LayoutPanelTop className="w-4 h-4" />
                    ) : (
                        <Rows4 className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Links List */}
            <ScrollArea className="flex-1">
                {isLoading || !results ? <LinkPreviewSkeletonList /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{_("No links shared in this channel yet.")}</div> :
                    <div>
                        <div className={`peer ${showPreviews ? 'space-y-3' : 'space-y-2'}`}>
                            {results.flatMap((link) => {
                                const member = members.find((m) => m.name === link.author)
                                const urls = link.links?.split("|").filter(Boolean) || []
                                return urls.map((url, index) => (
                                    <LinkPreviewCard
                                        key={`${link.id}-${index}`}
                                        link={link}
                                        url={url}
                                        member={member}
                                        showPreviews={showPreviews}
                                        searchQuery={searchQuery}
                                    />
                                ))
                            })}
                        </div>
                        {searchQuery && <div className="hidden peer-empty:block text-sm text-muted-foreground text-center py-8">{_("No links found matching your search.")}</div>}
                    </div>}
            </ScrollArea>
        </div>
    )
}

const LinkPreviewSkeleton = ({ i = 0 }: { i?: number }) => {
    return (
        <div className="flex gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton
                    className="h-4"
                    style={{ width: `${45 + (i % 4) * 15}%` }}
                />
                {i % 2 === 0 && (
                    <Skeleton className="h-4" style={{ width: "70%" }} />
                )}
            </div>
        </div>
    )
}

const LinkPreviewSkeletonList = () => {
    return (
        <div className="flex w-full flex-1 flex-col lg:mx-auto space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <LinkPreviewSkeleton i={i} />
            ))}
        </div>
    )
}



const LinkPreviewCard = ({ link, url, member, showPreviews, searchQuery }: { link: SearchResult, url: string, member?: ChannelMemberData, showPreviews: boolean, searchQuery: string }) => {
    const linkUrl = url
    const { linkPreview, isLoading } = useLinkPreview(linkUrl)
    const hostname = new URL(url).hostname;
    const faviconUrl = `https://icons.duckduckgo.com/ip2/${hostname}.ico`;

    if (isLoading) {
        return <LinkPreviewSkeleton />
    }

    const displayTitle = linkPreview?.title || linkUrl
    if (searchQuery && !displayTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null
    }
    return (
        <div
            key={link.id}
            className={`group border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden max-w-87 ${!showPreviews ? 'p-3' : ''
                }`}
            tabIndex={0}
            role="button"
            aria-label={`Open link: ${link.title}`}>

            {showPreviews ? (
                <div className="flex">
                    {/* Preview Image */}
                    {linkPreview?.image && (
                        <div className="w-24 h-24 bg-muted/30 relative overflow-hidden shrink-0">
                            <img
                                src={linkPreview.image}
                                alt={link.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                    e.currentTarget.parentElement?.classList.add('hidden')
                                }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                        {/* Top section: Title and domain */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {faviconUrl ? (
                                    <img
                                        src={faviconUrl}
                                        alt=""
                                        className="w-4 h-4 shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <Link className="w-4 h-4 shrink-0 text-muted-foreground hidden" />
                                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                                    {linkPreview && linkPreview.title ? linkPreview.title : linkUrl}
                                </h3>
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-auto" />
                            </div>
                            <div className="text-xs text-muted-foreground/60 mt-1">
                                {linkPreview && linkPreview.site_name ? linkPreview.site_name : hostname}
                            </div>
                        </div>

                        {/* Bottom section: User info */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-2">
                            {member && <> <UserAvatar
                                user={member}
                                size="xs"
                                showStatusIndicator={false}
                            />
                                <span>{member.full_name}</span>
                                <span>•</span></>}
                            <span>{formatRelativeDate(link.creation)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Compact List View */
                <div className="space-y-2">
                    <div className="flex items-start gap-3">
                        {faviconUrl ? (
                            <img
                                src={faviconUrl}
                                alt=""
                                className="w-5 h-5 shrink-0 mt-0.5"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />)
                            : null}
                        <Link className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5 hidden" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                                {linkPreview && linkPreview.title ? linkPreview.title : linkUrl}
                            </h3>
                            <div className="text-xs text-muted-foreground/70 mt-0.5">
                                {linkPreview && linkPreview.site_name ? linkPreview.site_name : hostname}
                            </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity duration-200 shrink-0 mt-0.5" onClick={() => window.open(url, '_blank')} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 ml-8">
                        {member && <> <UserAvatar
                            user={member}
                            size="xs"
                            showStatusIndicator={false}
                        />
                            <span>{member.full_name}</span>
                            <span>•</span></>}
                        <span>{formatRelativeDate(link.creation)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}


export default ChannelLinks