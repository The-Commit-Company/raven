import { X } from "lucide-react"
import type { Message } from "@raven/types/common/Message"
import { Button } from "@components/ui/button"
import { cn } from "@lib/utils"
import _ from "@lib/translate"
import { RepliedMessagePreview, type RepliedMessageDetails } from "@components/features/message/renderers/RepliedMessagePreview"

/** Map the live target Message to the snapshot shape the shared preview expects. */
const toDetails = (message: Message): RepliedMessageDetails => ({
    text: message.text ?? "",
    content: message.content ?? "",
    file: (message as Message & { file?: string }).file ?? "",
    message_type: message.message_type,
    owner: message.owner,
    creation: message.creation,
})

/**
 * Shown at the top of the composer while replying — the shared replied-message
 * preview plus a ✕ to cancel. The composer threads the target through the send as
 * linked_message; this is purely the contextual header.
 */
export const ReplyPreviewBanner = ({
    message,
    onCancel,
    showFormatting,
}: {
    message: Message
    onCancel: () => void
    showFormatting: boolean
}) => {
    return (
        <div className={cn("flex items-start gap-2 bg-surface-gray-1 px-3 py-2.5", showFormatting && "m-2 rounded")}>
            <div className="min-w-0 flex-1 border-l-2 border-outline-gray-3 pl-2">
                <RepliedMessagePreview details={toDetails(message)} />
            </div>
            <Button type="button" variant="ghost" size="xs" isIconButton aria-label={_("Cancel reply")} onClick={onCancel}>
                <X />
            </Button>
        </div>
    )
}
