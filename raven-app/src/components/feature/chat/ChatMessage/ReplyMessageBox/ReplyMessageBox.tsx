import { FileMessage, Message, TextMessage } from "../../../../../../../types/Messaging/Message"
import { Box, Flex, Separator, Text } from "@radix-ui/themes"
import { useGetUser } from "@/hooks/useGetUser"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { getFileExtension, getFileName } from "@/utils/operations"
import { FlexProps } from "@radix-ui/themes/dist/cjs/components/flex"
import { clsx } from "clsx"
import { TruncatedTiptapRenderer } from "../Renderers/TiptapRenderer/TiptapRenderer"
import { useFrappeGetCall } from "frappe-react-sdk"
import { Loader } from "@/components/common/Loader"

interface ReplyMessageBoxProps extends FlexProps {
    message: Message
}
/**
 * UI component to show the message being replied to
 * @param props 
 * @returns 
 */
export const ReplyMessageBox = ({ message, children, className, ...props }: ReplyMessageBoxProps) => {

    const user = useGetUser(message.owner)
    return (
        <Flex className={clsx('p-2 items-start bg-white border border-gray-5 shadow-sm hover:border-iris-10 dark:bg-gray-1 dark:border-gray-7 dark:hover:border-iris-8 rounded-md', className)} {...props}>
            <Flex gap='1' direction='column' className="border-l-2 pl-2 border-gray-8">
                <Flex gap='2' align='center'>
                    <Text as='span' size='1' weight='bold'>{user?.full_name ?? message.owner}</Text>
                    <Separator orientation='vertical' />
                    <Text as='span' size='1' color='gray'>
                        <DateMonthAtHourMinuteAmPm date={message.creation} />
                    </Text>
                </Flex>
                <Box className="max-w-3xl">
                    {['File', 'Image'].includes(message.message_type) ?
                        <Flex gap='1'>
                            {message.message_type === 'File' && <FileExtensionIcon ext={getFileExtension(message.file)} />}
                            {message.message_type === 'Image' && <img src={message.file} alt={`Image sent by ${message.owner}`} height='30' width='30' className="object-cover" />}
                            <Text as='span'>{getFileName((message as FileMessage).file)}</Text>
                        </Flex>
                        : <TruncatedTiptapRenderer message={message as TextMessage} />
                    }
                </Box>
            </Flex>
            {children}
        </Flex>
    )
}

interface ReplyMessageProps extends FlexProps {
    messageID: string
}
/**
 * Component to fetch the message being replied to and show it in the UI
 */
export const ReplyMessage = ({ messageID, ...props }: ReplyMessageProps) => {

    const { data, isLoading } = useFrappeGetCall('raven.api.chat.get_reply_message_content', {
        message_id: messageID
    }, `reply_message_${messageID}`, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        revalidateOnReconnect: false
    })

    //TODO: Replace with a skeleton loader
    if (isLoading) return <Loader />

    if (data) return <ReplyMessageBox message={data.message} {...props} />

    return null

}