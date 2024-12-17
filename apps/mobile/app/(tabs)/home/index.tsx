import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';

export default function Home() {
    return (
        <View className="flex flex-1 items-center justify-center">
            <Text className="text-4xl font-bold">Home</Text>
            <ThemeToggle />
        </View>
    )
}