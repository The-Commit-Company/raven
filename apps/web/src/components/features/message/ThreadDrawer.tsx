import { X, MoreVertical, Bell, LogOut, Trash2 } from "lucide-react"
import { Button } from "@components/ui/button"
import { ScrollArea } from "@components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import ChatInput from "@components/features/ChatInput/ChatInput"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function ThreadDrawer() {
    const channelID = useCurrentChannelID()
    const threadInputRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    const handleClose = () => {
        // Navigate back to channel (remove /thread/:threadID from URL)
        const basePath = location.pathname.replace(/\/thread\/[^/]+$/, '')
        navigate(basePath, { replace: true })
    }

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
                                size="icon"
                                className="h-7 w-7"
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
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleClose}
                        aria-label="Close thread"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Thread Messages */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col px-4 pb-8 space-y-5">
                </div>
            </ScrollArea>

            {/* Message input */}
            <div className="shrink-0">
                <ChatInput channelID={channelID} ref={threadInputRef} />
            </div>
        </div>
    )
}
