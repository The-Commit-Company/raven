import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';

export default function SavedMessages() {

    const { colors } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Saved messages',
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
            <Text>Saved messages</Text>
        </View>
    </>
}