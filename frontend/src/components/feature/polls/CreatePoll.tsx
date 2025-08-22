import { ErrorText, Label } from "@/components/common/Form"
import { DateTimePicker } from "@/components/common/DateTimePicker"
import { ErrorBanner, getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { RavenPoll } from "@/types/RavenMessaging/RavenPoll"
import { Button, Checkbox, Dialog, Flex, IconButton, TextArea, TextField, Text, Box } from "@radix-ui/themes"
import { useFrappePostCall } from "frappe-react-sdk"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { BiPlus, BiTrash } from "react-icons/bi"
import { toast } from "sonner"
import { useState } from "react"

const CreatePollContent = ({ channelID, setIsOpen }: { channelID: string, setIsOpen: (open: boolean) => void }) => {

    const [hasEndDate, setHasEndDate] = useState(false)

    const methods = useForm<RavenPoll>({
        // Initialize the form with 2 option fields by default
        defaultValues: {
            options: [{
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }, {
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

    const { fields, remove, append } = useFieldArray({
        control: control,
        name: 'options'
    })

    const handleAddOption = () => {
        // limit the number of options to 10
        if (fields.length >= 10) {
            return
        } else {
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
    }

    const handleRemoveOption = (index: number) => {
        // Do not remove the last 2 options
        if (fields.length === 2) {
            return
        }
        remove(index)
    }

    const reset = () => {
        resetForm()
        setHasEndDate(false)
    }

    const onClose = () => {
        setIsOpen(false)
        reset()
    }

    const { call: createPoll, error } = useFrappePostCall('raven.api.raven_poll.create_poll')

    const onSubmit = async (data: RavenPoll) => {
        // If hasEndDate is false, clear the end_date field
        if (!hasEndDate) {
            data.end_date = undefined
        }

        return createPoll({
            ...data,
            "channel_id": channelID
        }).then(() => {
            toast.success("Poll created")
            onClose()
        }).catch((err) => {
            toast.error("There was an error.", {
                description: getErrorMessage(err)
            })
        })
    }

    return <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction='column' gap='4' py='2'>

                <ErrorBanner error={error} />

                <Box>
                    <Label htmlFor='question' isRequired>Question</Label>
                    <TextArea {...register("question", {
                        required: 'Question is required'
                    })} placeholder="Ask a question to gather responses" required />
                    {errors?.question && <ErrorText>{errors.question?.message}</ErrorText>}
                </Box>

                <Box>
                    <Label htmlFor='options' isRequired>Options</Label>
                    <Flex direction={'column'} gap='2'>
                        {fields && fields.map((field, index) => (
                            <Flex key={field.id} gap='2' align={'start'}>
                                <div className={'w-full'}>
                                    <TextField.Root placeholder={`Option ${index + 1}`} {...register(`options.${index}.option`, {
                                        required: 'Option is required',
                                        minLength: {
                                            value: 1,
                                            message: 'Option cannot be empty'
                                        }
                                    })}>
                                    </TextField.Root>
                                    {errors?.options?.[index]?.option && <ErrorText>{errors.options?.[index]?.option?.message}</ErrorText>}
                                </div>
                                <IconButton
                                    mt='2'
                                    disabled={fields.length === 2}
                                    color="red"
                                    aria-label="delete"
                                    variant={'ghost'}
                                    size={'1'}
                                    title="Remove Option"
                                    onClick={() => handleRemoveOption(index)}>
                                    <BiTrash size={'12'} />
                                </IconButton>
                            </Flex>
                        ))}

                        <Flex justify={'between'} align={'center'}>
                            <Button
                                disabled={fields.length >= 10}
                                type='button'
                                size={'1'}
                                variant='ghost'
                                style={{ width: 'fit-content' }}
                                onClick={handleAddOption}>
                                <BiPlus size={'14'} />
                                Add Option
                            </Button>
                            <Text size='1' className="text-gray-500">Maximum of 10 options allowed</Text>
                        </Flex>
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

                        <Text as='label' size='2'>
                            <Flex gap="2" align='center'>
                                <Checkbox
                                    checked={hasEndDate}
                                    onCheckedChange={(checked) => {
                                        setHasEndDate(checked as boolean)
                                        if (!checked) {
                                            methods.setValue('end_date', undefined)
                                        }
                                    }}
                                />
                                Set poll end date and time
                            </Flex>
                        </Text>

                    </Flex>
                </Box>

                {hasEndDate && (
                    <Controller
                        name="end_date"
                        control={control}
                        rules={{
                            required: hasEndDate ? 'End date is required when poll end date is enabled' : false,
                            validate: (value) => {
                                if (!hasEndDate) return true; // Not required if checkbox is unchecked
                                if (!value) return 'End date is required when poll end date is enabled';
                                const selectedDate = new Date(value);
                                const now = new Date();
                                return selectedDate > now || 'End date must be in the future';
                            }
                        }}
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <DateTimePicker
                                value={value}
                                onChange={onChange}
                                label="Poll end date and time"
                                error={error?.message}
                                minDate={new Date()}
                                required={hasEndDate}
                            />
                        )}
                    />
                )}

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" onClick={onClose}>Cancel</Button>
                    </Dialog.Close>
                    <Button type="submit">Create</Button>
                </Flex>

            </Flex>
        </form>
    </FormProvider>
}

export default CreatePollContent