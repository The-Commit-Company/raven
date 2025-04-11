import { Keyboard, View } from 'react-native'
import { Message } from '@raven/types/common/Message'
import TiptapEditor from '@components/features/chat/ChatInput/TiptapEditor/TiptapEditor'
import { Button } from '@components/nativewindui/Button'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import { useRef } from 'react'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import ErrorBanner from '@components/common/ErrorBanner'

interface EditMessageSheetProps {
    message: Message;
    onClose: () => void
    onUpdate?: (content: string, json: any) => Promise<void>
}


const EditMessageSheet = ({ message, onClose }: EditMessageSheetProps) => {

    const { colors, isDarkColorScheme } = useColorScheme()

    const { updateDoc, error, loading: updatingDoc } = useFrappeUpdateDoc()

    // store message text in a ref
    const messageTextRef = useRef(message.text || '')

    const handleUpdate = (html: string) => {
        messageTextRef.current = html
    }

    const handleSave = async () => {
        updateDoc('Raven Message', message.name,
            { text: messageTextRef.current }).then((d) => {
                Keyboard.dismiss()
                onClose()
                toast.success("Message updated")
            })
    };
    return (
        <View className="flex flex-col gap-3 px-4 pt-2">

            <Text className='text-lg font-cal-sans ml-0.5'>Edit Message</Text>

            {error ? <ErrorBanner error={error} /> : null}

            <TiptapEditor
                content={message.text || ''}
                dom={{
                    scrollEnabled: true,
                    focusable: true,
                    containerStyle: {
                        padding: 8,
                        height: 'auto',
                        minHeight: 200,
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: colors.grey4,
                        overflowX: 'hidden',
                    },
                }}
                isDarkMode={isDarkColorScheme}
                onUpdate={handleUpdate}
            />
            <Button
                variant='primary'
                size='lg'
                onPress={handleSave}
                disabled={updatingDoc}>
                <Text>{updatingDoc ? 'Updating...' : 'Update'}</Text>
            </Button>
        </View>
    )
}

export default EditMessageSheet