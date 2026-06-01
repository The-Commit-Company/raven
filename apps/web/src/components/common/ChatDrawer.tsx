import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@components/ui/button"
import { ScrollArea } from "@components/ui/scroll-area"
import _ from "@lib/translate"

interface ChatDrawerProps {
    channelID: string
    /** Optional message to scroll to / highlight. Notifications pass this; thread view leaves empty. */
    messageID?: string
    onClose: () => void
}

export default function ChatDrawer({ channelID, messageID, onClose }: ChatDrawerProps) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [onClose])

    return (
        <div className="flex flex-col h-full bg-surface-white">
            <div className="flex items-center justify-between pl-4 pr-2 py-2 border-b border-outline-gray-2 shrink-0 bg-surface-white/95 backdrop-blur supports-backdrop-filter:bg-surface-white/60">
                <h2 className="text-sm font-medium">{_("Messages")}</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={onClose}
                    aria-label={_("Close")}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex items-center justify-center min-h-125 px-6 text-center">
                    <p className="text-sm text-ink-gray-4">{_("Messages will appear here")}</p>
                </div>
            </ScrollArea>
        </div>
    )
}
