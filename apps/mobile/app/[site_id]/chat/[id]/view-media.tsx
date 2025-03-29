import CommonErrorBoundary from '@components/common/CommonErrorBoundary';
import Media from '@components/features/media/Media';
import { View } from 'react-native';

export default function ViewFiles() {

    return (
        <View className='flex-1'>
            <Media />
        </View>
    )
}

export const ErrorBoundary = CommonErrorBoundary