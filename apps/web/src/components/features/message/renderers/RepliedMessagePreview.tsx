import { RavenMessage } from "@raven/types/RavenMessaging/RavenMessage"
import { useUser } from "@hooks/useUser"
import { ChartColumnIcon } from "lucide-react"
import FileTypeIcon from "@components/common/FileIcons/FileTypeIcon"
import { getFileExtension, getFileName } from "@raven/lib/utils/operations"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card"
import parse from "html-react-parser"
import _ from "@lib/translate"

/** The snapshot of a replied-to message (matches the backend's replied_message_details JSON). */
export interface RepliedMessageDetails {
    text: string
    content: string
    file: string
    message_type: RavenMessage["message_type"]
    owner: string
    creation: string
}

/**
 * The "what you're replying to" preview — sender line + a by-type summary (poll /
 * file / image / text). Shared by the message stream (ReplyMessage, a clickable
 * quote) and the composer (ReplyPreviewBanner, with a cancel button) so a replied
 * message reads identically in both. Callers own the surrounding chrome (quote bar
 * / card / click target / ✕).
 */
export const RepliedMessagePreview = ({ details }: { details: RepliedMessageDetails }) => {
    const user = useUser(details.owner)

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs-medium text-ink-gray-5">
                {_("Replying to {0}", [user?.full_name || user?.name || details.owner])}
            </span>
            <div className="text-xs text-ink-gray-5">
                {details.message_type === "Poll" && (
                    <span className="flex items-center">
                        <ChartColumnIcon className="inline mr-1 h-5 w-5 pb-0.5" />
                        <span className="line-clamp-2 text-p-sm">Poll: {details.content.split("\n")[0]}</span>
                    </span>
                )}

                {details.message_type === "File" && (
                    <span className="flex items-center gap-2">
                        <FileTypeIcon fileType={getFileExtension(details.file ?? "")} size="md" />
                        <span className="line-clamp-2 text-p-sm">{getFileName(details.file)}</span>
                    </span>
                )}

                {details.message_type === "Image" && (
                    <span className="flex items-center gap-2">
                        <HoverCard>
                            <HoverCardTrigger>
                                <img src={details.file} alt={getFileName(details.file)} className="w-6 h-6 rounded-sm" />
                            </HoverCardTrigger>
                            <HoverCardContent className="p-0">
                                <img src={details.file} alt={getFileName(details.file)} className="w-full h-full object-cover rounded-lg" />
                            </HoverCardContent>
                        </HoverCard>
                        <span className="line-clamp-2 text-p-sm">{getFileName(details.file)}</span>
                    </span>
                )}

                {details.text && (
                    <span className="line-clamp-2 text-p-sm">{parse(details.content)}</span>
                )}
            </div>
        </div>
    )
}
