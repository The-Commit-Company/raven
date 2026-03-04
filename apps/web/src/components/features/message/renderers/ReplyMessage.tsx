import { RavenMessage } from "@raven/types/RavenMessaging/RavenMessage"
import { useUser } from "@hooks/useUser"
import { ChartColumnIcon } from "lucide-react"
import FileTypeIcon from "@components/common/FileIcons/FileTypeIcon"
import { getFileExtension, getFileName } from "@raven/lib/utils/operations"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card"
import parse from 'html-react-parser';

interface RepliedMessageDetails {
    text: string,
    content: string,
    file: string,
    message_type: RavenMessage["message_type"],
    owner: string,
    creation: string,
}

export default function ReplyMessage({
    repliedMessage
}: {
    repliedMessage: RepliedMessageDetails
}) {

    const { data: user } = useUser(repliedMessage.owner)

    return (
        <div className="py-0.5">
            <div className="border-l-2 cursor-pointer border-gray-500 bg-muted/60 pl-3 py-2 flex flex-col gap-1" role='button'>
                <span className="text-xs text-muted-foreground font-medium">
                    Replying to {user?.full_name || user?.name || repliedMessage.owner}
                </span>
                <div className="text-xs text-muted-foreground">
                    {repliedMessage.message_type === "Poll" &&
                        <span className="flex items-center">
                            <ChartColumnIcon className="inline mr-1 h-5 w-5 pb-0.5" />
                            <span className="line-clamp-2">Poll: {repliedMessage.content.split("\n")[0]}</span>
                        </span>}


                    {repliedMessage.message_type === "File" && (
                        <span className="flex items-center gap-2">
                            <FileTypeIcon
                                className="rounded-sm"
                                fileType={getFileExtension(repliedMessage.file ?? "")}
                                size="xs"
                            />
                            <span className="line-clamp-2">{getFileName(repliedMessage.file)}</span>
                        </span>
                    )}

                    {repliedMessage.message_type === "Image" && (
                        <span className="flex items-center gap-2">
                            <HoverCard>
                                <HoverCardTrigger>
                                    <img src={repliedMessage.file} alt={getFileName(repliedMessage.file)} className="w-6 h-6 rounded-sm" />
                                </HoverCardTrigger>
                                <HoverCardContent className="p-0">
                                    <ImagePreview image={repliedMessage.file} />
                                </HoverCardContent>
                            </HoverCard>
                            <span className="line-clamp-2">{getFileName(repliedMessage.file)}</span>
                        </span>
                    )}

                    {repliedMessage.text && (
                        <span className="line-clamp-2">{parse(repliedMessage.content)}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

const ImagePreview = ({ image }: { image: string }) => {

    return (
        <img src={image} alt={getFileName(image)} className="w-full h-full object-cover rounded-lg" />
    )
}