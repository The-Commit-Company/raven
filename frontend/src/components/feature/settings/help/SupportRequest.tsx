import { Box, Button, Dialog, Flex, RadioCards, Text, TextArea, TextField } from "@radix-ui/themes"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { MdOutlineFeedback } from "react-icons/md";
import { LuBug } from "react-icons/lu"
import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { HStack, Stack } from "@/components/layout/Stack"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import useCurrentRavenUser from "@/hooks/useCurrentRavenUser"

type Props = {
    open: boolean
    onClose: VoidFunction
}
const CreateSupportTicketDialog = ({ open, onClose }: Props) => {

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Content maxWidth={'580px'} className={DIALOG_CONTENT_CLASS}>
                <Dialog.Title mb={'1'}>Help and Support</Dialog.Title>
                <Dialog.Description size={'2'}>Create a new support request</Dialog.Description>
                <SupportRequestForm onClose={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

interface SupportRequestFormFields {
    requestType: "feedback" | "bug"
    email: string
    description: string
}
const SupportRequestForm = ({ onClose }: { onClose: () => void }) => {

    const { myProfile } = useCurrentRavenUser()

    const currentUserEmail = useMemo(() => {
        const email = myProfile?.name;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email) ? email : "";
    }, [myProfile]);

    const {
        control,
        register,
        formState: { errors },
        handleSubmit
    } = useForm<SupportRequestFormFields>({
        defaultValues: {
            requestType: "feedback",
            email: currentUserEmail
        }
    })

    const [loading, setLoading] = useState(false)

    const onSubmit = (data: SupportRequestFormFields) => {
        setLoading(true)

        // Will send payload to API endpoint later on

        setTimeout(() => {
            setLoading(false)
            onClose()
        }, 1500)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="2" pt="3">
                <Controller
                    name="requestType"
                    control={control}
                    rules={{
                        required: 'Request type is required',
                        validate: (value) => ['feedback', 'bug'].includes(value) || 'Invalid request type'
                    }}
                    render={({ field: { onChange, value } }) => (
                        <RadioCards.Root
                            value={value}
                            onValueChange={onChange}
                        >
                            <RadioCards.Item value="feedback">
                                <Flex direction="column" width="100%" gap="1">
                                    <Flex align="center" gap="3">
                                        <MdOutlineFeedback size="16" />
                                        <Text weight="bold">Feedback</Text>
                                    </Flex>
                                    <Text>We'd love to hear your feedback!</Text>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="bug">
                                <Flex direction="column" width="100%" gap="1">
                                    <Flex align="center" gap="3">
                                        <LuBug size="16" />
                                        <Text weight="bold">Bug</Text>
                                    </Flex>
                                    <Text>Encountered an issue?</Text>
                                </Flex>
                            </RadioCards.Item>
                        </RadioCards.Root>
                    )}
                />
                {errors.requestType && <ErrorText>{errors.requestType.message}</ErrorText>}

                <Stack>
                    <Box>
                        <Label htmlFor='email' isRequired>Email</Label>
                        <TextField.Root
                            id='email'
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            placeholder="email@example.com"
                            aria-invalid={errors.email ? 'true' : 'false'}
                        />
                    </Box>
                    {errors.email && <ErrorText>{errors.email?.message}</ErrorText>}
                </Stack>

                <Stack>
                    <Box>
                        <Label htmlFor='description' isRequired>Description</Label>
                        <TextArea
                            id='description'
                            {...register('description', {
                                required: 'Description is required',
                                minLength: {
                                    value: 10,
                                    message: 'Description must be at least 10 characters'
                                }
                            })}
                            rows={5}
                            resize='vertical'
                            placeholder="Please provide detailed information"
                            aria-invalid={errors.description ? 'true' : 'false'}
                        />
                    </Box>
                    {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
                </Stack>

                <HStack justify={'end'} pt='4'>
                    <Dialog.Close>
                        <Button color='gray' variant={'soft'} disabled={loading}>Cancel</Button>
                    </Dialog.Close>
                    <Button type="submit" disabled={loading} >
                        {loading ? <Loader className="text-white" /> : null}
                        Submit
                    </Button>
                </HStack>
            </Stack>
        </form>
    );
}

export default CreateSupportTicketDialog