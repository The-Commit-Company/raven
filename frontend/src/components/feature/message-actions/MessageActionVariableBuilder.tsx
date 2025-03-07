import { HStack } from '@/components/layout/Stack'
import { Stack } from '@/components/layout/Stack'
import useDoctypeMeta from '@/hooks/useDoctypeMeta'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { RavenMessageActionFields } from '@/types/RavenIntegrations/RavenMessageActionFields'
import { Badge, BadgeProps, Box, Button, Checkbox, Code, Dialog, IconButton, Select, Table, Text, TextArea, TextField, Tooltip, VisuallyHidden } from '@radix-ui/themes'
import { useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'
import { BiTrashAlt } from 'react-icons/bi'
import { FiEdit } from 'react-icons/fi'
import { DoctypeFieldSelect } from '../settings/ai/functions/DoctypeVariableDialogForm'
import { DocField } from '@/types/Core/DocField'
import { ErrorText, HelperText, Label } from '@/components/common/Form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import clsx from 'clsx'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

type Props = {}

const MessageActionVariableBuilder = (props: Props) => {
    const { control, watch } = useFormContext<RavenMessageAction>()

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'fields'
    })

    const addField = (data: Partial<RavenMessageActionFields>) => {
        // @ts-expect-error
        append(data)
    }

    const onEdit = (index: number, data: Partial<RavenMessageActionFields>) => {
        update(index, data as RavenMessageActionFields)
    }

    const action = watch('action')
    const doctype = watch('document_type')
    return <Stack>
        <HStack justify='end' align='center'>
            {action === "Create Document" && doctype &&
                <ImportDoctypeVariables append={addField} />
            }
            <AddFieldDialog onAdd={addField} doctype={doctype} />
        </HStack>

        <Stack>
            <Table.Root variant='surface' className='rounded-sm'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Label</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Fieldname</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Required</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Options</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Default Value</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {fields.map((field, index) => {
                        return <Table.Row key={field.id}>
                            <Table.Cell><Text as='span' size='2' weight='medium'>{field.label}</Text> <Badge color={getColorForFieldType(field.type)} className='ml-2 rounded-md'>{field.type}</Badge></Table.Cell>
                            <Table.Cell><Code variant='ghost'>{field.fieldname}</Code></Table.Cell>
                            <Table.Cell><Checkbox checked={!!field.is_required} /></Table.Cell>
                            <Table.Cell>
                                {field.options ? field.type === 'Select' ?
                                    <Tooltip content={field.options.split('\n').join(', ')}>
                                        <Badge color='blue' className='rounded-md'>{field.options.split('\n').length} Options</Badge>
                                    </Tooltip>
                                    : <Badge color='iris' variant='soft' className='rounded-md'>{field.options}</Badge> : null}
                            </Table.Cell>
                            <Table.Cell>{field.default_value}</Table.Cell>
                            <Table.Cell>
                                <HStack align='center' pr='2' gap='4'>
                                    <EditFieldDialog onEdit={(data) => onEdit(index, data)} field={field} doctype={doctype} />
                                    <IconButton
                                        size='2'
                                        color='red'
                                        variant='ghost'
                                        type='button'
                                        onClick={() => remove(index)}>
                                        <BiTrashAlt size='16' />
                                    </IconButton>
                                </HStack>
                            </Table.Cell>
                        </Table.Row>
                    })}
                </Table.Body>
            </Table.Root>
        </Stack>
    </Stack>
}

export default MessageActionVariableBuilder

export const getColorForFieldType = (type: RavenMessageActionFields['type']): BadgeProps['color'] => {
    switch (type) {
        case 'Select': return 'blue'
        case 'Number': return 'purple'
        case 'Date': return 'violet'
        case 'Datetime': return 'violet'
        case 'Time': return 'violet'
        case 'Data': return 'green'
        case 'Checkbox': return 'pink'
        case 'Small Text': return 'orange'
        case 'Link': return 'sky'
        default: return 'gray'
    }
}

const getType = (fieldtype: DocField['fieldtype']): RavenMessageActionFields['type'] => {
    switch (fieldtype) {
        case 'Select': return 'Select'
        case 'Autocomplete': return 'Link'
        case 'Link': return 'Link'
        case 'Int': return 'Number'
        case 'Currency': return 'Number'
        case 'Float': return 'Number'
        case 'Date': return 'Date'
        case 'Datetime': return 'Datetime'
        case 'Time': return 'Time'
        case 'Data': return 'Data'
        case 'Small Text': return 'Small Text'
        case 'Long Text': return 'Small Text'
        case 'Check': return 'Checkbox'
        default: return 'Small Text'
    }
}

const getOptionForData = (option?: string) => {
    if (!option) return ''

    if (option === "Email") return "email"
    if (option === "Phone") return "tel"
    if (option === "URL") return "url"

    return ''
}

const ImportDoctypeVariables = ({ append }: { append: (data: Partial<RavenMessageActionFields>) => void }) => {

    const { watch, getValues } = useFormContext<RavenMessageAction>()

    const doctype = watch('document_type')

    const { doc: doctypeMeta, childDocs } = useDoctypeMeta(doctype ?? '')

    const importFields = () => {

        // Get the existing fields 
        const existingFields = (getValues('fields') || []).map(f => f.fieldname)

        // Get all the required fields from the doctypes
        const requiredFields = doctypeMeta?.fields?.filter(f => f.reqd && f.fieldtype !== 'Table' && f.fieldtype !== 'Table MultiSelect')

        // Filter out the fields that already exist
        const fieldsToBeAdded = requiredFields?.filter(f => !existingFields.includes(f.fieldname ?? ''))

        // Add the fields to the form
        fieldsToBeAdded?.forEach((field) => {
            append({
                fieldname: field.fieldname,
                label: field.label,
                helper_text: field.description,
                type: getType(field.fieldtype),
                is_required: field.reqd,
                options: field.fieldtype === 'Data' ? getOptionForData(field.options) : field.options,
                default_value_type: 'Static',
                default_value: field.default
            })
        })
    }

    return <Button variant='outline' type='button' className='not-cal' onClick={importFields}>Import fields from {doctype}</Button>
}

const AddFieldDialog = ({ onAdd, doctype }: { onAdd: (data: Partial<RavenMessageActionFields>) => void, doctype?: string }) => {

    const [open, setOpen] = useState(false)

    const onAddField = (data: Partial<RavenMessageActionFields>) => {
        onAdd(data)
        setOpen(false)
    }


    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button type='button' className='not-cal'>Add</Button>
        </Dialog.Trigger>
        <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'static')}>
            <Dialog.Title>Add Field</Dialog.Title>
            <VisuallyHidden>
                <Dialog.Description>Add a new field for this action.</Dialog.Description>
            </VisuallyHidden>
            <FieldForm doctype={doctype} onAdd={onAddField} />
        </Dialog.Content>
    </Dialog.Root>
}

const EditFieldDialog = ({ onEdit, field, doctype }: { onEdit: (data: Partial<RavenMessageActionFields>) => void, field: RavenMessageActionFields, doctype?: string }) => {

    const [open, setOpen] = useState(false)

    const onEditField = (data: Partial<RavenMessageActionFields>) => {
        onEdit(data)
        setOpen(false)
    }

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <IconButton
                size='2'
                color='gray'
                variant='ghost'
                type='button'
            >
                <FiEdit size='16' className='text-gray-10' />
            </IconButton>
        </Dialog.Trigger>
        <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'static')}>
            <Dialog.Title>Edit Field</Dialog.Title>
            <VisuallyHidden>
                <Dialog.Description>Edit field - {field.fieldname} for this action.</Dialog.Description>
            </VisuallyHidden>
            <FieldForm doctype={doctype} field={field} onAdd={onEditField} />
        </Dialog.Content>
    </Dialog.Root>
}

const FieldForm = ({ doctype, field, onAdd }: { doctype?: string, field?: RavenMessageActionFields, onAdd: (data: Partial<RavenMessageActionFields>) => void }) => {

    const methods = useForm<RavenMessageActionFields>({
        defaultValues: field
    })

    const { register, watch, setValue, formState: { errors }, control } = methods

    const fieldname = watch('fieldname')
    const type = watch('type')
    const default_value_type = watch('default_value_type')

    const onSubmit = (data: Partial<RavenMessageActionFields>) => {
        onAdd(data)
    }

    const onFieldSelect = (field: DocField) => {
        setValue('fieldname', field.fieldname ?? '')

        // Based on the fieldtype, set the type and options (if any)
        if (field.label) {
            setValue('label', field.label)
        }

        if (field.description) {
            setValue('helper_text', field.description)
        }

        if (field.fieldtype) {
            setValue('type', getType(field.fieldtype))
        }

        if (field.options) {
            if (field.fieldtype === 'Data') {
                setValue('options', getOptionForData(field.options))
            } else if (field.fieldtype === 'Autocomplete' || field.fieldtype === 'Link') {
                setValue('options', field.options)
            } else if (field.fieldtype === 'Select') {
                setValue('options', field.options)
            }
        }

    }

    const onFieldTypeChange = (type: string) => {
        if (type === "Link") {
            setValue('options', '')
        }
    }

    return <FormProvider {...methods}>
        <Stack gap='4'>
            <Stack gap='4'>
                <HStack>
                    {doctype ? <DoctypeFieldSelect
                        doctype={doctype}
                        value={fieldname}
                        onFieldSelect={onFieldSelect}
                    /> : <Stack>
                        <Box>
                            <Label isRequired htmlFor='fieldname'>Field Name</Label>
                            <TextField.Root {...register('fieldname', {
                                required: 'Field is required'
                            })} id='fieldname' />
                        </Box>
                        {errors.fieldname && <ErrorText>{errors.fieldname.message}</ErrorText>}
                    </Stack>
                    }

                    <Stack width={'50%'}>
                        <Box>
                            <Label isRequired htmlFor='label'>Label</Label>
                            <TextField.Root {...register('label', {
                                required: 'Label is required'
                            })} id='label' />
                        </Box>
                        {errors.label && <ErrorText>{errors.label.message}</ErrorText>}
                    </Stack>
                </HStack>

                <HStack>
                    <Stack width={'50%'}>
                        <Box>
                            <Label isRequired>Type</Label>
                            <Controller
                                control={control}
                                name='type'
                                rules={{ required: "Type is required", onChange: onFieldTypeChange }}
                                render={({ field: { value, onChange } }) => (
                                    <Select.Root required value={value} onValueChange={(value) => onChange(value)}>
                                        <Select.Trigger placeholder='Select a type' className='w-full' />
                                        <Select.Content>
                                            <Select.Item value='Data'>Data</Select.Item>
                                            <Select.Item value='Number'>Number</Select.Item>
                                            <Select.Item value='Select'>Select</Select.Item>
                                            <Select.Item value='Link'>Link</Select.Item>
                                            <Select.Item value='Checkbox'>Checkbox</Select.Item>
                                            <Select.Item value='Date'>Date</Select.Item>
                                            <Select.Item value='Time'>Time</Select.Item>
                                            <Select.Item value='Datetime'>Datetime</Select.Item>
                                            <Select.Item value='Small Text'>Small Text</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                )}
                            />
                        </Box>
                        {errors.type && <ErrorText>{errors.type?.message}</ErrorText>}
                    </Stack>

                    {type === "Data" && <Stack width={'50%'}>
                        <Box>
                            <Label htmlFor='options'>Validation <Text as='span' weight='regular' size='2' color='gray'> (optional)</Text></Label>
                            <TextField.Root {...register('options', {
                                required: false,
                                pattern: {
                                    value: /^("email"|"tel"|"url")$/,
                                    message: 'Invalid validation'
                                }
                            })} id='options' placeholder='"email", "tel", or "url"' />
                        </Box>
                        {errors.options && <ErrorText>{errors.options.message}</ErrorText>}
                    </Stack>}
                </HStack>

                <Box>
                    <Controller
                        control={control}
                        name='is_required'
                        render={({ field }) => (
                            <Text as="label" size="2">
                                <HStack>
                                    <Checkbox
                                        checked={field.value ? true : false}
                                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    />
                                    Required
                                </HStack>
                            </Text>
                        )}
                    />
                </Box>

                {type === 'Select' && <Stack>
                    <Box>
                        <Label>Options</Label>
                        <TextArea
                            {...register('options', {
                                required: type === "Select" ? "Options are required" : false
                            })}
                            placeholder='Add options in new lines'
                            rows={8}
                        />
                    </Box>
                    {errors.options && <ErrorText>{errors.options?.message}</ErrorText>}
                </Stack>}

                {type === "Link" && <Stack>
                    <LinkFormField
                        name='options'
                        doctype='DocType'
                        label='Document Type'
                        filters={[['istable', '=', 0], ['issingle', '=', 0]]}
                        required
                        rules={{
                            required: type === "Link" ? 'Document Type is required' : false
                        }}
                    />
                    {errors.options && <ErrorText>{errors.options?.message}</ErrorText>}
                </Stack>}




                <Stack>
                    <Box>
                        <Label htmlFor='default_value_type'>Default Value Type</Label>
                        <Controller
                            control={control}
                            name='default_value_type'
                            render={({ field: { value, onChange } }) => (
                                <Select.Root value={value} onValueChange={onChange}>
                                    <Select.Trigger placeholder='Select a default value type' className='w-full' id='default_value_type' />
                                    <Select.Content>
                                        <Select.Item value='Static'>Static</Select.Item>
                                        <Select.Item value='Message Field'>Message Field</Select.Item>
                                        <Select.Item value='Jinja'>Jinja</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            )}
                        />
                    </Box>
                    <HelperText>You can choose between a static default value, message field or jinja template.<br />
                        Message field will allow you to set a default value from the message selected.
                        <br />Jinja tags can be used with the message as context.</HelperText>
                    {errors.default_value_type && <ErrorText>{errors.default_value_type.message}</ErrorText>}
                </Stack>

                <Stack>
                    <Box>
                        <Label htmlFor='default_value'>Default Value</Label>
                        {default_value_type === "Static" &&
                            <TextField.Root {...register('default_value')} id='default_value' />
                        }

                        {default_value_type === "Message Field" &&
                            <Controller
                                control={control}
                                name='default_value'
                                render={({ field: { value, onChange } }) => (
                                    <Select.Root value={value} onValueChange={onChange}>
                                        <Select.Trigger placeholder='Select a message field' className='w-full' id='default_value' />
                                        <Select.Content>
                                            <Select.Item value='text'>Text (with HTML tags)</Select.Item>
                                            <Select.Item value='file'>File</Select.Item>
                                            <Select.Item value='content'>Content (Text content without HTML tags)</Select.Item>
                                            <Select.Item value='owner'>Owner (User)</Select.Item>
                                            <Select.Item value='creation'>Creation (Datetime)</Select.Item>
                                            <Select.Item value='message_type'>Message Type</Select.Item>
                                            <Select.Item value='link_doctype'>Linked DocType</Select.Item>
                                            <Select.Item value='link_document'>Linked Document</Select.Item>
                                            <Select.Item value='channel_id'>Channel ID</Select.Item>
                                            <Select.Item value='workspace_id'>Workspace ID</Select.Item>
                                            <Select.Item value='message_url'>Message URL</Select.Item>
                                        </Select.Content>
                                    </Select.Root>

                                )}
                            />
                        }

                        {default_value_type === "Jinja" &&
                            <TextArea {...register('default_value')}
                                placeholder="This is the message: {{ message.content }}"
                                id='default_value'
                                rows={8} />
                        }
                    </Box>
                    {errors.default_value && <ErrorText>{errors.default_value.message}</ErrorText>}
                </Stack>

                <Stack>
                    <Box>
                        <Label htmlFor='helper_text'>Description <Text as='span' weight='regular' size='2' color='gray'> (optional)</Text></Label>
                        <TextField.Root {...register('helper_text')} id='helper_text' />
                    </Box>
                    {errors.helper_text && <ErrorText>{errors.helper_text.message}</ErrorText>}
                </Stack>

            </Stack>
            <HStack justify='end'>
                <Dialog.Close>
                    <Button variant='soft' color='gray'>Close</Button>
                </Dialog.Close>
                <Button type='button' onClick={methods.handleSubmit(onSubmit)}>Add</Button>
            </HStack>
        </Stack>

    </FormProvider>
}