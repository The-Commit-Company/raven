import { Flex, Dialog, IconButton, Box, Button, Callout, Link } from "@radix-ui/themes"
import { BiX } from "react-icons/bi"
import { FileMessage, Message } from "../../../../../../../types/Messaging/Message"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ErrorText } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { FrappeConfig, FrappeContext, FrappeError } from "frappe-react-sdk"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import LinkFormField from "@/components/common/LinkField/LinkFormField"
import { useContext, useState } from "react"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { getFileExtension, getFileName } from "@/utils/operations"
import useRecentlyUsedDocType from "@/hooks/useRecentlyUsedDocType"

interface AttachFileToDocumentModalProps {
    onClose: () => void,
    message: Message
}

interface AttachFileToDocumentForm {
    doctype: string,
    docname: string,
}

const AttachFileToDocumentModal = ({ onClose, message }: AttachFileToDocumentModalProps) => {

    const methods = useForm<AttachFileToDocumentForm>({
        defaultValues: {
        }
    })

    const { handleSubmit, reset, watch } = methods

    const { call } = useContext(FrappeContext) as FrappeConfig

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<FrappeError | null>(null)

    const { recentlyUsedDoctypes, addRecentlyUsedDocType } = useRecentlyUsedDocType()

    const onSubmit = (data: AttachFileToDocumentForm) => {
        if ((message as FileMessage).file) {
            addRecentlyUsedDocType(data.doctype)
            setLoading(true)
            // The file URL might include the File ID, so we need to remove that
            const fileURL = (message as FileMessage).file.split('?')[0]
            call.get('frappe.client.get_value', {
                doctype: 'File',
                filters: {
                    file_url: fileURL,
                    attached_to_doctype: "Raven Message",
                    attached_to_name: message.name,
                    attached_to_field: "file"
                },
                fieldname: ['name']
            }).then((res) => {
                if (res.message) {
                    call.post('upload_file', {
                        doctype: data.doctype,
                        docname: data.docname,
                        library_file_name: res.message.name,
                    })
                }
            }).then(() => {
                toast.success(`File attached to ${data.doctype} - ${data.docname}`)
                handleClose()
            }).catch((err) => {
                setError(err)
                toast.error('Failed to attach file')
            }).finally(() => {
                setLoading(false)
            })
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const doctype = watch('doctype')

    const onDoctypeChange = () => {
        // Reset docname when doctype changes
        methods.setValue('docname', '')
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex justify={'between'}>
                    <Dialog.Title>Attach File to Document</Dialog.Title>
                    <Dialog.Description hidden>Attach the file to a document</Dialog.Description>
                    <Dialog.Close onClick={handleClose}>
                        <IconButton size='1' variant="soft" color="gray">
                            <BiX size='18' />
                        </IconButton>
                    </Dialog.Close>
                </Flex>

                <Flex gap='2' direction='column' width='100%'>
                    <ErrorBanner error={error} />
                    <Callout.Root>
                        <Callout.Icon>
                            {<FileExtensionIcon ext={getFileExtension((message as FileMessage).file)} />}
                        </Callout.Icon>
                        <Callout.Text>
                            <Link href={(message as FileMessage).file}>
                                {getFileName((message as FileMessage).file)}
                            </Link>
                        </Callout.Text>
                    </Callout.Root>
                    <Box width='100%'>
                        <Flex direction='column' gap='2'>
                            <LinkFormField
                                name='doctype'
                                label='Document Type'
                                autofocus
                                suggestedItems={recentlyUsedDoctypes}
                                rules={{
                                    required: 'Document Type is required',
                                    onChange: onDoctypeChange
                                }}
                                filters={[["issingle", "=", 0], ["istable", "=", 0]]}
                                doctype="DocType"
                            />
                            <ErrorText>{methods.formState.errors.doctype?.message}</ErrorText>
                        </Flex>
                    </Box>
                    {doctype &&
                        <Box width='100%'>
                            <Flex direction='column' gap='2'>
                                <LinkFormField
                                    name='docname'
                                    label='Document Name'
                                    placeholder="Select a document"
                                    disabled={!doctype}
                                    rules={{ required: 'Document Name is required' }}
                                    doctype={doctype}
                                />
                                <ErrorText>{methods.formState.errors.docname?.message}</ErrorText>
                            </Flex>
                        </Box>
                    }
                </Flex>

                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='submit' disabled={loading}>
                        {loading && <Loader className="text-white" />}
                        Attach
                    </Button>
                </Flex>

            </form>
        </FormProvider>
    )
}

export default AttachFileToDocumentModal