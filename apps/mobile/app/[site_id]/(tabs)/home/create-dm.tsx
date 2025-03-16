import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { View } from 'react-native';
import SearchInput from '@components/common/SearchInput/SearchInput';

export default function CreateDM() {

    const { colors } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Create DM',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex-1">
            <View className="p-3">
                <SearchInput
                    value={''}
                    onChangeText={() => { }} />
            </View>
        </View>
    </>
}