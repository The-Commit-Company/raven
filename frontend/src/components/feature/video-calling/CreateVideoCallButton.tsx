import { ErrorText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { useGetUser } from '@/hooks/useGetUser'
import { useUserData } from '@/hooks/useUserData'
import { RavenLiveKitRoom } from '@/types/RavenIntegrations/RavenLiveKitRoom'
import { UserContext } from '@/utils/auth/UserProvider'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Button, Checkbox, Dialog, Flex, IconButton, Text, TextArea, TextField, VisuallyHidden } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiPhone } from 'react-icons/bi'
import { toast } from 'sonner'

type Props = {
    channelData: ChannelListItem
}

const CreateVideoCallButton = ({ channelData }: Props) => {

    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <IconButton color='gray' className='bg-transparent text-gray-12 hover:bg-gray-3'>
                    <BiPhone size={16} />
                </IconButton>
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>Start a Call</Dialog.Title>
                <VisuallyHidden>
                    <Dialog.Description size='2'>
                        Start a call
                    </Dialog.Description>
                </VisuallyHidden>
                <CreateVideoCallDialog channelData={channelData} onClose={() => setOpen(false)} />

            </Dialog.Content>
        </Dialog.Root>
    )
}

const CreateVideoCallDialog = ({ channelData, onClose }: { channelData: ChannelListItem, onClose: () => void }) => {

    let defaultSubject = `Call with #${channelData.channel_name}`

    const { currentUser } = useContext(UserContext)

    const currentUserData = useUserData()

    const peerUser = useGetUser((channelData as DMChannelListItem).peer_user_id ?? undefined)

    if (channelData.is_direct_message) {
        defaultSubject = `Call between ${peerUser?.full_name ?? (channelData as DMChannelListItem).peer_user_id} and ${currentUserData?.full_name ?? currentUser}`
    }


    const methods = useForm<RavenLiveKitRoom>({
        defaultValues: {
            channel_id: channelData.name,
            workspace: channelData.workspace,
            invite_entire_channel: 1,
            room_name: defaultSubject,
        }
    })

    const { register, control, formState: { errors } } = methods

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenLiveKitRoom>()

    const onSubmit = async (data: RavenLiveKitRoom) => {

        return createDoc("Raven LiveKit Room", data).then((res) => {
            toast.success("Call created. You can join it now.")
            onClose()
        })
    }

    return <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack>
                <ErrorBanner error={error} />

                <Stack>
                    <Box>
                        <Label htmlFor='room_name' isRequired>Name</Label>
                        <TextField.Root
                            {...register('room_name', {
                                required: "Name is required"
                            })}
                        />
                    </Box>
                    {errors?.room_name && <ErrorText>{errors.room_name?.message}</ErrorText>}
                </Stack>
                <Stack>
                    <Box>
                        <Label htmlFor='description'>Description</Label>
                        <TextArea
                            {...register('description')}
                        />
                    </Box>

                    {errors?.description && <ErrorText>{errors.description?.message}</ErrorText>}
                </Stack>

                <Stack>
                    <Text as="label" size="2">
                        <HStack>
                            <Controller
                                control={control}
                                name='invite_entire_channel'
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value ? true : false}
                                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    />
                                )} />

                            Invite entire channel
                        </HStack>
                    </Text>
                </Stack>
                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='submit' disabled={loading}>
                        {loading && <Loader className="text-white" />}
                        {loading ? "Setting up..." : "Start Call"}
                    </Button>
                </Flex>
            </Stack>
        </form>
    </FormProvider>
}

export default CreateVideoCallButton