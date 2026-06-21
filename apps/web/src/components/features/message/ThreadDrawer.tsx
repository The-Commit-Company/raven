import { X, MoreVertical, Bell, LogOut, Trash2 } from "lucide-react"
import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import ChatInput from "@components/features/ChatInput/ChatInput"
import ChatStream from "@components/features/message/ChatStream"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useChannelById } from "@stores/channels/useChannelList"
import { useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate, useParams } from "react-router-dom"

/** Rendered as a child route (`:id/thread/:threadID`) inside the chat view's drawer slot. */
export default function ThreadDrawer() {
    // A thread IS a channel (its id = the original message id), so the stream + composer
    // target the threadID. The parent channel (the route :id) is only used to inherit
    // DM status for the composer's mention banner (thread channels aren't in the store).
    const { threadID } = useParams<{ threadID: string }>()
    const parentID = useCurrentChannelID()
    const parentIsDM = useChannelById(parentID)?.is_direct_message === 1
    const threadInputRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()

    const handleClose = () => {
        // Route-relative: from `:id/thread/:threadID` back to the parent `:id` route
        navigate("..", { replace: true })
    }

    useHotkeys("esc", handleClose, { enableOnFormTags: true })

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <h2 className="text-sm font-medium">Thread</h2>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconButton
                                aria-label="Thread settings"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                            <DropdownMenuItem onClick={() => console.log("Toggle notifications")}>
                                <Bell className="h-4 w-4 mr-2" />
                                Enable Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Leave thread")}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Leave Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Delete thread")}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Thread
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        onClick={handleClose}
                        aria-label="Close thread"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Thread messages — ChatStream owns its own scroll/virtualization */}
            {threadID && <ChatStream channelID={threadID} />}

            {/* Message input — posts into the thread channel */}
            <div className="shrink-0">
                {threadID && <ChatInput channelID={threadID} ref={threadInputRef} isDirectMessage={parentIsDM} />}
            </div>
        </div>
    )
}
