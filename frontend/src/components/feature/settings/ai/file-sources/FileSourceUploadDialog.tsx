import { ErrorText, Label } from '@/components/common/Form'
import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { FileUploadBox } from '@/components/feature/userSettings/UploadImage/FileUploadBox'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenAIFileSource } from '@/types/RavenAI/RavenAIFileSource'
import { Box, Dialog, Spinner, TextField } from '@radix-ui/themes'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc, useFrappeFileUpload } from 'frappe-react-sdk'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    mutate: () => void
}

const FileSourceUploadDialog = ({ mutate }: Props) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        mutate()
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button>Upload</Button>
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>Upload File</Dialog.Title>
                <Dialog.Description size='2'>
                    Upload a file to use as a data source for AI Agents.
                </Dialog.Description>
                <FileSourceUploadForm onClose={onClose} />



            </Dialog.Content>
        </Dialog.Root>
    )
}


const FileSourceUploadForm = ({ onClose }: { onClose: () => void }) => {

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<RavenAIFileSource>()

    const [file, setFile] = useState<CustomFile | undefined>()

    const { upload, loading: uploadLoading, error: uploadError } = useFrappeFileUpload()
    const { createDoc, loading: createLoading, error: createError } = useFrappeCreateDoc<RavenAIFileSource>()

    const onSubmit = (data: RavenAIFileSource) => {
        // Upload the file first then create the document

        if (!file) return

        const id = "new-raven-ai-file-source-" + Date.now()
        upload(file, {
            doctype: "Raven AI File Source",
            docname: id,
            fieldname: "file",
            isPrivate: true
        }).then(res => createDoc("Raven AI File Source", {
            ...data,
            file: res.file_url,
        })).then(() => {
            onClose()
        })
    }

    const onFileSelect = (file?: CustomFile) => {
        if (file) {
            setFile(file)
            setValue('file_name', file.name.split('.')[0])
        } else {
            setFile(undefined)
            setValue('file_name', '')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap='4'>
                {uploadError && <ErrorBanner error={uploadError} />}
                {createError && <ErrorBanner error={createError} />}

                <FileUploadBox
                    file={file}
                    onFileChange={onFileSelect}
                    hideIfLimitReached
                    maxFileSize={10}
                />
                <Stack>
                    <Box>
                        <Label htmlFor='file_name' isRequired>File Name</Label>
                        <TextField.Root id='file_name' {...register('file_name', {
                            required: 'File name is required'
                        })} />
                    </Box>
                    {errors.file_name && <ErrorText>{errors.file_name.message}</ErrorText>}
                </Stack>
                <HStack justify='end' pt='2'>
                    <Dialog.Close>
                        <Button variant='soft' color='gray' className='not-cal'>Cancel</Button>
                    </Dialog.Close>
                    <Button type='submit' className='not-cal' disabled={uploadLoading || createLoading}>
                        {uploadLoading || createLoading ? <Spinner /> : 'Upload'}
                    </Button>
                </HStack>
            </Stack>

        </form>
    )
}
export default FileSourceUploadDialog