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
import { ThreadPreviewCard } from "./ThreadPreviewCard"
import { ChannelSelect } from "@components/common/ChannelSelect/ChannelSelect"
import { useChannelList } from "@hooks/useChannelList"
import { useAllUsers } from "@hooks/useAllUsers"
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner"
import type { ForwardedThreadMetadata } from "@raven/types/common/Message"

export interface ForwardThreadData {
    threadId: string
    sourceChannelId: string
    isSourceDm: boolean
    sourceWorkspace?: string | null
    title: string
    messageCount: number
    rootMessageSnippet: string
    lastActivity: string
    lastMessageOwnerName: string
}

interface ForwardThreadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    threadData: ForwardThreadData
    /** Callback after successful forward (e.g. invalidate queries) */
    onSuccess?: () => void
}

export function ForwardThreadModal({
    open,
    onOpenChange,
    threadData,
    onSuccess,
}: ForwardThreadModalProps) {
    const [optionalText, setOptionalText] = useState("")
    const [selectedChannelId, setSelectedChannelId] = useState("")
    const { channels, dm_channels } = useChannelList()
    const availableUsers = useAllUsers({ enabled: open })
    const { call, loading } = useFrappePostCall("raven.api.raven_message.forward_thread")

    const meta: ForwardedThreadMetadata = {
        thread_id: threadData.threadId,
        source_channel_id: threadData.sourceChannelId,
        is_source_dm: threadData.isSourceDm,
        source_workspace: threadData.sourceWorkspace ?? null,
        title: threadData.title,
        message_count: threadData.messageCount,
        root_message_snippet: threadData.rootMessageSnippet,
        last_activity: threadData.lastActivity,
        last_message_owner_name: threadData.lastMessageOwnerName,
    }

    const handleForward = async () => {
        if (!selectedChannelId) return
        try {
            await call({
                target_channel_id: selectedChannelId,
                thread_root_message_id: threadData.threadId,
                source_channel_id: threadData.sourceChannelId,
                optional_text: optionalText.trim(),
                thread_title: threadData.title,
                message_count: threadData.messageCount,
                root_message_snippet: threadData.rootMessageSnippet,
                last_activity: threadData.lastActivity,
                last_message_owner_name: threadData.lastMessageOwnerName,
                is_source_dm: threadData.isSourceDm,
                source_workspace: threadData.sourceWorkspace ?? null,
            })
            toast.success("Thread forwarded successfully")
            onOpenChange(false)
            setOptionalText("")
            setSelectedChannelId("")
            onSuccess?.()
        } catch (err) {
            toast.error("Failed to forward thread")
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        setOptionalText("")
        setSelectedChannelId("")
    }

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next)
        if (!next) handleClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Forward thread</DialogTitle>
                    <DialogDescription>
                        Share this thread with another channel or DM. Recipients can click the preview
                        to open the thread in a new tab.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Thread preview
                        </label>
                        <ThreadPreviewCard meta={meta} clickable={false} compact />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Add a message (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Sharing this for visibility..."
                            value={optionalText}
                            onChange={(e) => setOptionalText(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Send to
                        </label>
                        <ChannelSelect
                            channels={channels}
                            dmChannels={dm_channels}
                            availableUsers={availableUsers}
                            value={selectedChannelId}
                            onValueChange={setSelectedChannelId}
                            placeholder="Search channels and DMs..."
                            excludeChannelId={threadData.sourceChannelId}
                            showLabel={false}
                            searchable={true}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleForward}
                        disabled={!selectedChannelId || loading}
                    >
                        {loading ? "Forwarding…" : "Forward thread"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
