import { Dialog, Button, Flex } from '@radix-ui/themes'
import { FileUploadBox } from '../../userSettings/UploadImage/FileUploadBox'
import { CustomFile } from '../../file-upload/FileDrop'
import { useState } from 'react'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { FrappeError, useFrappeFileUpload, useFrappePostCall } from 'frappe-react-sdk'
import { Loader } from '@/components/common/Loader'
import { useCurrentEditor } from '@tiptap/react'

interface AudioUploadDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    mode: 'transcribe' | 'translate'
}

export const AudioUploadDialog = ({ open, onOpenChange, mode }: AudioUploadDialogProps) => {
    const [file, setFile] = useState<CustomFile | undefined>()
    const [error, setError] = useState<FrappeError>()
    const [loading, setLoading] = useState(false)

    const { upload } = useFrappeFileUpload()
    const { call: callTranscribe } = useFrappePostCall('raven.ai.audio_tools.transcribe_audio')
    const { call: callTranslate } = useFrappePostCall('raven.ai.audio_tools.translate_audio')
    const { editor } = useCurrentEditor()

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setError(undefined)

        try {
            const res = await upload(file, { isPrivate: true })
            const file_id = res.name

            const result = await (mode === 'transcribe'
                ? callTranscribe({ file_id })
                : callTranslate({ file_id })
            )
            const text = result?.message?.message || '[No text returned from Whisper]'

            editor?.commands.setContent({
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text }]
                  }
                ]
              })

            setFile(undefined)
            onOpenChange(false)

        } catch (err: any) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content>
                <Dialog.Title>{mode === 'transcribe' ? 'Transcribe Audio' : 'Translate Audio'}</Dialog.Title>

                <ErrorBanner error={error} />

                <FileUploadBox
                    file={file}
                    onFileChange={setFile}
                    accept={{ 'audio/*': ['.mp3', '.m4a'] }}
                    maxFileSize={10}
                />

                <Flex gap="3" mt="6" justify="end">
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button onClick={handleUpload} disabled={!file || loading}>
                        {loading && <Loader />}
                        {loading ? 'Processing...' : 'Upload & Process'}
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}
