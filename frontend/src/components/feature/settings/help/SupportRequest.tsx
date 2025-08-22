import { ReactNode } from "react";
import { Box, Button, Dialog, Flex, Link, RadioCards, Text, TextArea, TextField } from "@radix-ui/themes"
import { Controller, useForm } from "react-hook-form"
import { MdOutlineMessage, MdOutlineQuestionMark } from "react-icons/md";
import clsx from "clsx";
import { useFrappePostCall } from "frappe-react-sdk";
import { toast } from "sonner";
import { BiBug } from "react-icons/bi";
import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { HStack, Stack } from "@/components/layout/Stack"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { useUserData } from "@/hooks/useUserData";

type TicketType = "Feedback" | "Question" | "Bug"

const subTitles: Record<TicketType, { heading: string, subHeading: string, defaultTextAreaValue: string, footerHeading: ReactNode }> = {
    "Feedback": {
        heading: "Send feedback",
        subHeading: "How can we improve Raven? If you have a feature request, can you also share how you would use it and why it's important to you?",
        defaultTextAreaValue: "What if...",
        footerHeading: <span>You can also email us at <Link href="mailto:support@thecommit.company" underline="none" size='1' target="_blank">support@thecommit.company</Link>. We can't respond to every request but we read all of them.</span>
    },
    "Question": {
        heading: "Ask a question",
        subHeading: "How can we help? Please share any relevant information we may need to answer your question.",
        defaultTextAreaValue: "How do I...",
        footerHeading: <span>You can also email us at <Link href="mailto:support@thecommit.company" underline="none" size='1' target="_blank">support@thecommit.company</Link></span>
    },
    "Bug": {
        heading: "Contact us",
        subHeading: "What is the issue? If you're reporting a bug, what are the steps you took so we can reproduce the behaviour?",
        defaultTextAreaValue: "Something seems wrong...",
        footerHeading: <span>You can also email us at <Link href="mailto:support@thecommit.company" underline="none" size='1' target="_blank">support@thecommit.company</Link></span>
    },
};

interface CreateSupportTicketDialogProps {
    open: boolean
    onClose: VoidFunction
}

const CreateSupportTicketDialog = ({ open, onClose }: CreateSupportTicketDialogProps) => {

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Content maxWidth={'700px'} className={clsx(DIALOG_CONTENT_CLASS)}>
                <SupportRequestForm onClose={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

interface SupportRequestFormFields {
    ticket_type: TicketType
    email: string
    description: string
}
interface SupportRequestFormProps {
    onClose: () => void
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SupportRequestForm = ({ onClose }: SupportRequestFormProps) => {

    const { name } = useUserData()

    const {
        control,
        register,
        formState: { errors },
        handleSubmit,
        watch
    } = useForm<SupportRequestFormFields>({
        defaultValues: {
            ticket_type: "Feedback",
            email: emailRegex.test(name ?? '') ? name : ""
        }
    })

    const requestType = watch("ticket_type")

    const { call, error, loading } = useFrappePostCall('raven.api.support_request.submit_support_request')

    const onSubmit = (data: SupportRequestFormFields) => {

        // @ts-expect-error
        const context = `Raven: v${frappe?.boot.versions.raven}, Frappe: v${frappe?.boot.versions.frappe}, ERPNext: v${frappe?.boot.versions.erpnext ?? "N/A"}`
        call({
            email: data.email,
            ticket_type: data.ticket_type,
            subject: data.description.substring(0, 140),
            description: data.description + `<br><br>${context}`,
        })
            .then(() => {
                toast.success("Form submitted successfully!")
                onClose()
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog.Title>{subTitles[requestType].heading}</Dialog.Title>
            <Dialog.Description size={'2'} className="min-h-10 select-none">{subTitles[requestType].subHeading}</Dialog.Description>
            <Stack gap="2" pt="3">
                <Controller
                    name="ticket_type"
                    control={control}
                    rules={{
                        required: 'Request type is required',
                        validate: (value) => Object.keys(subTitles).includes(value) || 'Invalid request type'
                    }}
                    render={({ field: { onChange, value } }) => (
                        <RadioCards.Root
                            value={value}
                            onValueChange={onChange}
                        >
                            <RadioCards.Item value="Feedback">
                                <Flex direction="column" width="100%" gap="1">
                                    <Flex align="center" gap="3">
                                        <MdOutlineMessage size="16" />
                                        <Text weight="bold">Feedback</Text>
                                    </Flex>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="Question">
                                <Flex direction="column" width="100%" gap="1">
                                    <Flex align="center" gap="3">
                                        <MdOutlineQuestionMark size="16" />
                                        <Text weight="bold">Question</Text>
                                    </Flex>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="Bug">
                                <Flex direction="column" width="100%" gap="1">
                                    <Flex align="center" gap="3">
                                        <BiBug size="16" />
                                        <Text weight="bold">Bug</Text>
                                    </Flex>
                                </Flex>
                            </RadioCards.Item>
                        </RadioCards.Root>
                    )}
                />

                {errors.ticket_type && <ErrorText>{errors.ticket_type.message}</ErrorText>}

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
                            type="email"
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
                            placeholder={subTitles[requestType].defaultTextAreaValue}
                            aria-invalid={errors.description ? 'true' : 'false'}
                        />
                    </Box>
                    {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
                </Stack>

                <HStack justify="between" pt='4' gap="9">
                    <Text color="gray" size="1" className="select-none">{subTitles[requestType].footerHeading}</Text>
                    <Flex gap="2">
                        <Dialog.Close>
                            <Button color='gray' variant={'soft'} disabled={loading && !error}>Cancel</Button>
                        </Dialog.Close>
                        <Button type="submit" disabled={loading} >
                            {loading && !error ? <Loader className="text-white" /> : null}
                            Submit
                        </Button>
                    </Flex>
                </HStack>
            </Stack>
        </form>
    );
}

export default CreateSupportTicketDialog