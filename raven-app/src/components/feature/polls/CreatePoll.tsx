import { ErrorText, Label } from "@/components/common/Form"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useToast } from "@/hooks/useToast"
import { RavenPoll } from "@/types/RavenMessaging/RavenPoll"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Button, Checkbox, Dialog, Flex, IconButton, TextArea, TextField, Text, Box } from "@radix-ui/themes"
import { useFrappePostCall } from "frappe-react-sdk"
import { useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { BiPlus, BiTrash } from "react-icons/bi"
import { MdOutlineBarChart } from "react-icons/md"
import { useParams } from "react-router-dom"

interface CreatePollProps {
    buttonStyle?: string,
    isDisabled?: boolean
}

export const CreatePoll = ({ buttonStyle, isDisabled = false }: CreatePollProps) => {

    const methods = useForm<RavenPoll>({
        // Initialize the form with an option field by default
        defaultValues: {
            options: [{
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }],
        }
    })

    const { register, handleSubmit, formState: { errors }, control, reset: resetForm } = methods
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()

    const { fields, remove, append } = useFieldArray({
        control: control,
        name: 'options'
    })

    const handleAddOption = () => {
        append({
            name: '',
            creation: '',
            modified: '',
            owner: '',
            modified_by: '',
            docstatus: 0,
            option: ''
        })
    }

    const handleRemoveOption = (index: number) => {
        // Do not remove the last option
        if (fields.length === 1) {
            return
        }
        remove(index)
    }

    const reset = () => {
        resetForm()
    }

    const onClose = () => {
        setIsOpen(false)
        reset()
    }

    const onOpenChange = (open: boolean) => {
        setIsOpen(open)
        reset()
    }

    const { call: createPoll, error } = useFrappePostCall('raven.api.raven_poll.create_poll')
    const { channelID } = useParams<{ channelID: string }>()

    const onSubmit = (data: RavenPoll) => {
        return createPoll({
            ...data,
            "channel_id": channelID
        }).then(() => {
            toast({
                title: "Poll created successfully",
                variant: 'success',
            })
            onClose()
        }).catch((err) => {
            toast({
                title: "Error creating poll",
                description: err.message,
                variant: "destructive",
            })
        })
    }

    return <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
        <Dialog.Trigger>
            <IconButton
                size='1'
                variant='ghost'
                className={buttonStyle}
                disabled={isDisabled}
                title='Create Poll'
                aria-label={"create poll"}>
                <MdOutlineBarChart />
            </IconButton>
        </Dialog.Trigger>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            <Dialog.Title>
                Create Poll
            </Dialog.Title>
            <Dialog.Description size='2'>
                Create a quick poll to get everyone's thoughts on a topic.
            </Dialog.Description>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex direction='column' gap='4' py='2'>

                        <ErrorBanner error={error} />

                        <Box>
                            <Label htmlFor='question' isRequired>Question</Label>
                            <TextArea {...register("question", {
                                required: 'Question is required'
                            })} placeholder="Who do you think deserves to sit on the Iron Throne?" required />
                            {errors?.question && <ErrorText>{errors.question?.message}</ErrorText>}
                        </Box>

                        <Box>
                            <Label htmlFor='options' isRequired>Options</Label>
                            <Flex direction={'column'} gap='2'>
                                {fields && fields.map((field, index) => (
                                    <Flex key={field.id} gap='2' align={'start'}>
                                        <div className={'w-full'}>
                                            <TextField.Root>
                                                <TextField.Input placeholder={`option ${index + 1}`} {...register(`options.${index}.option`, {
                                                    required: 'Option is required',
                                                    minLength: {
                                                        value: 1,
                                                        message: 'Option cannot be empty'
                                                    }
                                                })} />
                                            </TextField.Root>
                                            {errors?.options?.[index]?.option && <ErrorText>{errors.options?.[index]?.option?.message}</ErrorText>}
                                        </div>
                                        <IconButton
                                            mt='2'
                                            disabled={fields.length === 1}
                                            color="red"
                                            aria-label="delete"
                                            variant={'ghost'}
                                            size={'1'}
                                            title="Remove Option"
                                            onClick={() => handleRemoveOption(index)}>
                                            <BiTrash />
                                        </IconButton>
                                    </Flex>
                                ))}

                                <Button
                                    type='button'
                                    size={'1'}
                                    variant='ghost'
                                    style={{ width: 'fit-content' }}
                                    onClick={handleAddOption}>
                                    <BiPlus />
                                    Add Option
                                </Button>
                            </Flex>
                        </Box>

                        <Box>
                            <Label>Settings</Label>
                            <Flex direction={'column'} gap='2'>
                                <Text as='label' size='2'>
                                    <Flex gap="2" align='center'>
                                        <Controller
                                            name={'is_multi_choice'}
                                            control={control}
                                            render={({ field: { onChange, ...f } }) => (
                                                <Checkbox
                                                    {...f}
                                                    onCheckedChange={(v) => onChange(v ? 1 : 0)} />
                                            )}
                                        />
                                        Allow users to select multiple options
                                    </Flex>
                                </Text>

                                <Text as='label' size='2'>
                                    <Flex gap="2" align='center'>
                                        <Controller
                                            name='is_anonymous'
                                            control={control}
                                            render={({ field: { onChange, ...f } }) => (
                                                <Checkbox
                                                    {...f}
                                                    onCheckedChange={(v) => onChange(v ? 1 : 0)} />
                                            )}
                                        />
                                        Make this poll anonymous
                                    </Flex>
                                </Text>

                            </Flex>
                        </Box>

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray" onClick={onClose}>Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit">Create</Button>
                        </Flex>

                    </Flex>
                </form>
            </FormProvider>

        </Dialog.Content>
    </Dialog.Root>
}