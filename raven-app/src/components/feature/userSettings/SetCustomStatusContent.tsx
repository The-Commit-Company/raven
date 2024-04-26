import { ErrorText } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { useUserData } from '@/hooks/useUserData'
import { Button, Dialog, Flex, Select, TextField } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiSolidCircle } from 'react-icons/bi'
import { FaCircleDot, FaCircleMinus } from 'react-icons/fa6'
import { MdWatchLater } from 'react-icons/md'
import { toast } from 'sonner'

export type AvailabilityStatus = 'Online' | 'Idle' | 'Do not disturb' | 'Invisible' | ''
interface SetCustomStatusForm {
    custom_status: string
    availability_status: AvailabilityStatus
}

const SetCustomStatusContent = ({ onClose }: { onClose: VoidFunction }) => {

    const userData = useUserData()

    const { data, error } = useFrappeGetCall<{ message: { "custom_status": string | null, "availability_status": AvailabilityStatus | null } }>('frappe.client.get_value', {
        doctype: 'Raven User',
        filters: { name: userData.name },
        fieldname: JSON.stringify(['custom_status', 'availability_status'])
    }, undefined, {
        revalidateOnFocus: false
    })

    return (
        <>
            <Dialog.Title>Set a custom status</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Set a custom status to share what you're up to
            </Dialog.Description>

            <ErrorBanner error={error} />

            {data && data.message && <SetCustomStatusForm
                user_id={userData.name}
                custom_status={data.message.custom_status ?? ''}
                availability_status={data.message.availability_status ?? ''}
                onClose={onClose} />}
        </>
    )
}

export default SetCustomStatusContent

interface SetCustomStatusFormProps {
    user_id: string,
    custom_status: string,
    availability_status: AvailabilityStatus,
    onClose: () => void
}

const SetCustomStatusForm = ({ user_id, custom_status, availability_status, onClose }: SetCustomStatusFormProps) => {

    const methods = useForm<SetCustomStatusForm>({
        defaultValues: {
            custom_status: custom_status,
            availability_status: availability_status
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc } = useFrappeUpdateDoc()

    const [availabilityStatus, setAvailabilityStatus] = useState<string | undefined>(availability_status ?? undefined)

    const onSubmit = (data: SetCustomStatusForm) => {
        updateDoc("Raven User", user_id, {
            custom_status: data.custom_status,
            availability_status: availabilityStatus
        }).then(() => {
            toast.success("User status updated")
            onClose()
        })
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>

                <ErrorBanner error={errorUpdatingDoc} />

                <Flex direction="column" gap="3">
                    <TextField.Root>
                        <TextField.Input
                            id="custom_status"
                            autoFocus
                            placeholder='e.g. Out of Office'
                            maxLength={140}
                            {...register('custom_status', {
                                maxLength: {
                                    value: 140,
                                    message: "Custom status cannot be more than 140 characters."
                                }
                            })}
                            aria-invalid={errors.custom_status ? 'true' : 'false'}
                        />
                        {errors?.custom_status && <ErrorText>{errors.custom_status?.message}</ErrorText>}
                    </TextField.Root>
                    <Select.Root value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                        <Select.Trigger placeholder='Availability Status' />
                        <Select.Content>
                            <Select.Item value='Online'>
                                <Flex gap={'2'} align={'center'}><BiSolidCircle color={'green'} fontSize={'0.8rem'} /> Online</Flex>
                            </Select.Item>
                            <Select.Item value='Idle'>
                                <Flex gap={'2'} align={'center'}><MdWatchLater className={'text-amber-400'} fontSize={'0.75rem'} /> Idle</Flex>
                            </Select.Item>
                            <Select.Item value='Do not disturb'>
                                <Flex gap={'2'} align={'center'}><FaCircleMinus className={'text-red-600'} fontSize={'0.6rem'} /> Do not disturb</Flex>
                            </Select.Item>
                            <Select.Item value='Invisible'>
                                <Flex gap={'2'} align={'center'}><FaCircleDot className={'text-gray-400'} fontSize={'0.6rem'} /> Invisible</Flex>
                            </Select.Item>
                        </Select.Content>
                    </Select.Root>
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