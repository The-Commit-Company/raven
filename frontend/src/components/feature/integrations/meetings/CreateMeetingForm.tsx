import { ErrorText, Label } from '@/components/common/Form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useUserData } from '@/hooks/useUserData'
import { UserContext } from '@/utils/auth/UserProvider'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Button, Dialog, Flex, Link, Select, Text, TextArea } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { useContext } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type CreateMeetingFormProps = {
    channelData: ChannelListItem | DMChannelListItem,
    onClose: () => void
}

interface CreateMeetingFormFields {
    channel: string
    subject: string,
    duration: string,
    google_calendar: string,
    description: string,
    // participants: string[]
}

const CreateMeetingForm = ({ onClose, channelData }: CreateMeetingFormProps) => {

    let defaultSubject = `Meeting with #${channelData.channel_name}`

    const { currentUser } = useContext(UserContext)

    const currentUserData = useUserData()

    const peerUser = useGetUser((channelData as DMChannelListItem).peer_user_id ?? undefined)

    if (channelData.is_direct_message) {
        defaultSubject = `Meeting between ${peerUser?.full_name ?? (channelData as DMChannelListItem).peer_user_id} and ${currentUserData?.full_name ?? currentUser}`
    }


    const methods = useForm<CreateMeetingFormFields>({
        defaultValues: {
            channel: channelData.name,
            subject: defaultSubject,
            duration: '60',
        }
    })
    const { control, handleSubmit, register, setValue, formState: { errors } } = methods

    useFrappeGetCall('frappe.client.get_value', {
        doctype: 'Google Calendar',
        fieldname: ['name'],
        filters: {
            user: currentUser,
            enable: 1
        }
    }, undefined, {
        onSuccess: (data) => {
            if (data.message)
                setValue('google_calendar', data.message.name)
        }
    })

    const { call, loading, error } = useFrappePostCall('raven.api.events.create_event')

    const onSubmit = async (data: CreateMeetingFormFields) => {

        return call(data).then((res) => {
            toast.success("Meeting created", {
                description: <Link
                    href={res.message.google_meet_link}
                    underline='always'
                    className='cursor-pointer'
                    target='_blank'
                    rel='noreferrer'>{res.message.google_meet_link}</Link>
            })
            onClose()
        })

    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Dialog.Title>Start a Meeting</Dialog.Title>

                <Flex gap='2' direction='column' width='100%'>
                    <ErrorBanner error={error} />
                    <Box width='100%'>
                        <Flex direction='column' gap='2'>
                            <Box>
                                <Label htmlFor='subject' isRequired>Subject</Label>
                                <TextArea
                                    {...register('subject', { required: "Subject is required" })}
                                />
                            </Box>

                            {errors?.subject && <ErrorText>{errors.subject?.message}</ErrorText>}
                        </Flex>
                    </Box>

                    <Flex gap='2'>
                        <Box width='100%'>
                            <Flex direction='column' gap='2'>
                                <Box width='100%'>
                                    <Label htmlFor='duration' isRequired>Duration</Label>
                                    <Controller
                                        name="duration"
                                        rules={{
                                            required: "Duration is required"
                                        }}
                                        control={control}
                                        render={({ field }) => (
                                            <Select.Root value={field.value}
                                                name={field.name}
                                                required
                                                onValueChange={field.onChange}
                                            >
                                                <Select.Trigger onBlur={field.onBlur} className='w-full' />
                                                <Select.Content>
                                                    <Select.Item value="15">15 minutes</Select.Item>
                                                    <Select.Item value="30">30 minutes</Select.Item>
                                                    <Select.Item value="60">1 hour</Select.Item>
                                                    <Select.Item value="120">2 hours</Select.Item>
                                                </Select.Content>
                                            </Select.Root>
                                        )}
                                    />
                                </Box>
                                {errors?.duration && <ErrorText>{errors.duration?.message}</ErrorText>}
                            </Flex>
                        </Box>

                        <Box width='100%'>
                            <Flex direction='column' gap='2'>
                                <LinkFormField
                                    name='google_calendar'
                                    label='Google Calendar'
                                    required
                                    dropdownClass='sm:w-[255px] w-[10rem]'
                                    rules={{
                                        required: 'Calendar is required',
                                    }}
                                    filters={[["enable", "=", 1], ["user", "=", currentUser]]}
                                    doctype="Google Calendar"
                                />
                                <ErrorText>{methods.formState.errors.google_calendar?.message}</ErrorText>
                            </Flex>
                        </Box>
                    </Flex>

                    <Box width='100%'>
                        <Label htmlFor='description'>Description <Text as='span' size='1' color='gray'> (Optional)</Text></Label>
                        <TextArea
                            {...register('description')}
                        />

                        {errors?.description && <ErrorText>{errors.description?.message}</ErrorText>}
                    </Box>
                </Flex>

                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='submit' disabled={loading}>
                        {loading && <Loader className="text-white" />}
                        {loading ? "Creating" : "Create"}
                    </Button>
                </Flex>
            </form>
        </FormProvider>
    )
}

export default CreateMeetingForm