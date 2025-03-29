import { Button } from "@components/nativewindui/Button";
import { Text } from "@components/nativewindui/Text";
import { useColorScheme } from "@hooks/useColorScheme";
import { Link, Stack } from "expo-router";
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { Platform, View } from "react-native";
import PinnedMessageList from "@components/features/pinned-messages/PinnedMessageList";
import PinOutlineIcon from "@assets/icons/PinOutlineIcon.svg";
import CommonErrorBoundary from "@components/common/CommonErrorBoundary";
const PinnedMessages = () => {

    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: colors.background },
                    headerLeft: Platform.OS === 'ios' ? () => {
                        return (
                            <Link asChild href="../" relativeToDirectory>
                                <Button variant="plain" className="ios:px-0" hitSlop={10}>
                                    <CrossIcon color={colors.icon} height={24} width={24} />
                                </Button>
                            </Link>
                        )
                    } : undefined,
                    headerTitle: () => (
                        <View className='flex-row items-center'>
                            <PinOutlineIcon height={18} width={18} stroke={colors.foreground} />
                            <Text className='ml-2 text-base font-semibold'>Pinned messages</Text>
                        </View>
                    ),
                }} />
            <PinnedMessageList />
        </>
    )
}

export default PinnedMessages;


export const ErrorBoundary = CommonErrorBoundary