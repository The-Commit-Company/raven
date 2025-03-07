import { FileMessage, Message, PollMessage, TextMessage } from "../../../../../../../types/Messaging/Message"
import { Box, Flex, FlexProps, Separator, Text } from "@radix-ui/themes"
import { useGetUser } from "@/hooks/useGetUser"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { getFileExtension, getFileName } from "@/utils/operations"
import { clsx } from "clsx"
import parse from 'html-react-parser';
import { MdOutlineBarChart } from "react-icons/md"

type ReplyMessageBoxProps = FlexProps & {
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
        <Flex className={clsx('p-2 items-start bg-white border border-gray-5 shadow-sm dark:bg-gray-3 dark:border-gray-6 rounded-md overflow-hidden', className)} {...props}>
            <Flex gap='1' direction='column' className="border-l-2 pl-2 border-gray-8">
                <Flex gap='2' align='center'>
                    <Text as='span' size='1' weight='medium' truncate>{user?.full_name ?? message.owner}</Text>
                    <Separator orientation='vertical' />
                    <Text as='span' size='1' color='gray'>
                        {message.creation && <DateMonthAtHourMinuteAmPm date={message.creation} />}
                    </Text>
                </Flex>
                <Box className="max-w-[75vw]">
                    {message.message_type === 'Poll' ? <Text as='span' size='2' className="line-clamp-2 flex items-center">
                        <MdOutlineBarChart size='14' className="inline mr-1" />
                        Poll: {(message as PollMessage).content?.split("\n")?.[0]}</Text>
                        :
                        ['File', 'Image'].includes(message.message_type ?? 'Text') ?
                            <Flex gap='2' align='center'>
                                {message.message_type === 'File' && message.file && <FileExtensionIcon ext={getFileExtension(message.file)} size='18' />}
                                {message.message_type === 'Image' && <img src={message.file} alt={`Image sent by ${message.owner}`} height='30' width='30' className="object-cover rounded-md" />}

                                <Text as='span' size='2'>{getFileName((message as FileMessage).file)}</Text>
                            </Flex>
                            : <Text as='span' size='2' className="line-clamp-2 text-ellipsis">{parse((message as TextMessage).content ?? '')}</Text>
                    }
                </Box>
            </Flex>
            {children}
        </Flex>
    )
}