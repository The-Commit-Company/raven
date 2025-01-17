import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { View } from 'react-native';
import { SearchInput } from '@components/nativewindui/SearchInput';
import { Text } from '@components/nativewindui/Text';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';

export default function BrowseChannels() {

    const { colors } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Browse channels',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex-1">
            <View className="p-3">
                <SearchInput style={{ backgroundColor: colors.grey5 }}
                    placeholder="Search"
                    iconColor={colors.destructive}
                    placeholderTextColor={colors.grey} />
            </View>
            <ChannelFilter />
        </View>
    </>
}

const ChannelFilter = () => {
    const { colors } = useColorScheme()
    return <View className="flex flex-row px-4 gap-2 items-center">
        <Text className="text-sm">Show:</Text>
        <View className="flex flex-row items-center gap-1">
            <Text className="text-sm">All channels</Text>
            <ChevronDownIcon fill={colors.icon} height={20} width={20} />
        </View>
    </View>
}