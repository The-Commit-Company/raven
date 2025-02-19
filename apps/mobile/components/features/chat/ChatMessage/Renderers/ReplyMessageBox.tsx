import { Pressable, View, ViewProps } from "react-native";
import { Text } from '@components/nativewindui/Text';
import { Image } from "expo-image";
import parse from 'html-react-parser';
import { getFileName } from "@raven/lib/utils/operations";
import { useGetUser } from "@raven/lib/hooks/useGetUser";
import useFileURL from "@hooks/useFileURL";
import BarChart from '@assets/icons/BarChart.svg';
import { formatDateAndTime } from "@raven/lib/utils/dateConversions";
import { useColorScheme } from "@hooks/useColorScheme";
import UniversalFileIcon from "@components/common/UniversalFileIcon";
import { useMemo } from "react";

type ReplyMessageBoxProps = ViewProps & {
    message: any
    onPress?: () => void
}

const ReplyMessageBox = ({ message, children, onPress }: ReplyMessageBoxProps) => {

    const { bot, owner, creation, message_type, content, file } = message
    const username = bot || owner
    const user = useGetUser(username)
    const userFullName = user?.full_name || username
    const source = useFileURL(file ?? "")
    const { colors } = useColorScheme()

    const fileName = useMemo(() => getFileName(file ?? ""), [file])
    const formattedDate = useMemo(() => formatDateAndTime(creation), [creation])

    const renderMessageContent = () => {
        switch (message_type) {
            case 'Poll':
                return (
                    <View className="flex-row items-start gap-1">
                        <BarChart width={18} height={18} fill={colors.icon} />
                        <Text className="text-[15px] line-clamp-2 text-ellipsis overflow-hidden">
                            Poll: {content?.split("\n")?.[0]}
                        </Text>
                    </View>
                )
            case 'File':
            case 'Image':
                return (
                    <View className={`flex-row items-start ${message_type === 'Image' ? 'gap-2' : 'gap-1'}`}>
                        {message_type === 'Image' ? (
                            <Image
                                source={source}
                                alt={`Image sent by ${owner}`}
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 4,
                                }}
                                contentFit="cover"
                                transition={200}
                            />
                        ) : (
                            <UniversalFileIcon width={18} height={18} fileName={fileName} />
                        )}
                        <View className="flex-row items-start gap-1">
                            <Text className="text-[15px] line-clamp-2 text-ellipsis overflow-hidden">
                                {fileName}
                            </Text>
                        </View>
                    </View>
                )
            default:
                return <Text className="text-[15px] line-clamp-2 text-ellipsis overflow-hidden">{parse(content ?? '')}</Text>
        }
    }

    return (
        <Pressable
            onPress={onPress}
            className='flex-1 p-2 w-full border border-border rounded-md ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <View className="border-l-2 border-border pl-2 gap-2">
                <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium" numberOfLines={1}>
                        {userFullName}
                    </Text>
                    <Text className="text-[13px] text-muted-foreground">
                        {formattedDate}
                    </Text>
                </View>
                <View>{renderMessageContent()}</View>
                {children}
            </View>
        </Pressable>
    )
}

export default ReplyMessageBox