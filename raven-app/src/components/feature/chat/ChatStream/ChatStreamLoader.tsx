import { Separator, Skeleton } from '@radix-ui/themes'

const ChatStreamLoader = () => {
    return (
        <div className='py-4 animate-fadein'>
            <MessageItemLoader isContinuation={true} isShortText />
            <MessageItemLoader isContinuation={false} isImage />
            <MessageItemLoader isContinuation={false} isShortText />
            <MessageItemLoader isContinuation={true} isImage />
            <MessageItemLoader isContinuation={false} isLongText />
        </div>
    )
}

interface MessageProperties {
    isContinuation: boolean
    isShortText?: boolean,
    isLongText?: boolean,
    isImage?: boolean,
}
const MessageItemLoader = ({ isContinuation, isShortText, isImage, isLongText }: MessageProperties) => {

    return <div className='flex items-start gap-3 p-2'>
        {/* Message Left Element - Avatar or Date */}
        <div className='w-8 flex items-center'>
            {isContinuation ? <div></div> : <MessageLeftElementLoader />}
        </div>

        <div className='flex flex-col gap-1.5 justify-center'>
            {/* User name and time */}
            {!isContinuation && <div className='flex items-center gap-2 -mt-1'>
                <Skeleton className='rounded-md w-32 h-5' />
                <Separator orientation='vertical' />
                <Skeleton className='rounded-md w-16 h-5' />
            </div>}

            {isShortText && <div className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-48 h-5' />
                <Skeleton className='rounded-md w-64 h-5' />
            </div>}

            {isLongText && <div className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-80 h-5' />
                <Skeleton className='rounded-md w-64 h-5' />
                <Skeleton className='rounded-md w-72 h-5' />
                <Skeleton className='rounded-md w-48 h-5' />
            </div>}

            {isImage && <div className='gap-1 flex flex-col'>
                <Skeleton className='rounded-md w-96 h-64' />
            </div>}
        </div>
    </div>

}
const MessageLeftElementLoader = () => {
    return <Skeleton className='w-8 h-8 rounded-md' />
}


export default ChatStreamLoader