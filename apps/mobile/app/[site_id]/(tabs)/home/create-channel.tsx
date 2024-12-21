import CreateChannelForm from '@components/features/chat/CreateChannel/CreateChannelForm';
import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';

export default function CreateChannel() {
    const { colors } = useColorScheme()
    return <>
        <Stack.Screen options={{
            title: 'Add channel',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            },
            headerRight() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0">
                            <Text className="text-primary">Add</Text>
                        </Button>
                    </Link>
                )
            },
        }} />
        <CreateChannelForm />
    </>
}