import { RavenMessageAction } from "@/types/RavenIntegrations/RavenMessageAction"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Box, Button, Checkbox, Dialog, Select, Text, TextArea, TextField } from "@radix-ui/themes"
import clsx from "clsx"
import { useFrappeGetCall, useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk"
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { HStack, Stack } from "@/components/layout/Stack"
import { RavenMessageActionFields } from "@/types/RavenIntegrations/RavenMessageActionFields"
import { ErrorText, HelperText, Label } from "@/components/common/Form"
import LinkFormField from "@/components/common/LinkField/LinkFormField"
import { useEffect } from "react"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { useSetAtom } from "jotai"
import { messageActionAtom } from "./MessageActionController"
import { toast } from "sonner"
import { Loader } from "@/components/common/Loader"

interface MessageActionModalProps {
    messageID: string,
    actionID: string,
    onClose: () => void
}

const MessageActionModal = ({ messageID, actionID, onClose }: MessageActionModalProps) => {

    const { data: action } = useFrappeGetDoc<RavenMessageAction>("Raven Message Action", actionID, actionID ? undefined : null)

    return <Dialog.Root open={actionID !== ''} onOpenChange={onClose}>
        {action &&
            <Dialog.Content className={'static'}>

                <Dialog.Title>{action.title}</Dialog.Title>
                <Dialog.Description size='2'>{action.description ? action.description : action.action}</Dialog.Description>

                <MessageActionDialogContent action={action} messageID={messageID} />

            </Dialog.Content>
        }

    </Dialog.Root>

}

export default MessageActionModal

const MessageActionDialogContent = ({ action, messageID }: { action: RavenMessageAction, messageID: string }) => {

    // Fetch the form default values for the action and message
    const { data, error } = useFrappeGetCall('raven.api.message_actions.get_action_defaults', {
        action_id: action.name,
        message_id: messageID
    }, undefined, {
        revalidateOnFocus: false
    })

    return <Stack pt='4'>
        {error && <ErrorBanner error={error} />}
        <MessageActionForm action={action} messageID={messageID} defaultValues={data?.message} />
    </Stack>
}

const MessageActionForm = ({ action, messageID, defaultValues }: { action: RavenMessageAction, messageID: string, defaultValues?: Record<string, any> }) => {

    const setMessageAction = useSetAtom(messageActionAtom)
    const methods = useForm({
        defaultValues
    })

    useEffect(() => {
        methods.reset(defaultValues)
    }, [defaultValues])

    const { call, error, loading } = useFrappePostCall('raven.api.message_actions.execute_action')

    const onSubmit = (data: Record<string, any>) => {
        call({
            action_id: action.name,
            message_id: messageID,
            values: data
        }).then(() => {
            toast.success("Success", {
                description: action.success_message
            })

            setMessageAction({ actionID: '', messageID: '' })
        })
    }

    return <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack gap='3'>
                {error && <ErrorBanner error={error} />}
                {action.fields?.map((field, index) => {
                    return <FieldRenderer key={field.fieldname} field={field} autoFocus={index === 0} />
                })}

                <HStack justify='end'>
                    <Dialog.Close>
                        <Button color='gray' variant="soft" disabled={loading}>Cancel</Button>
                    </Dialog.Close>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader className="text-white" />}
                        Save
                    </Button>
                </HStack>
            </Stack>
        </form>
    </FormProvider>

}

type DataFieldTypes = "number" | "search" | "time" | "text" | "hidden" | "tel" | "url" | "email" | "date" | "datetime-local" | "month" | "password" | "week"

const FieldRenderer = ({ field, autoFocus }: { field: RavenMessageActionFields, autoFocus?: boolean }) => {

    const { register, control, formState: { errors } } = useFormContext()

    const hasError = !!errors[field.fieldname]

    const requiredRule = field.is_required === 1 ? `${field.label} is required` : false

    const ariaInvalid = hasError ? "true" : "false"
    const ariaDescribedby = hasError ? `${field.fieldname}-error` : field.helper_text ? `${field.fieldname}-helper` : undefined

    const FieldLabel = () => {
        return <Label isRequired={field.is_required === 1} htmlFor={field.fieldname}>{field.label}</Label>
    }

    const FieldHelperText = () => {
        if (!field.helper_text) return null
        return <HelperText id={`${field.fieldname}-helper`}>{field.helper_text}</HelperText>
    }

    const FieldError = () => {
        if (!errors[field.fieldname]) return null
        return <ErrorText id={`${field.fieldname}-error`}>{errors[field.fieldname]?.message as string}</ErrorText>
    }

    const FieldComponent = () => {

        if (field.type === "Small Text") {

            return <Box>
                <FieldLabel />
                <TextArea
                    {...register(field.fieldname, { required: requiredRule })}
                    id={field.fieldname}
                    aria-invalid={ariaInvalid}
                    aria-required={field.is_required === 1}
                    aria-describedby={ariaDescribedby}
                    rows={5}
                    autoFocus={autoFocus}
                />
            </Box>
        }

        if (field.type === "Select") {
            return <Box>
                <FieldLabel />
                <Controller
                    name={field.fieldname}
                    rules={{
                        required: requiredRule
                    }}
                    control={control}
                    render={({ field: { value, onChange, onBlur, name, disabled, ref } }) => (
                        <Select.Root value={value}
                            name={name}
                            required={field.is_required === 1}
                            onValueChange={onChange}
                        >
                            <Select.Trigger
                                onBlur={onBlur}
                                className='w-full'
                                id={field.fieldname}
                                ref={ref}
                                aria-invalid={ariaInvalid}
                                aria-required={field.is_required === 1}
                                aria-describedby={ariaDescribedby}
                                disabled={disabled}
                                autoFocus={autoFocus}
                            />
                            <Select.Content>
                                {field.options?.split("\n").map(option => {
                                    return <Select.Item key={option} value={option}>{option}</Select.Item>
                                })}
                            </Select.Content>
                        </Select.Root>
                    )}
                />
            </Box>
        }

        if (field.type === "Link") {
            return <Box>
                <LinkFormField
                    name={field.fieldname}
                    doctype={field.options ?? ""}
                    label={field.label}
                    required={field.is_required === 1}
                    autofocus={autoFocus}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    aria-required={field.is_required === 1}
                />
            </Box>
        }

        if (field.type === "Number") {
            return <Box>
                <FieldLabel />
                <TextField.Root
                    {...register(field.fieldname, { required: requiredRule, valueAsNumber: true })}
                    id={field.fieldname}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    aria-required={field.is_required === 1}
                    type="number"
                    autoFocus={autoFocus}
                />
            </Box>
        }

        if (field.type === "Checkbox") {
            return <Text as="label" size="2">
                <HStack>
                    <Controller
                        control={control}
                        rules={{
                            required: requiredRule
                        }}
                        name={field.fieldname}
                        render={({ field: { value, onChange, onBlur, name, disabled, ref } }) => (
                            <Checkbox
                                checked={value ? true : false}
                                disabled={disabled}
                                name={name}
                                aria-invalid={ariaInvalid}
                                aria-describedby={ariaDescribedby}
                                aria-required={field.is_required === 1}
                                onBlur={onBlur}
                                ref={ref}
                                onCheckedChange={(v) => onChange(v ? 1 : 0)}
                                autoFocus={autoFocus}
                            />
                        )} />

                    {field.label}
                </HStack>
            </Text>
        }

        if (field.type === "Date") {
            return <Box>
                <FieldLabel />
                <TextField.Root
                    {...register(field.fieldname, { required: requiredRule })}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    aria-required={field.is_required === 1}
                    id={field.fieldname}
                    type="date"
                    autoFocus={autoFocus}
                />
            </Box>
        }

        if (field.type === "Time") {
            return <Box>
                <FieldLabel />
                <TextField.Root
                    {...register(field.fieldname, { required: requiredRule })}
                    id={field.fieldname}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    aria-required={field.is_required === 1}
                    type="time"
                    autoFocus={autoFocus}
                />
            </Box>
        }

        if (field.type === "Datetime") {
            return <Box>
                <FieldLabel />
                <TextField.Root
                    {...register(field.fieldname, { required: requiredRule })}
                    id={field.fieldname}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    aria-required={field.is_required === 1}
                    type="datetime-local"
                    autoFocus={autoFocus}
                />
            </Box>
        }

        return <Box>
            <FieldLabel />
            <TextField.Root
                {...register(field.fieldname, { required: requiredRule })}
                id={field.fieldname}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedby}
                aria-required={field.is_required === 1}
                type={field.options ? field.options as DataFieldTypes : "text"}
                autoFocus={autoFocus}
            />
        </Box>
    }

    return <Stack>
        <FieldComponent />
        <FieldError />
        <FieldHelperText />
    </Stack>

}