import { X } from "lucide-react"
import { Button } from "@components/ui/button"
import { ScrollArea } from "@components/ui/scroll-area"

interface ThreadViewDrawerProps {
    threadID: string
    onClose: () => void
}

export default function ThreadViewDrawer({ threadID, onClose }: ThreadViewDrawerProps) {
    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between pl-4 pr-2 py-2 border-b border-border shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <h2 className="text-sm font-medium">Thread</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onClose}
                    aria-label="Close thread"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Thread Messages */}
            <ScrollArea className="flex-1">
                <div className="flex items-center justify-center min-h-[500px] px-6 text-center">
                    <p className="text-[13px] text-muted-foreground">Thread messages will appear here</p>
                </div>
            </ScrollArea>
        </div>
    )
}
