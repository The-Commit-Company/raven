import { ErrorText } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { useUserData } from '@/hooks/useUserData'
import { Button, Dialog, Flex, TextField, Text } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
interface SetCustomStatusForm {
    custom_status: string
}

const SetCustomStatusContent = ({ onClose }: { onClose: VoidFunction }) => {

    const userData = useUserData()

    const { data, error } = useFrappeGetCall<{
        message: {
            "custom_status": string | null,
        }
    }>('frappe.client.get_value', {
        doctype: 'Raven User',
        filters: { name: userData.name },
        fieldname: JSON.stringify(['custom_status'])
    }, undefined, {
        revalidateOnFocus: false
    })

    return (
        <>
            <Dialog.Title>Set a custom status</Dialog.Title>

            <ErrorBanner error={error} />

            {data && data.message && <SetCustomStatusForm
                user_id={userData.name}
                custom_status={data.message.custom_status ?? ''}
                onClose={onClose} />}
        </>
    )
}

export default SetCustomStatusContent

interface SetCustomStatusFormProps {
    user_id: string,
    custom_status: string,
    onClose: () => void
}

const SetCustomStatusForm = ({ user_id, custom_status, onClose }: SetCustomStatusFormProps) => {

    const methods = useForm<SetCustomStatusForm>({
        defaultValues: {
            custom_status: custom_status ?? '',
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc } = useFrappeUpdateDoc()

    const onSubmit = (data: SetCustomStatusForm) => {
        updateDoc("Raven User", user_id, {
            custom_status: data.custom_status
        }).then(() => {
            toast.success("User status updated")
            onClose()
        })
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>

                <ErrorBanner error={errorUpdatingDoc} />

                <Flex direction={'column'} gap={'2'}>
                    <Text size='2' color='gray'>Share what you're up to</Text>
                    <TextField.Root>
                        <TextField.Input
                            id="custom_status"
                            autoFocus
                            placeholder='e.g. Out of Office'
                            maxLength={140}
                            {...register('custom_status', {
                                maxLength: {
                                    value: 140,
                                    message: "Status cannot be more than 140 characters."
                                }
                            })}
                            aria-invalid={errors.custom_status ? 'true' : 'false'}
                        />
                        {errors?.custom_status && <ErrorText>{errors.custom_status?.message}</ErrorText>}
                    </TextField.Root>
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