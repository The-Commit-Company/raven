import { Box, Button, Dialog, Flex, IconButton, Text, TextArea, Tooltip } from '@radix-ui/themes'
import { DEFAULT_BUTTON_STYLE, ICON_PROPS } from './ToolPanel'
import { LuFileBox } from 'react-icons/lu'
import { FormProvider, useForm } from 'react-hook-form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { ErrorText, Label } from '@/components/common/Form'
import { useBoolean } from '@/hooks/useBoolean'
import clsx from 'clsx'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { Loader } from '@/components/common/Loader'
import { DoctypeLinkRenderer } from '../ChatMessage/Renderers/DoctypeLinkRenderer'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { Stack } from '@/components/layout/Stack'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import useRecentlyUsedDocType from '@/hooks/useRecentlyUsedDocType'

type Props = {}

const DocumentLinkButton = ({ channelID }: { channelID: string }) => {

    const [open, { off }, setOpen] = useBoolean()

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Tooltip content={`Attach a document from the system`}>
            <Dialog.Trigger>
                <IconButton
                    aria-label='Attach a document from the system'
                    variant='ghost'
                    className={DEFAULT_BUTTON_STYLE}
                    size='1'
                    title='Attach a document from the system'>
                    <LuFileBox {...ICON_PROPS} />
                </IconButton>
            </Dialog.Trigger>
        </Tooltip>
        <Dialog.Content className={'static'}>
            <Dialog.Title className='mb-1'>Send a document</Dialog.Title>
            <Dialog.Description size='2'>Choose a document from the system to send.</Dialog.Description>
            <DocumentLinkForm channelID={channelID} onClose={off} />
        </Dialog.Content>
    </Dialog.Root>
}

interface DocumentLinkFormData {
    doctype: string
    docname: string,
    message: string
}

const DocumentLinkForm = ({ channelID, onClose }: { channelID: string, onClose: () => void }) => {

    const { loading, error, createDoc } = useFrappeCreateDoc<RavenMessage>()

    const methods = useForm<DocumentLinkFormData>()

    const { watch } = methods

    const handleClose = () => {
        methods.reset()
        onClose()
    }

    const doctype = watch('doctype')
    const docname = watch('docname')

    const { recentlyUsedDoctypes, addRecentlyUsedDocType } = useRecentlyUsedDocType()

    const onSubmit = (data: DocumentLinkFormData) => {

        addRecentlyUsedDocType(data.doctype)

        createDoc('Raven Message', {
            message_type: 'Text',
            channel_id: channelID,
            text: data.message,
            link_doctype: data.doctype,
            link_document: data.docname
        } as RavenMessage)
            .then(() => {
                handleClose()
            })
    }

    const onDoctypeChange = () => {
        // Reset docname when doctype changes
        methods.setValue('docname', '')
    }

    return <form className='pt-2' onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <Stack gap='2'>
                {error && <ErrorBanner error={error} />}

                <Box width='100%'>
                    <Flex direction='column' gap='2'>
                        <LinkFormField
                            name='doctype'
                            label='Document Type'
                            autofocus
                            suggestedItems={recentlyUsedDoctypes}
                            required
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
                                required
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

                <div className={clsx('transition-all duration-500', docname ? 'opacity-100' : 'opacity-0')}>
                    {doctype && docname && <DoctypeLinkRenderer doctype={doctype} docname={docname} />}
                </div>

                <Box width='100%'>
                    <Flex direction='column' gap='0'>
                        <Label>Message <Text as='span' size='1' color='gray'>(Optional)</Text></Label>
                        <TextArea {...methods.register('message')} placeholder='Enter a message to send with the document' />
                    </Flex>
                </Box>

                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='button' disabled={loading} onClick={methods.handleSubmit(onSubmit)}
                    >
                        {loading && <Loader className="text-white" />}
                        Send
                    </Button>
                </Flex>
            </Stack>
        </FormProvider>
    </form>

}

export default DocumentLinkButton