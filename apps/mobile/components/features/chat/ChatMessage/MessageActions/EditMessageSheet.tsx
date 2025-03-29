import { Keyboard, View } from 'react-native'
import { Message } from '@raven/types/common/Message'
import TiptapEditor from '@components/features/chat/ChatInput/TiptapEditor/TiptapEditor'
import { Button } from '@components/nativewindui/Button'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import { useRef } from 'react'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { toast } from 'sonner-native'

interface EditMessageSheetProps {
    message: Message;
    onClose: () => void
    onUpdate?: (content: string, json: any) => Promise<void>
}


const EditMessageSheet = ({ message, onClose }: EditMessageSheetProps) => {

    const { colors } = useColorScheme()

    const { updateDoc, error, loading: updatingDoc, reset } = useFrappeUpdateDoc()

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
        <View
            className="flex flex-col gap-2 px-4 pt-2"
        >
            <Text className='text-lg font-medium'>Edit Message</Text>

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
                        borderRadius: 6,
                        borderColor: colors.grey4,
                        overflowX: 'hidden',
                    },
                }}
                onUpdate={handleUpdate}
            />
            <View className='flex flex-row justify-end'>
                <Button
                    variant='primary'
                    size='md'
                    onPress={handleSave}
                    disabled={updatingDoc}
                >
                    <Text>Save</Text>
                </Button>
            </View>
        </View>
    );
}

export default EditMessageSheet; 