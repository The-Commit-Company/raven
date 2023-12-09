import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { ChangeEvent, useCallback } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { ErrorBanner } from "../../../layout/AlertBanner"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box, Dialog, Flex, Text, TextField, Button } from "@radix-ui/themes"
import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { useToast } from "@/hooks/useToast"

interface RenameChannelForm {
    channel_name: string
}


interface RenameChannelModalContentProps {
    channelID: string,
    channelName: string,
    type: ChannelListItem['type'],
    onClose: () => void
}

export const RenameChannelModalContent = ({ channelID, channelName, type, onClose }: RenameChannelModalContentProps) => {

    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_name: channelName
        }
    })
    const { control, handleSubmit, setValue, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()
    const { toast } = useToast()

    const onSubmit = async (data: RenameChannelForm) => {
        return updateDoc("Raven Channel", channelID ?? null, {
            channel_name: data.channel_name
        }).then(() => {
            toast({
                title: "Channel name updated",
                variant: 'success',
                duration: 800
            })
            onClose()
        })
    }

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue('channel_name', event.target.value?.toLowerCase().replace(' ', '-'))
    }, [setValue])

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Dialog.Title>Rename this channel</Dialog.Title>

                <Flex gap='2' direction='column' width='100%'>
                    <ErrorBanner error={error} />
                    <Box width='100%'>
                        <Label htmlFor='channel_name' isRequired>Name</Label>
                        <Controller
                            name='channel_name'
                            control={control}
                            rules={{
                                required: "Please add a channel name",
                                maxLength: {
                                    value: 50,
                                    message: "Channel name cannot be more than 50 characters."
                                },
                                minLength: {
                                    value: 3,
                                    message: "Channel name cannot be less than 3 characters."
                                },
                                pattern: {
                                    // no special characters allowed
                                    // cannot start with a space
                                    value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                    message: "Channel name can only contain letters, numbers and hyphens."
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField.Root>
                                    <TextField.Slot>
                                        {<ChannelIcon type={type} />}
                                    </TextField.Slot>
                                    <TextField.Input
                                        maxLength={50}
                                        required
                                        autoFocus
                                        placeholder='e.g. wedding-gone-wrong, joffrey-tributes'
                                        color={error ? 'red' : undefined}
                                        {...field}
                                        aria-invalid={error ? 'true' : 'false'}
                                        onChange={handleChange}
                                    />
                                    <TextField.Slot>
                                        <Text size='2' weight='light' color='gray'>{50 - field.value.length}</Text>
                                    </TextField.Slot>
                                </TextField.Root>
                            )}
                        />
                        {errors?.channel_name && <ErrorText>{errors.channel_name?.message}</ErrorText>}
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