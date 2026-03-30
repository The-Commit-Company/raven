import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@components/ui/dialog"
import { Button } from "@components/ui/button"
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner"
import { Label } from "@components/ui/label"
import { Hash } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { useChannelTypeInfo } from "@components/features/channel/CreateChannel/useChannelTypeInfo"
import type { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"

interface ConvertThreadToChannelDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    threadId: string
    /** Callback after successful convert (e.g. invalidate messages) */
    onSuccess?: (newChannelId: string) => void
}

const CHANNEL_TYPES: { value: RavenChannel["type"]; label: string }[] = [
    { value: "Private", label: "Private" },
    { value: "Public", label: "Public" },
    { value: "Open", label: "Open" },
]

export function ConvertThreadToChannelDialog({
    open,
    onOpenChange,
    threadId,
    onSuccess,
}: ConvertThreadToChannelDialogProps) {
    const [channelName, setChannelName] = useState("")
    const [channelType, setChannelType] = useState<RavenChannel["type"]>("Private")
    const { call, loading } = useFrappePostCall("raven.api.threads.convert_thread_to_channel")
    const { helperText } = useChannelTypeInfo(channelType)

    const handleConvert = async () => {
        const name = channelName.trim()
        if (!name || name.length < 3) {
            toast.error("Channel name must be at least 3 characters")
            return
        }
        try {
            const res = await call({
                thread_id: threadId,
                channel_name: name,
                channel_type: channelType,
            })
            const channelId = (res as { channel_id?: string })?.channel_id
            toast.success("Thread converted to channel")
            onOpenChange(false)
            setChannelName("")
            setChannelType("Private")
            if (channelId) onSuccess?.(channelId)
        } catch {
            toast.error("Failed to convert thread to channel")
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        setChannelName("")
        setChannelType("Private")
    }

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Convert thread to channel
                    </DialogTitle>
                    <DialogDescription>
                        Create a new channel from this thread. All thread participants will become
                        channel members and the thread messages will be copied into the new channel.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="channel-name">Channel name</Label>
                        <input
                            id="channel-name"
                            type="text"
                            placeholder="e.g. project-alpha"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                            minLength={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Letters, numbers and hyphens only. At least 3 characters.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Channel type</Label>
                        <RadioGroup
                            value={channelType}
                            onValueChange={(v) => setChannelType(v as RavenChannel["type"])}
                            className="flex gap-4"
                            aria-label="Select channel type"
                        >
                            {CHANNEL_TYPES.map((t) => (
                                <div key={t.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={t.value} id={t.value} />
                                    <Label
                                        htmlFor={t.value}
                                        className="flex cursor-pointer items-center gap-2 font-normal"
                                    >
                                        <ChannelIcon type={t.value} className="h-4 w-4 text-muted-foreground" />
                                        {t.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground min-h-10">{helperText}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConvert}
                        disabled={!channelName.trim() || channelName.trim().length < 3 || loading}
                    >
                        {loading ? "Converting…" : "Convert to channel"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
