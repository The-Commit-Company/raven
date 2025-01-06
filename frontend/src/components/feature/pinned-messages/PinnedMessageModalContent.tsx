import { Dialog, Flex, IconButton, Text } from '@radix-ui/themes'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useParams } from 'react-router-dom'
import { Message } from '../../../../../types/Messaging/Message'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { MessageBox } from '../GlobalSearch/MessageBox'
import { IoClose } from 'react-icons/io5'

export const PinnedMessageModalContent = ({ onClose }: { onClose: () => void }) => {

    const { channelID } = useParams<{ channelID: string }>()

    const { data, error } = useFrappeGetCall<{ message: Message[] }>("raven.api.raven_message.get_pinned_messages", { 'channel_id': channelID }, undefined, {
        revalidateOnFocus: false
    })

    return (
        <>
            <Dialog.Title>
                <Flex justify={'between'} align={'center'}>
                    <Text>Pinned Messages</Text>
                    <IconButton variant='ghost' color='gray' aria-label='Close' onClick={onClose}>
                        <IoClose size='20' />
                    </IconButton>
                </Flex>
            </Dialog.Title>
            <ErrorBanner error={error} />
            <Flex direction='column' gap='3' justify='start'>
                {data?.message?.map((message) => {
                    return (
                        <MessageBox key={message.name} message={message} />
                    )
                })}
            </Flex>
        </>
    )
}