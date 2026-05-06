import { ScrollArea } from '@components/ui/scroll-area'
import { Search, ExternalLink, Link, FileBox } from 'lucide-react'
import { useState } from 'react'
import { useFrappeEventListener } from 'frappe-react-sdk'
import _ from '@lib/translate'
import { Skeleton } from '@components/ui/skeleton'
import { ChannelMemberData, useChannelMembers } from '@hooks/useChannelMembers'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { formatRelativeDate } from '@utils/date'
import ErrorBanner from '@components/ui/error-banner'
import { LinkSearchResult, useLinkSearch } from '@hooks/useLinkSearch'

const ChannelLinks = ({ channelID }: { channelID: string }) => {
    const { members } = useChannelMembers(channelID)
    const [searchQuery, setSearchQuery] = useState('')

    const { results, isLoading, error, mutate } = useLinkSearch(searchQuery, {
        channel_id: channelID,
    }, 100)

    useFrappeEventListener("link_previews_updated", (data: { channel_id: string }) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

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
            </div>
            {error && <ErrorBanner error={error} />}
            {/* Links List */}
            <ScrollArea className="flex-1">
                {isLoading ? <LinkPreviewSkeletonList /> :
                    results.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">{searchQuery ? _("No links found matching your search.") : _("No links shared in this channel yet.")}</div> :
                        <div className={'space-y-2'}>
                            {results.map((link) => {
                                const member = members.find((m) => m.name === link.author)
                                return (
                                    <LinkPreviewCard
                                        key={`${link.id}-${link.url}`}
                                        link={link}
                                        member={member}
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
                <LinkPreviewSkeleton key={i} i={i} />
            ))}
        </div>
    )
}

const LinkPreviewCard = ({ link, member }: {
    link: LinkSearchResult,
    member?: ChannelMemberData,
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
            key={link.id}   //TODO: Scroll to message when clicked, we have message id as link.name
            className={`group border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden max-w-87 p-3`}
            tabIndex={0}
            role="button"
            aria-label={`Open link: ${displayTitle}`}>

            <div className="space-y-2">
                <div className="flex items-start gap-3">
                    {faviconUrl ? (
                        <img
                            src={faviconUrl}
                            alt=""
                            className="w-5 h-5 shrink-0"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                        />
                    ) : (
                        <FileBox className="w-5 h-5 shrink-0 text-muted-foreground" />
                    )}
                    <Link className="w-5 h-5 shrink-0 text-muted-foreground hidden" />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                            {displayTitle}
                        </h3>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                            {displaySubtitle}
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
        </div>
    )
}

export default ChannelLinks
