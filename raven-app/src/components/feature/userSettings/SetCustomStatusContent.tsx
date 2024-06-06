import EmojiPicker from '@/components/common/EmojiPicker/EmojiPicker'
import { ErrorText } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { useUserData } from '@/hooks/useUserData'
import { Button, Dialog, Flex, TextField, Text, IconButton } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiSmile } from 'react-icons/bi'
import { toast } from 'sonner'

const SetCustomStatusContent = ({ onClose }: { onClose: VoidFunction }) => {

    const userData = useUserData()
    const { myProfile, mutate } = useCurrentRavenUser()

    const methods = useForm({
        defaultValues: {
            custom_status: myProfile?.custom_status ?? ''
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods

    const { call, error, loading } = useFrappePostCall('frappe.client.set_value')
    const onSubmit = useCallback((data: { custom_status: string }) => {
        call({
            doctype: 'Raven User',
            name: userData.name,
            fieldname: 'custom_status',
            value: data.custom_status
        }).then(() => {
            toast.success("User status updated")
            mutate()
            onClose()
        })
    }, [userData.name])

    const onEmojiSelect = (emoji: string) => {
        methods.setValue('custom_status', `${methods.getValues('custom_status')} ${emoji}`)
    }

    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)

    return (
        <>
            <Dialog.Title>Set a custom status</Dialog.Title>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <ErrorBanner error={error} />

                    <Flex direction={'column'} gap={'2'}>
                        <Text size='2' color='gray'>Share what you're up to</Text>
                        <Flex align={'center'} gap='3'>
                            <TextField.Root className={'w-96'}>
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
                                {errors.custom_status && <ErrorText>{errors.custom_status.message}</ErrorText>}
                            </TextField.Root>
                            <IconButton type='button' className={'rounded-full'} onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)} variant='ghost' color='gray'>
                                <BiSmile size='18' />
                            </IconButton>
                        </Flex>
                        {isEmojiPickerOpen && <EmojiPicker onSelect={onEmojiSelect} />}
                    </Flex>

                    <Flex gap="3" mt="6" justify="end" align='center'>
                        <Dialog.Close disabled={loading}>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </Flex>
                </form>
            </FormProvider>
        </>
    )
}

export default SetCustomStatusContent