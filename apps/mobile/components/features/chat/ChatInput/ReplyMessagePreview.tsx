import { Text } from "@components/nativewindui/Text"
import { Pressable, View } from "react-native"
import { selectedReplyMessageAtomFamily } from "@lib/ChatInputUtils"
import { useAtomValue, useSetAtom } from 'jotai'
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { formatDateAndTime } from "@raven/lib/utils/dateConversions"
import CrossIcon from "@assets/icons/CrossIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { FileMessage, ImageMessage, PollMessage } from "@raven/types/common/Message"
import UserAvatar from "@components/layout/UserAvatar"
import { getFileName } from "@raven/lib/utils/operations"
import UniversalFileIcon from "@components/common/UniversalFileIcon"
import BarChart from "@assets/icons/BarChart.svg"
import { useMemo } from "react"


const ReplyMessagePreview = ({ channelID, siteID }: { channelID: string, siteID: string }) => {
    const replyMessageDetails = useAtomValue(selectedReplyMessageAtomFamily(siteID + channelID))

    if (!replyMessageDetails) return null

    return <View className="px-2.5 relative">
        <View className="bg-card-background/30 rounded-lg p-2 gap-2">
            <View className="flex-row items-baseline gap-2">
                <UserDetails userID={replyMessageDetails.owner} />
                <Timestamp timestamp={replyMessageDetails.creation} />
            </View>
            {replyMessageDetails.message_type === 'Text' &&
                <TextMessageBlock text={replyMessageDetails.content ?? ""} />
            }
            {replyMessageDetails.message_type === 'Image' && replyMessageDetails.file &&
                <ImageMessageBlock message={replyMessageDetails} />
            }
            {replyMessageDetails.message_type === 'File' && replyMessageDetails.file &&
                <FileMessageBlock message={replyMessageDetails} />
            }
            {replyMessageDetails.message_type === 'Poll' &&
                <PollMessageBlock message={replyMessageDetails} />
            }
        </View>
        <View className="absolute -top-2 right-1.5 bg-background rounded-full p-0.5">
            <View className="bg-foreground rounded-full p-0.5">
                <CloseReplyButton siteID={siteID} channelID={channelID} />
            </View>

        </View>
    </View>
}

const TextMessageBlock = ({ text }: { text: string }) => {

    // If the text is too long without any spaces, it will break the layout
    // SO we need to add a space somewhere in the text to break it
    const textWithSpace = useMemo(() => {
        if (text.length > 32) {
            // If there's no space in the text, add a space
            if (!text.includes(" ")) {
                return text.slice(0, 32) + " " + text.slice(32)
            } else {
                return text
            }
        }

        return text

    }, [text])
    return <Text className="text-card-foreground text-base line-clamp-3 text-ellipsis">{textWithSpace}</Text>
}

const ImageMessageBlock = ({ message }: { message: ImageMessage }) => {

    return <View className="flex-row items-center gap-2">
        <UserAvatar
            src={message.file}
            alt={`Image sent by ${message.owner}`}
        />
        <TextMessageBlock text={getFileName(message.file)} />
    </View>
}

const FileMessageBlock = ({ message }: { message: FileMessage }) => {

    const fileName = getFileName(message.file)
    return <View className="flex-row items-center gap-2">

        <UniversalFileIcon
            fileName={fileName}
            width={20}
            height={20}
        />
        <TextMessageBlock text={fileName} />
    </View>
}

const PollMessageBlock = ({ message }: { message: PollMessage }) => {

    const { colors } = useColorScheme()

    const content = "Poll: " + (message.content ?? "").split("\n")[0]

    return <View className="flex-row items-center gap-2">
        <BarChart width={18} height={18} fill={colors.icon} />
        <TextMessageBlock text={content} />
    </View>
}

const CloseReplyButton = ({ siteID, channelID }: { siteID: string, channelID: string }) => {
    const { colors } = useColorScheme()

    const setReplyMessageDetails = useSetAtom(selectedReplyMessageAtomFamily(siteID + channelID))

    return <Pressable hitSlop={10} onPress={() => setReplyMessageDetails(null)}>
        <CrossIcon fill={colors.background} stroke={colors.background} width={14} height={14} />
    </Pressable>
}



const UserDetails = ({ userID }: { userID: string }) => {

    const user = useGetUser(userID)

    return <Text className="text-foreground font-medium text-[15px]">{user?.full_name ?? userID}</Text>

}

const Timestamp = ({ timestamp }: { timestamp: string }) => {

    const formattedTimestamp = formatDateAndTime(timestamp)
    return <Text className="text-muted-foreground font-light text-sm">{formattedTimestamp}</Text>
}

export default ReplyMessagePreview