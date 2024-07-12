import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { Box, Button, Flex, TextField, Text, DropdownMenu, Card, IconButton, Separator, Popover } from "@radix-ui/themes"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from 'sonner'
import { ImageUploader } from "../UploadImage/ImageUploader"
import { getStatusText } from "../AvailabilityStatus/SetUserAvailabilityMenu"
import useCurrentRavenUser from "@/hooks/useCurrentRavenUser"
import { useState } from "react"
import { GrPowerReset } from "react-icons/gr"
import { BiSmile } from "react-icons/bi"
import EmojiPicker from "@/components/common/EmojiPicker/EmojiPicker"
import { useIsDesktop } from "@/hooks/useMediaQuery"

type UserProfile = {
    full_name?: string,
    user_image?: string,
    availability_status?: string,
    custom_status?: string
}

export const UserProfile = () => {

    const { myProfile, mutate } = useCurrentRavenUser()
    const methods = useForm<UserProfile>({
        defaultValues: {
            full_name: myProfile?.full_name ?? '',
            user_image: myProfile?.user_image ?? '',
            availability_status: myProfile?.availability_status ?? '',
            custom_status: myProfile?.custom_status ?? ''
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()

    const [availabilityStatus, setAvailabilityStatus] = useState(myProfile?.availability_status ?? '')

    const onSubmit = (data: UserProfile) => {
        updateDoc("Raven User", myProfile?.name ?? null, {
            full_name: data.full_name,
            user_image: data.user_image,
            availability_status: availabilityStatus,
            custom_status: data.custom_status
        }).then(() => {
            toast.success("Profile updated")
            mutate()
        }).catch(() => {
            toast.error("Profile update failed")
        })
    }

    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const onEmojiSelect = (emoji: string) => {
        methods.setValue('custom_status', `${methods.getValues('custom_status')} ${emoji}`)
    }

    const isDesktop = useIsDesktop()

    return (
        <Flex direction='column' gap='4' px='6' py='4'>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <Flex direction={'column'} gap='4'>
                        <Flex justify={'between'} align={'center'}>
                            <Flex direction='column' gap='0'>
                                <Text size='3' className={'font-semibold'}>Profile</Text>
                                <Text size='1' color='gray'>Manage your Raven profile</Text>
                            </Flex>
                            <Button type='submit' disabled={updatingDoc}>
                                {updatingDoc && <Loader />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>
                        </Flex>

                        <Card className="p-0 align-middle justify-center">
                            <Flex direction={'column'} gap='0'>

                                <Box className="flex justify-center items-center bg-slate-2 dark:bg-slate-3 py-6">
                                    <ImageUploader />
                                </Box>

                                <ErrorBanner error={error} />

                                <Flex gap='4' direction='column' className={'py-4 px-6 dark:bg-slate-2'}>

                                    <Flex justify={'between'} align={'center'}>
                                        <Label htmlFor='full_name'>Full Name</Label>
                                        <TextField.Root
                                            autoFocus
                                            maxLength={140}
                                            className={'w-48 sm:w-96'}
                                            id='full_name'
                                            placeholder='full name'
                                            {...register('full_name', {
                                                maxLength: {
                                                    value: 140,
                                                    message: "Name cannot be more than 140 characters."
                                                }
                                            })}
                                            aria-invalid={errors.full_name ? 'true' : 'false'}
                                        />
                                        {errors?.full_name && <ErrorText>{errors.full_name?.message}</ErrorText>}
                                    </Flex>

                                    <Separator className={'w-full bg-slate-4'} />

                                    <Flex justify={'between'} align={'center'}>
                                        <Label htmlFor="availability_status">Availability Status</Label>
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger>
                                                <Flex gap={'2'} align='center' className={'text-sm px-2 py-1 border border-gray-7 rounded w-48 sm:w-96'}>{availabilityStatus ? getStatusText(availabilityStatus) :
                                                    <Text color="gray">Set Availability</Text>
                                                }</Flex>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content variant="soft">
                                                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Available')}>
                                                    {getStatusText('Available')}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Away')}>
                                                    {getStatusText('Away')}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Do not disturb')}>
                                                    {getStatusText('Do not disturb')}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Invisible')}>
                                                    {getStatusText('Invisible')}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('')}>
                                                    <GrPowerReset fontSize={'0.7rem'} /> Reset
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                    </Flex>

                                    <Separator className={'w-full bg-slate-4'} />

                                    <Flex justify={'between'} align={'center'}>
                                        <Flex direction={'column'} gap='0'>
                                            <Label htmlFor='custom_status'>Custom Status</Label>
                                            {isDesktop && <Text size={'1'} color={'gray'} style={{ lineHeight: '0.8' }}>Share what you are up to</Text>}
                                        </Flex>
                                        <Flex align={'center'} gap='3'>
                                            <Flex direction={'column'} gap='1'>
                                                <TextField.Root
                                                    id="custom_status"
                                                    placeholder='e.g. Out of Office'
                                                    maxLength={140}
                                                    {...register('custom_status', {
                                                        maxLength: {
                                                            value: 140,
                                                            message: "Status cannot be more than 140 characters."
                                                        }
                                                    })}
                                                    className={'w-48 sm:w-96'}
                                                    aria-invalid={errors.custom_status ? 'true' : 'false'}>

                                                    <TextField.Slot side='right'>
                                                        <Popover.Root>
                                                            <Popover.Trigger>
                                                                <IconButton type='button' className={'rounded-full'} onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)} variant='ghost' color='gray'>
                                                                    <BiSmile size='18' />
                                                                </IconButton>
                                                            </Popover.Trigger>
                                                            <Popover.Content className={'p-0'}>
                                                                <EmojiPicker onSelect={onEmojiSelect} />
                                                            </Popover.Content>
                                                        </Popover.Root>
                                                    </TextField.Slot>
                                                </TextField.Root>
                                                {errors.custom_status && <ErrorText>{errors.custom_status.message}</ErrorText>}
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Card>
                    </Flex>

                </form>
            </FormProvider>
        </Flex>
    )
}