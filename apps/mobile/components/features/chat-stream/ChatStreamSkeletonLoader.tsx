import Skeleton from '@components/layout/Skeleton'
import { View } from 'react-native'

const ChatStreamSkeletonLoader = () => {
    return (
        <View className='flex-1 py-4 px-2'>
            <MessageItemLoader isContinuation={true} isShortText />
            <MessageItemLoader isContinuation={false} isImage />
            <MessageItemLoader isContinuation={false} isShortText />
            <MessageItemLoader isContinuation={false} isLongText />
            <MessageItemLoader isContinuation={false} isShortText />
        </View>
    )
}

interface MessageProperties {
    isContinuation: boolean
    isShortText?: boolean,
    isLongText?: boolean,
    isImage?: boolean,
}
const MessageItemLoader = ({ isContinuation, isShortText, isImage, isLongText }: MessageProperties) => {

    return <View className='flex-row items-start gap-3 p-2'>
        {/* Message Left Element - Avatar or Date */}
        <View className='w-8 flex items-center'>
            {isContinuation ? <View></View> : <MessageLeftElementLoader />}
        </View>

        <View className='flex flex-col gap-1.5 justify-center'>
            {/* User name and time */}
            {!isContinuation && <View className='flex-row items-center gap-2'>
                <Skeleton className='rounded-md w-32 h-5' />
                <Skeleton className='rounded-md w-16 h-5' />
            </View>}

            {isShortText && <View className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-48 h-5' />
                <Skeleton className='rounded-md w-64 h-5' />
            </View>}

            {isLongText && <View className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-80 h-5' />
                <Skeleton className='rounded-md w-64 h-5' />
                <Skeleton className='rounded-md w-72 h-5' />
                <Skeleton className='rounded-md w-48 h-5' />
            </View>}

            {isImage && <View className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-72 h-64' />
            </View>}
        </View>
    </View>

}
const MessageLeftElementLoader = () => {
    return <Skeleton className='w-10 h-10 rounded-md' />
}


export default ChatStreamSkeletonLoader