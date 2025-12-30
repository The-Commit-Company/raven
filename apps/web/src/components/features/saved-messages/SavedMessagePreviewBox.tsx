import { cn } from "@lib/utils"
import { UserFields } from "@raven/types/common/UserFields"
import { Check, Clock, MoreVertical, ExternalLink } from "lucide-react"
import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { MessageItem } from "@components/features/message/renderers/MessageItem"
import { BaseThreadMessage } from "@components/common/BaseThreadMessage"
import { Message } from "@raven/types/common/Message"
import { useMemo } from "react"

interface SavedMessagePreviewBoxProps {
    message: Message
    user: UserFields | null
    channelName?: string
    channelIcon?: React.ReactNode
    participantUsers?: UserFields[]
    isDirectMessage?: boolean
    isThread?: boolean
    replyCount?: number
    formattedDate?: string
    onMarkComplete?: () => void
    onSetReminder?: (option: string) => void
    onArchive?: () => void
    onUnsave?: () => void
    hasReminder?: boolean
}

export const SavedMessagePreviewBox = ({
    message,
    user,
    channelName,
    channelIcon,
    participantUsers = [],
    isDirectMessage = false,
    isThread = false,
    replyCount = 0,
    formattedDate,
    onMarkComplete,
    onSetReminder,
    onArchive,
    onUnsave,
    hasReminder = false
}: SavedMessagePreviewBoxProps) => {
    const reminderOptions = [
        { label: "In 30 mins", value: "30m" },
        { label: "In 1 hour", value: "1h" },
        { label: "In 3 hours", value: "3h" },
        { label: "Tomorrow at 9:00 AM", value: "tomorrow" },
        { label: "Monday at 9:00 AM", value: "monday" },
        { label: "Custom...", value: "custom" },
    ]

    // Extract message content
    const messageContent = useMemo(() => {
        return message.text || message.content || ''
    }, [message.text, message.content])

    // Format participants for BaseThreadMessage
    const formattedParticipants = useMemo(() => {
        return participantUsers.map(u => ({
            id: u.name,
            name: u.full_name || u.name,
            image: u.user_image
        }))
    }, [participantUsers])

    return (
        <div
            className={cn(
                "group block px-6 py-4 hover:bg-accent/50 transition-colors relative border-b border-border"
            )}
        >
            {/* Connecting line from avatar to participants - only show for non-DM threads */}
            {!isDirectMessage && isThread && (
                <div className="absolute top-[80px] left-[40px] w-7 h-[calc(100%-6.75rem)] border-l border-b border-border rounded-bl-lg z-0" />
            )}

            {/* Channel info header */}
            {channelName && (
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    {channelIcon && (
                        <span>{channelIcon}</span>
                    )}
                    <span className="font-medium text-xs">{channelName}</span>
                    {formattedDate && (
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    )}
                </div>
            )}

            {/* Use BaseThreadMessage component for threads */}
            {isThread ? (
                <BaseThreadMessage
                    user={user}
                    messageContent={messageContent}
                    channelName={undefined}
                    channelIcon={undefined}
                    participants={formattedParticipants}
                    isDirectMessage={isDirectMessage}
                    replyCount={replyCount}
                    showConnectorLine={false}
                />
            ) : (
                /* Use MessageItem component for regular messages */
                <MessageItem message={message} />
            )}

            {/* Action buttons */}
            <div className="absolute top-4 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Go to channel</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation()
                                onMarkComplete?.()
                            }}
                        >
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark as complete</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <DropdownMenu>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Clock className={cn("h-3.5 w-3.5", hasReminder && "text-primary")} />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Set reminder</TooltipContent>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            {reminderOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onSetReminder?.(option.value)}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Tooltip>

                <Tooltip>
                    <DropdownMenu>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>More options</TooltipContent>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => onArchive?.()}>
                                Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onUnsave?.()}>
                                Unsave
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Tooltip>
            </div>
        </div>
    )
}
