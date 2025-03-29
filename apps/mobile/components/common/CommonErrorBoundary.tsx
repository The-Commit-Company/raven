import { Link, type ErrorBoundaryProps } from 'expo-router';
import { Text } from '@components/nativewindui/Text';
import { TouchableOpacity, View } from 'react-native';
import ErrorIcon from '@assets/icons/ErrorIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme';

export function CommonErrorBoundary({ error, retry }: ErrorBoundaryProps) {

    const { colors } = useColorScheme()

    return (
        <View className='flex-1 gap-2 justify-center items-center bg-background'>
            <ErrorIcon width={100} height={100} fill={colors.icon} />
            <Text className='text-foreground text-xl font-semibold'>There was an unexpected error</Text>
            <Text className='text-foreground'>{error.message}</Text>
            <View className='flex items-center gap-2 pt-4'>
                <TouchableOpacity onPress={retry} className='bg-foreground rounded-lg px-4 py-2'>
                    <Text className='text-background'>Reload This Page</Text>
                </TouchableOpacity>
                <Link href="https://github.com/The-Commit-Company/raven/issues" target='_blank' className='bg-card-background rounded-lg px-4 py-2'>
                    <Text className='text-foreground'>Report Issue on GitHub</Text>
                </Link>
            </View>
        </View>
    );
}

type Props = {}


const ErrorFallback = () => {
    return <View>
        <Text className='text-foreground'>Error</Text>
    </View>
}
export default CommonErrorBoundary