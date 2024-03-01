import { FileMessage, Message, TextMessage } from "../../../../../../../types/Messaging/Message"
import { Box, Flex, Separator, Text } from "@radix-ui/themes"
import { useGetUser } from "@/hooks/useGetUser"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { getFileExtension, getFileName } from "@/utils/operations"
import { FlexProps } from "@radix-ui/themes/dist/cjs/components/flex"
import { clsx } from "clsx"
import parse from 'html-react-parser';
interface ReplyMessageBoxProps extends FlexProps {
    message: Partial<Message>
}
/**
 * UI component to show the message being replied to
 * @param props 
 * @returns 
 */
export const ReplyMessageBox = ({ message, children, className, ...props }: ReplyMessageBoxProps) => {

    const user = useGetUser(message.owner)
    return (
        <Flex className={clsx('p-2 items-start bg-white border border-gray-5 shadow-sm dark:bg-gray-1 dark:border-gray-7 rounded-md', className)} {...props}>
            <Flex gap='1' direction='column' className="border-l-2 pl-2 border-gray-8">
                <Flex gap='2' align='center'>
                    <Text as='span' size='1' weight='medium'>{user?.full_name ?? message.owner}</Text>
                    <Separator orientation='vertical' />
                    <Text as='span' size='1' color='gray'>
                        {message.creation && <DateMonthAtHourMinuteAmPm date={message.creation} />}
                    </Text>
                </Flex>
                <Box className="max-w-3xl">
                    {['File', 'Image'].includes(message.message_type ?? 'Text') ?
                        <Flex gap='2' align='center'>
                            {message.message_type === 'File' && message.file && <FileExtensionIcon ext={getFileExtension(message.file)} size='18' />}
                            {message.message_type === 'Image' && <img src={message.file} alt={`Image sent by ${message.owner}`} height='30' width='30' className="object-cover rounded-md" />}
                            <Text as='span' size='2'>{getFileName((message as FileMessage).file)}</Text>
                        </Flex>
                        : <Text as='span' size='2' className="line-clamp-2">{parse((message as TextMessage).content ?? '')}</Text>
                    }
                </Box>
            </Flex>
            {children}
        </Flex>
    )
}