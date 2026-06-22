import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ChevronLeft, Pin, Star } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtomValue } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useOpenChannelDrawer } from "@hooks/useChannelDrawer"
import { useNavigate, useParams } from "react-router-dom"
import { useChannel } from "@hooks/useChannel"
import _ from "@lib/translate"

interface ChannelHeaderProps {
    /** Override the URL-derived channel id. Used when this header is rendered outside
     * a `/:workspaceID/:id` route (eg. notifications view) and `useCurrentChannelID`
     * would otherwise fall back to `"general"`. */
    channelID: string
}

const ChannelHeader = ({ channelID }: ChannelHeaderProps) => {
    const { channel, toggleStarChannel, isStarred } = useChannel(channelID)
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const pinnedCount = channel?.pinned_messages_string ? channel.pinned_messages_string.split("\n").length : 0

    const drawerType = useAtomValue(channelDrawerAtom(channelID))
    const setDrawerType = useOpenChannelDrawer(channelID)

    const onOpenMembers = () => {
        setDrawerType(drawerType === 'members' ? '' : 'members')
    }

    const onOpenPins = () => {
        setDrawerType('pins')
    }

    return (
        <div
            className="flex w-full shrink-0 items-center justify-between border-b border-outline-gray-2 bg-surface-base h-11 px-2"
        >
            <div className="flex items-center justify-center md:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={() => navigate(`/${workspaceID ?? ''}`)}
                    aria-label={_('Back')}
                >
                    <ChevronLeft />
                </Button>
            </div>

            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" isIconButton className={isStarred ? "text-yellow-500" : ""} aria-label={_('Star')} onClick={toggleStarChannel}>
                                <Star className={isStarred ? "fill-yellow-500" : ""} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {_('Star')}
                        </TooltipContent>
                    </Tooltip>

                    <ChannelMenu channelID={channelID} />

                    {pinnedCount > 0 && <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={onOpenPins}>
                                <Pin className="h-2 w-2 text-ink-gray-8/80" />
                                <span className="sr-only">{_('Pinned')}</span>
                                <span className="text-ink-gray-4 text-sm font-normal">{pinnedCount}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_('Pinned Messages')}</p>
                        </TooltipContent>
                    </Tooltip>}
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" isIconButton>
                            <Headset className="h-4 w-4 md:h-3 md:w-3 text-ink-gray-8/80" />
                            <span className="sr-only">{_('Start call')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{_('Start call')}</p>
                    </TooltipContent>
                </Tooltip> */}
                <ChannelMembers onClick={onOpenMembers} channelID={channelID} />
            </div>
        </div>
    )
}

export default ChannelHeader