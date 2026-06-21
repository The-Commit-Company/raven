import { NavLink } from "react-router-dom"
import { BotIcon, Loader2, UserX } from "lucide-react"
import { useUser } from "@hooks/useUser"
import { useUserCookieData } from "@hooks/useUserCookieData"
import { useChannel } from "@hooks/useChannel"
import { useCreateDM } from "@hooks/useCreateDM"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { OnLeaveBadge } from "@components/common/OnLeaveBadge"
import { UserAvatar, getStatusIndicatorColor } from "@components/features/message/UserAvatar"
import { cn } from "@lib/utils"
import _ from "@lib/translate"

/**
 * Interactive mention nodes. The backend stores mentions as plain
 * `<span data-type="userMention|channelMention" data-id="…">@Label</span>`;
 * RichTextRenderer swaps those spans for these components so we can:
 *   - resolve the CURRENT name (handles renamed/deleted users), not the label
 *     v2 baked into the HTML — falling back to that label while loading/unknown
 *   - highlight the viewer's OWN mention (data-self → amber, see rich-text.css)
 *   - show a profile hover card, and turn channels into real <NavLink>s
 *
 * Inline presentation lives in `.tiptap .mention` (the single source of truth);
 * these components emit markup + the data-self signal and own the hover card.
 */

export const UserMention = ({ id, fallback }: { id: string; fallback?: string }) => {
    const user = useUser(id)
    const { name: currentUser } = useUserCookieData()

    const label = user?.full_name || user?.name || fallback || id
    const isSelf = !!id && id === currentUser

    return (
        <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
                <span className="mention" data-type="userMention" data-id={id} data-self={isSelf ? "true" : undefined}>
                    @{label}
                </span>
            </HoverCardTrigger>
            {/* Content is portaled and only mounts while open, so the DM-create
                hook inside the card never runs for the many mentions nobody hovers. */}
            <HoverCardContent className="min-w-72">
                <UserMentionCard id={id} fallbackLabel={label} isSelf={isSelf} />
            </HoverCardContent>
        </HoverCard>
    )
}

/** Profile card body — mounted lazily by the hover card (see note above). */
const UserMentionCard = ({ id, fallbackLabel, isSelf }: { id: string; fallbackLabel: string; isSelf: boolean }) => {
    const user = useUser(id)
    const { createDM, loading } = useCreateDM()

    const fullName = user?.full_name || fallbackLabel
    const availability = user?.availability_status
    const isBot = user?.type === "Bot"

    const hasStatus = (availability && availability !== "Invisible") || !!user?.custom_status

    return (
        <div className="flex flex-col gap-3">
            {/* Header: avatar + name + handle, as one tight identity block. */}
            <div className="flex items-center gap-3">
                <div>
                    {user ? (
                        <UserAvatar user={user} size="lg" showStatusIndicator />
                    ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-gray-2 text-base font-medium text-ink-gray-5">
                            {fullName.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-ink-gray-8 text-base-semibold">{fullName}</span>
                    </div>
                    <span className="truncate text-xs text-ink-gray-5">{id}</span>
                    <div className="flex items-center gap-1 py-0.5">
                        {isBot && (
                            <Badge variant="subtle" theme="violet">
                                <BotIcon />
                                {_("Bot")}
                            </Badge>
                        )}
                        {user?.enabled === 0 && (
                            <Badge variant="subtle">
                                <UserX />
                                {_("Disabled")}
                            </Badge>
                        )}
                        <OnLeaveBadge userID={id} />
                    </div>
                </div>
            </div>

            {/* Availability + custom status — its own section so it's clearly
                separated from the identity block (availability hidden when Invisible). */}
            {hasStatus && (
                <div className="flex flex-col gap-1">
                    {availability && availability !== "Invisible" && (
                        <span className="flex items-center gap-1.5 text-xs text-ink-gray-6">
                            <span className={cn("size-2 rounded-full", getStatusIndicatorColor(availability))} />
                            {availability}
                        </span>
                    )}
                    {user?.custom_status && <p className="text-p-sm text-ink-gray-7">{user.custom_status}</p>}
                </div>
            )}

            {!isSelf && user?.enabled !== 0 && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => createDM(id)} disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    {_("Message")}
                </Button>
            )}
        </div>
    )
}

export const ChannelMention = ({ id, fallback }: { id: string; fallback?: string }) => {
    const { channel } = useChannel(id)
    const label = channel?.channel_name || fallback || id

    // Unknown channel (not a member / archived / stale) → non-navigable span,
    // so we never render a link that 404s.
    if (!channel) {
        return (
            <span className="mention" data-type="channelMention" data-id={id}>
                #{label}
            </span>
        )
    }

    const to = channel.workspace ? `/${channel.workspace}/${id}` : `/${id}`
    return (
        <NavLink to={to} className="mention" data-type="channelMention" data-id={id}>
            #{label}
        </NavLink>
    )
}
