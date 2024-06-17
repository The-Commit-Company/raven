import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useUserData } from "@/hooks/useUserData"
import { Box, Button, Flex, TextField, Text } from "@radix-ui/themes"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from 'sonner'
import { ImageUploader } from "../UploadImage/ImageUploader"

type UserProfile = {
    full_name?: string,
    user_image?: string,
}

export const UserProfile = () => {

    const methods = useForm<UserProfile>()
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()

    const currentUser = useUserData()

    const onSubmit = (data: UserProfile) => {
        updateDoc("Raven User", currentUser?.name ?? null, {
            full_name: data.full_name,
            user_image: data.user_image
        }).then(() => {
            toast.success("Profile updated")
        }).catch(() => {
            toast.error("Profile update failed")
        })
    }

    return (
        <Flex direction='column' gap='4' px='6' py='4'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <Flex direction={'column'} gap='4'>

                        <Flex justify={'between'} align={'center'}>
                            <Text size='3' className={'font-semibold'}>Your Profile</Text>
                            <Button type='submit' disabled={updatingDoc}>
                                {updatingDoc && <Loader />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>
                        </Flex>

                        <Flex gap='2' direction='column' width='100%'>
                            <ErrorBanner error={error} />
                            <Box width='100%'>
                                <Label htmlFor='full_name'>Full Name</Label>
                                <TextField.Root
                                    maxLength={140}
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
                            </Box>
                        </Flex>

                        <ImageUploader />
                    </Flex>

                </form>
            </FormProvider>
        </Flex>
    )
}