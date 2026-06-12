import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ChevronLeft, Command, Headset, Pin, Star } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtom, useSetAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useNavigate, useParams } from "react-router-dom"
import { useChannel } from "@hooks/useChannel"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"
import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"

const ChannelHeader = () => {
    const channelID = useCurrentChannelID()
    const { channel, toggleStarChannel, isStarred } = useChannel(channelID)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const pinnedCount = channel?.pinned_messages_string ? channel.pinned_messages_string.split("\n").length : 0

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))
    const setCommandMenuOpen = useSetAtom(commandMenuOpenAtom)

    const onOpenMembers = () => {
        setDrawerType(drawerType === 'members' ? '' : 'members')
    }

    const onOpenPins = () => {
        setDrawerType('pins')
    }

    return (
        <div
            className="flex w-full shrink-0 items-center justify-between border-b bg-surface-white py-1.5 px-2"
        >
            {isMobile && (
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={() => navigate(`/${workspaceID ?? ''}`)}
                    aria-label={_('Back')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" isIconButton onClick={toggleStarChannel}>
                                <Star className={`h-3 w-3 text-ink-gray-8/80 ${isStarred ? "fill-amber-300 stroke-amber-300" : ""}`} />
                                <span className="sr-only">{_('Star')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_('Star')}</p>
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
                {isMobile && (
                    <>
                        <Button
                            variant="ghost"
                            size="md"
                            isIconButton
                            onClick={() => setCommandMenuOpen(true)}
                            aria-label={_("Command Menu")}
                        >
                            <Command className="h-4 w-4 text-ink-gray-7" />
                        </Button>
                    </>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" isIconButton>
                            <Headset className="h-4 w-4 md:h-3 md:w-3 text-ink-gray-8/80" />
                            <span className="sr-only">{_('Start call')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{_('Start call')}</p>
                    </TooltipContent>
                </Tooltip>
                <ChannelMembers onClick={onOpenMembers} channelID={channelID} />
            </div>
        </div>
    )
}

export default ChannelHeader