import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { ErrorBanner } from "../../../layout/AlertBanner"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box, Dialog, Flex, Button, TextArea, Text } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { ErrorText, Label } from "@/components/common/Form"
import { useToast } from "@/hooks/useToast"
import { ToastAction } from "@/components/common/Toast/Toast"

interface RenameChannelForm {
    channel_description: string
}

interface RenameChannelModalContentProps {
    channelData: ChannelListItem,
    onClose: () => void
}

export const EditChannelDescriptionModalContent = ({ channelData, onClose }: RenameChannelModalContentProps) => {

    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_description: channelData?.channel_description
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()
    const { toast } = useToast()

    const onSubmit = (data: RenameChannelForm) => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
            channel_description: data.channel_description
        }).then(() => {
            toast({
                title: "Channel description updated",
                variant: 'success',
            })
            onClose()
        }).catch((err) => {
            toast({
                title: "Error updating channel description",
                description: err.message,
                variant: "destructive",
            })
        })
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>

                <Dialog.Title>{channelData && channelData?.channel_description && channelData?.channel_description.length > 0 ? 'Edit description' : 'Add description'}</Dialog.Title>

                <Flex gap='2' direction='column' width='100%'>
                    <ErrorBanner error={error} />
                    <Box width='100%'>
                        <Label htmlFor='channel_description'>Channel description</Label>
                        <TextArea
                            maxLength={140}
                            id='channel_description'
                            placeholder='Add description'
                            {...register('channel_description', {
                                maxLength: {
                                    value: 140,
                                    message: "Channel description cannot be more than 200 characters."
                                }
                            })}
                            aria-invalid={errors.channel_description ? 'true' : 'false'}
                        />
                        <Text size='1' weight='light'>This is how people will know what this channel is about.</Text>
                        {errors?.channel_description && <ErrorText>{errors.channel_description?.message}</ErrorText>}
                    </Box>
                </Flex>

                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={updatingDoc}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='submit' disabled={updatingDoc}>
                        {updatingDoc && <Loader />}
                        {updatingDoc ? "Saving" : "Save"}
                    </Button>
                </Flex>

            </form>
        </FormProvider>
    )
}