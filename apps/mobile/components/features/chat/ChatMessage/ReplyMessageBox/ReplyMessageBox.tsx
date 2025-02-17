import { Pressable, View, ViewProps } from "react-native"
import { Text } from '@components/nativewindui/Text'
import { Image } from "expo-image"
import clsx from 'clsx'
import parse from 'html-react-parser';
import { FileMessage, Message, PollMessage, TextMessage } from "@raven/types/common/Message"
import { getFileName } from "@raven/lib/utils/operations"
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import useFileURL from "@hooks/useFileURL"
import { Divider } from "@components/layout/Divider"
import BarChart from '@assets/icons/BarChart.svg'
import dayjs from "dayjs";

type ReplyMessageBoxProps = ViewProps & {
    message: Partial<Message>
    onPress?: () => void
}
/**
 * UI component to show the message being replied to
 * @param props
 * @returns
 */
const ReplyMessageBox = ({ message, children, className, onPress, ...props }: ReplyMessageBoxProps) => {

    const username = message.bot || message.owner

    const user = useGetUser(username)

    const userFullName = user?.full_name || username

    const source = useFileURL((message as FileMessage).file ?? "");

    return (

        <Pressable
            onPress={onPress}
            className='flex-1 w-[90%]'
        >
            <View className={clsx('p-2 items-start border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shadow-sm shadow-gray-100 dark:shadow-gray-800 rounded-md', className)} {...props}>
                <View className="border-l-2 pl-2 gap-2 border-gray-200 dark:border-gray-500">
                    <View
                        className="flex-row items-center justify-between gap-2 w-full"
                    >
                        <Text className="text-sm font-medium truncate w-1/2" numberOfLines={1}>{userFullName}</Text>
                        <Divider marginHorizontal={0} />
                        <Text className="text-xs text-gray-500">
                            {/* TODO: Format date */}
                            {/* {<DateMonthAtHourMinuteAmPm date={message.creation} />} */}
                            {dayjs(message.creation).format('hh:mm A (Do MMM)')}
                        </Text>
                    </View>
                    <View>
                        {message.message_type === 'Poll' ?
                            <View className="flex-row items-center gap-1">
                                <BarChart width={14} height={14} fill={'#6b7280'} />
                                <Text className="line-clamp-2 flex items-center text-sm font-medium">
                                    Poll: {(message as PollMessage).content?.split("\n")?.[0]}
                                </Text>
                            </View>
                            :
                            ['File', 'Image'].includes(message.message_type ?? 'Text') ?
                                <View className="flex-row items-center gap-2">
                                    {/* {message.message_type === 'File' && message.file && <FileExtensionIcon ext={getFileExtension(message.file)} size='18' />} */}
                                    {message.message_type === 'Image' &&
                                        <Image
                                            source={source}
                                            alt={`Image sent by ${message.owner}`}
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 4,
                                            }}
                                            contentFit="cover"
                                            transition={200}
                                        />}

                                    <Text className="text-sm font-medium">{getFileName((message as FileMessage).file)}</Text>
                                </View>
                                : <Text className="line-clamp-2">{parse((message as TextMessage).content ?? '')}</Text>
                        }
                    </View>
                    {children}
                </View>
            </View>
        </Pressable>
    )
}

export default ReplyMessageBox