import { ErrorText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { useGetUser } from '@/hooks/useGetUser'
import { useUserData } from '@/hooks/useUserData'
import { RavenMeetRoom } from '@/types/RavenIntegrations/RavenMeetRoom'
import { UserContext } from '@/utils/auth/UserProvider'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Button, Checkbox, Dialog, Flex, IconButton, Text, TextArea, TextField, Tooltip, VisuallyHidden } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiVideoPlus } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type Props = {
    channelData: ChannelListItem | DMChannelListItem
}

/**
 * Header button that opens a dialog for starting a Frappe Meet call in
 * the current channel or DM. Mirrors the LiveKit `CreateVideoCallButton`
 * (PR #1486) to keep the user-facing pattern consistent across providers.
 *
 * On submit, creates a `Raven Meet Room` document. The doctype's
 * `before_insert` calls `meet.api.meeting.create` to back the room with
 * a real Frappe Meet session, and `after_insert` posts an announcement
 * message in the channel that other members see as a "Join Call" card.
 */
const CreateMeetRoomButton = ({ channelData }: Props) => {

    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content="Start a video call">
                <Dialog.Trigger>
                    <IconButton
                        color='gray'
                        variant='ghost'
                        aria-label="Start a video call"
                        className='bg-transparent text-gray-12 hover:bg-gray-3'
                    >
                        <BiVideoPlus size={18} />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content>
                <Dialog.Title>Start a video call</Dialog.Title>
                <VisuallyHidden>
                    <Dialog.Description size='2'>
                        Start a Frappe Meet call inside this channel
                    </Dialog.Description>
                </VisuallyHidden>
                <CreateMeetRoomDialog channelData={channelData} onClose={() => setOpen(false)} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

const CreateMeetRoomDialog = ({ channelData, onClose }: { channelData: ChannelListItem | DMChannelListItem, onClose: () => void }) => {

    const { currentUser } = useContext(UserContext)
    const currentUserData = useUserData()
    const peerUser = useGetUser((channelData as DMChannelListItem).peer_user_id ?? undefined)
    const navigate = useNavigate()

    const defaultRoomName = channelData.is_direct_message
        ? `Call between ${peerUser?.full_name ?? (channelData as DMChannelListItem).peer_user_id} and ${currentUserData?.full_name ?? currentUser}`
        : `Call in #${channelData.channel_name}`

    const methods = useForm<Partial<RavenMeetRoom>>({
        defaultValues: {
            channel_id: channelData.name,
            workspace: channelData.workspace,
            invite_entire_channel: 1,
            room_name: defaultRoomName,
        }
    })

    const { register, control, formState: { errors } } = methods
    const { createDoc, loading, error } = useFrappeCreateDoc<RavenMeetRoom>()

    const onSubmit = async (data: Partial<RavenMeetRoom>) => {
        // The doctype controller fills the auto-generated fields
        // (name/owner/creation/...) on the server; the cast is safe.
        return createDoc("Raven Meet Room", data as RavenMeetRoom).then((res) => {
            toast.success('Call created. Joining…')
            onClose()
            // Navigate the host straight into the meeting room — they
            // were the one who clicked "Start", they expect to be in.
            navigate(`/meeting-room/${res.name}`)
        })
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Stack>
                    <ErrorBanner error={error} />

                    <Stack>
                        <Box>
                            <Label htmlFor='room_name' isRequired>Name</Label>
                            <TextField.Root
                                id='room_name'
                                {...register('room_name', { required: 'Name is required' })}
                            />
                        </Box>
                        {errors?.room_name && <ErrorText>{errors.room_name?.message}</ErrorText>}
                    </Stack>

                    <Stack>
                        <Box>
                            <Label htmlFor='description'>Description</Label>
                            <TextArea
                                id='description'
                                {...register('description')}
                            />
                        </Box>
                        {errors?.description && <ErrorText>{errors.description?.message}</ErrorText>}
                    </Stack>

                    {!channelData.is_direct_message && (
                        <Stack>
                            <Text as='label' size='2'>
                                <HStack>
                                    <Controller
                                        control={control}
                                        name='invite_entire_channel'
                                        render={({ field }) => (
                                            <Checkbox
                                                checked={field.value ? true : false}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )}
                                    />
                                    Invite entire channel
                                </HStack>
                            </Text>
                        </Stack>
                    )}

                    <Flex gap='3' mt='4' justify='end' align='center'>
                        <Dialog.Close disabled={loading}>
                            <Button variant='soft' color='gray'>Cancel</Button>
                        </Dialog.Close>
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className='text-white' />}
                            {loading ? 'Starting…' : 'Start Call'}
                        </Button>
                    </Flex>
                </Stack>
            </form>
        </FormProvider>
    )
}

export default CreateMeetRoomButton
