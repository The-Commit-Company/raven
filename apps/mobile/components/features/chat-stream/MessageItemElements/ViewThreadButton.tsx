import { Text } from '@components/nativewindui/Text'
import { Message } from '@raven/types/common/Message'
import { Link } from 'expo-router'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
    message: Message
}

const ViewThreadButton = ({ message }: Props) => {
    const { t } = useTranslation()
    return <Link href={`../../thread/${message.name}`} relativeToDirectory asChild>
        <Pressable hitSlop={10} className='flex flex-row items-center gap-3 border border-border bg-background rounded-lg px-3 py-2 active:bg-card-background/40'>
            <ThreadReplyCount message={message} />
            <Text className='text-sm text-muted-foreground/80'>{t('messages.viewThread')}</Text>
        </Pressable>
    </Link>
}


const ThreadReplyCount = ({ message }: Props) => {
    const { t } = useTranslation()
    const { data } = useFrappeGetCall<{ message: number }>("raven.api.threads.get_number_of_replies", {
        thread_id: message.name
    }, ["thread_reply_count", message.name], {
        revalidateOnFocus: true,
        revalidateOnMount: true,
        refreshInterval: 0,
        shouldRetryOnError: false
    })
    return <Text className='text-sm text-primary dark:text-secondary font-semibold'>{data?.message === 1 ? t('messages.replyCount') : t('messages.repliesCount', { count: data?.message ?? 0 })}</Text>
}

export default ViewThreadButton