import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {}

const OfflineBanner = (props: Props) => {
    return (
        <SafeAreaView edges={['top', 'left', 'right']} className='bg-card-foreground py-2'>
            <Text className='text-sm text-center text-background'>The app is offline. Please check your internet connection.</Text>
        </SafeAreaView>
    )
}

export default OfflineBanner