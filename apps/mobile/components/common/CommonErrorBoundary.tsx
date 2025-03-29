import { Link, type ErrorBoundaryProps } from 'expo-router';
import { Text } from '@components/nativewindui/Text';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import ErrorIcon from '@assets/icons/ErrorIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme';
import { Divider } from '@components/layout/Divider';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard'

export function CommonErrorBoundary({ error, retry }: ErrorBoundaryProps) {

    const { colors } = useColorScheme()

    const onCopy = async () => {
        await Clipboard.setStringAsync(error.message + '\n' + error.stack)
        toast.success('Error trace copied to clipboard.')
    }

    return (
        <View className='flex-1 gap-2 py-8 px-4 justify-center items-center bg-background'>
            <ErrorIcon width={100} height={100} fill={colors.icon} />
            <Text className='text-foreground text-xl font-semibold'>There was an unexpected error</Text>
            <Text className='text-foreground'>{error.message}</Text>
            <View className='flex items-center gap-2 pt-4'>
                <TouchableOpacity onPress={retry} className='bg-foreground rounded-lg px-4 py-2'>
                    <Text className='text-background text-sm font-medium'>Reload This Page</Text>
                </TouchableOpacity>

                <View className='flex gap-2 items-center'>
                    <Link href="https://github.com/The-Commit-Company/raven/issues" target='_blank' className='bg-card-background rounded-lg px-4 py-2'>
                        <Text className='text-foreground text-sm font-medium'>Report Issue on GitHub</Text>
                    </Link>
                    <TouchableOpacity onPress={onCopy} className='bg-card-background rounded-lg px-4 py-2'>
                        <Text className='text-foreground text-center w-full text-sm font-medium'>
                            Copy Error
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Divider />
            <ScrollView>
                <Text className='text-muted-foreground text-xs'>
                    {error.stack}
                </Text>
            </ScrollView>
        </View>
    );
}
export default CommonErrorBoundary