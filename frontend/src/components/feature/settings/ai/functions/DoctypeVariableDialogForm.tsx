import { ErrorText, HelperText, Label } from "@/components/common/Form"
import { HStack, Stack } from "@/components/layout/Stack"
import useDoctypeMeta from "@/hooks/useDoctypeMeta"
import { DocField } from "@/types/Core/DocField"
import { RavenAIFunctionParams } from "@/types/RavenAI/RavenAIFunctionParams"
import { in_list } from "@/utils/validations"
import { Badge, Box, Button, Callout, Checkbox, Dialog, Popover, ScrollArea, Select, Text, TextArea, TextField } from "@radix-ui/themes"
import { FrappeConfig, FrappeContext, useFrappeGetCall, useSearch } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { Controller, FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { BiSearch } from "react-icons/bi"

const DocTypeVariableForm = ({ doctype, onAdd, defaultValues }: { doctype: string, onAdd: (data: Partial<RavenAIFunctionParams>) => void, defaultValues?: Partial<RavenAIFunctionParams> }) => {

    const methods = useForm<RavenAIFunctionParams>({
        defaultValues: {
            ...defaultValues,
            child_table_name: defaultValues?.child_table_name ? defaultValues?.child_table_name : doctype
        }
    })

    const { handleSubmit } = methods

    const onSubmit = (data: RavenAIFunctionParams) => {
        if (data.child_table_name === doctype) {
            onAdd({
                ...data,
                child_table_name: ''
            })
        } else {
            onAdd(data)
        }
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <Stack gap='4' className='max-h-[75vh] overflow-y-auto px-0.5'>
                <Stack gap='4'>
                    <HStack>
                        <TableSelectionField doctype={doctype} />
                        <FieldSelectionField doctype={doctype} />
                    </HStack>

                    <OtherFormFields />

                    <HStack>
                        <OptionsField doctype={doctype} />

                    </HStack>

                </Stack>

                <HStack justify='end'>
                    <Dialog.Close>
                        <Button variant='soft' color='gray'>Close</Button>
                    </Dialog.Close>
                    <Button type='button' onClick={handleSubmit(onSubmit)}>Add</Button>
                </HStack>
            </Stack>
        </FormProvider>
    </form>
}

export default DocTypeVariableForm


const TableSelectionField = ({ doctype }: { doctype: string }) => {

    const { control, setValue } = useFormContext<RavenAIFunctionParams>()
    const { doc: doctypeMeta } = useDoctypeMeta(doctype)

    const tableFields = useMemo(() => {

        if (!doctypeMeta) return []

        return doctypeMeta.fields?.filter((field) => field.fieldtype === 'Table' || field.fieldtype === "Table MultiSelect")

    }, [doctypeMeta])

    const onChange = () => {
        setValue('fieldname', '')
        setValue('description', '')
        setValue('options', '')
        setValue('type', 'string')
        setValue('required', 0)
    }

    return <Box width='50%'>
        <Label isRequired htmlFor='child_table_name'>DocType</Label>
        <Controller
            control={control}
            name='child_table_name'
            rules={{ onChange }}
            render={({ field }) => (
                <Select.Root required value={field.value} onValueChange={field.onChange} disabled={tableFields?.length === 0}>
                    <Select.Trigger className='w-full' />
                    <Select.Content>
                        <Select.Item value={doctype}>{doctype}</Select.Item>
                        {tableFields?.map((field) => (
                            <Select.Item key={field.fieldname} value={field.fieldname ?? ''}>{field.options ?? ''} ({field.fieldname})</Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            )}
        />
    </Box>
}

export const VALID_DOCTYPE_FIELD_TYPES: DocField['fieldtype'][] = [
    'Autocomplete',
    'Attach',
    'Attach Image',
    'Check',
    'Code',
    'Currency',
    'Data',
    'Date',
    'Datetime',
    'Float',
    'HTML Editor',
    'Markdown Editor',
    'Int',
    'JSON',
    'Select',
    'Text',
    'Text Editor',
    'Time',
    'Phone',
    'Percent',
    'Long Text',
    'Small Text',
    'Rating',
    'Link',
    'Dynamic Link'
]

/** Component to select a field of a doctype and autofill the rest of the form. */
const FieldSelectionField = ({ doctype }: { doctype: string }) => {

    const { control, watch, setValue } = useFormContext<RavenAIFunctionParams>()

    const tableField = watch('child_table_name')

    const { field: { value, onChange } } = useController({
        control,
        name: 'fieldname',
        rules: {
            required: 'Field is required'
        }
    })

    const { doc: doctypeMeta } = useDoctypeMeta(doctype)

    const doctypeName = useMemo(() => {

        // If the table field is the main doctype, then we need to show the fields of the doctype. Else we need to show the fields of the child table.
        if (doctype === tableField) {
            return doctype
        }

        let childDocTypeName = doctypeMeta?.fields?.find((field) => field.fieldname === tableField)?.options

        if (childDocTypeName) {
            return childDocTypeName
        }

        return doctype

    }, [doctypeMeta, doctype, tableField])


    const onFieldSelect = (field: DocField) => {

        onChange(field.fieldname ?? '')

        let description = field.label ?? field.fieldname ?? ''
        let options = ''
        let type: RavenAIFunctionParams['type'] = 'string'

        if (field.fieldtype === 'Select') {
            // Need to set the options
            options = field.options ?? ''
        }

        if (in_list(['Int', 'Rating'], field.fieldtype)) {
            type = 'integer'
        }

        if (in_list(['Float', 'Currency', 'Percent'], field.fieldtype)) {
            type = 'number'
        }

        if (field.fieldtype === 'Percent') {
            description = `${field.label} in percentage (between 0 and 100)`
        }

        if (field.fieldtype === 'Check') {
            type = 'boolean'
        }

        if (field.fieldtype === 'Date') {
            description = `${field.label} in YYYY-MM-DD format`
        }

        if (field.fieldtype === 'Datetime') {
            description = `${field.label} in YYYY-MM-DD HH:mm:ss format`
        }

        if (field.fieldtype === 'Time') {
            description = `${field.label} in HH:mm:ss format`
        }

        setValue('description', description)
        setValue('options', options)
        setValue('type', type)

        setValue('required', field.reqd ?? 0)

    }

    // If the table field is the main doctype, then we need to show the fields of the doctype. Else we need to show the fields of the child table.


    return <DoctypeFieldSelect
        doctype={doctypeName}
        value={value}
        onFieldSelect={onFieldSelect} />
}

/**
 * Component to render a select field for the fields of a doctype. Could be the main doctype or a child table.
 */
export const DoctypeFieldSelect = ({ doctype, value, onFieldSelect }: { doctype: string, value: string, onFieldSelect: (field: DocField) => void }) => {

    const { doc: doctypeMeta } = useDoctypeMeta(doctype)

    const fields = useMemo(() => {

        if (!doctypeMeta) return []

        return doctypeMeta.fields?.filter((field) => in_list(VALID_DOCTYPE_FIELD_TYPES, field.fieldtype))

    }, [doctypeMeta])

    const onValueChange = (value: string) => {

        onFieldSelect(fields?.find((field) => field.fieldname === value) as DocField)

    }

    return <Box width='50%'>
        <Label isRequired htmlFor='fieldname'>Field</Label>
        <Select.Root value={value} onValueChange={onValueChange} required>
            <Select.Trigger placeholder="Select Field" className='w-full' name='fieldname' />
            <Select.Content>
                {fields?.map((field) => (
                    <Select.Item key={field.fieldname} value={field.fieldname ?? ''}>{field.label} ({field.fieldname}) <Badge size='1' color='gray'>{field.fieldtype}</Badge></Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    </Box>

}

const OtherFormFields = () => {
    const { control, register, formState: { errors }, watch } = useFormContext<RavenAIFunctionParams>()

    const do_not_ask_ai = watch('do_not_ask_ai')


    return <Stack gap='4'>

        <HStack>
            <Box width='50%'>
                <Stack gap='4'>
                    <Stack>
                        <Box>
                            <Label isRequired>Variable Type</Label>
                            <Controller
                                control={control}
                                name='type'
                                rules={{ required: "Type is required" }}
                                render={({ field }) => (
                                    <Select.Root required value={field.value} onValueChange={(value) => field.onChange(value as 'object' | 'array' | 'string' | 'number' | 'boolean')}>
                                        <Select.Trigger placeholder='Select a variable type' className='w-full' />
                                        <Select.Content>
                                            <Select.Item value='string'>String</Select.Item>
                                            <Select.Item value='integer'>Integer</Select.Item>
                                            <Select.Item value='number'>Number</Select.Item>
                                            <Select.Item value='boolean'>Boolean</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                )}
                            />
                        </Box>
                        {errors.type && <ErrorText>{errors.type?.message}</ErrorText>}
                    </Stack>

                    <Box>
                        <Controller
                            control={control}
                            name='required'
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

                    <Box>
                        <Controller
                            control={control}
                            name='do_not_ask_ai'
                            render={({ field }) => (
                                <Text as="label" size="2">
                                    <HStack>
                                        <Checkbox
                                            checked={field.value ? true : false}
                                            onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                        />
                                        Do not ask AI to fill this field?
                                    </HStack>
                                </Text>
                            )}
                        />
                    </Box>

                </Stack>

            </Box>
            <Box width='50%'>
                <Stack gap='1'>
                    <Box>
                        <Label htmlFor='default_value' isRequired={do_not_ask_ai ? true : false}>Default Value</Label>
                        <TextField.Root
                            {...register('default_value', {
                                required: do_not_ask_ai ? "Default value is required if AI is not asked to fill this field" : false
                            })}
                        />
                    </Box>
                    {errors.default_value && <ErrorText>{errors.default_value?.message}</ErrorText>}
                    <HelperText>You can specify a default value for this variable. If the AI does not fill this field, then the default value will be used.</HelperText>
                </Stack>
            </Box>


        </HStack>

        <Stack gap='1'>
            <Box>
                <Label htmlFor='description' isRequired>Description</Label>
                <TextArea
                    {...register('description', {
                        required: true
                    })}
                    placeholder='Enter a description for this variable'
                />
            </Box>
            {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
            <HelperText>This is used to describe what this variable is used for. A better description will help the AI Bot perform better.</HelperText>
        </Stack>

    </Stack>
}

const OptionsField = ({ doctype }: { doctype: string }) => {

    const { register, watch, formState: { errors } } = useFormContext<RavenAIFunctionParams>()

    const fieldname = watch('fieldname')

    const child_table_name = watch('child_table_name')

    const { doc: doctypeMeta } = useDoctypeMeta(doctype)


    const doctypeName = useMemo(() => {

        // If the table field is the main doctype, then we need to show the fields of the doctype. Else we need to show the fields of the child table.
        if (doctype === child_table_name) {
            return doctype
        }

        let childDocTypeName = doctypeMeta?.fields?.find((field) => field.fieldname === child_table_name)?.options

        if (childDocTypeName) {
            return childDocTypeName
        }

        return doctype

    }, [doctypeMeta, doctype, child_table_name, fieldname])


    return <Stack gap='1' width='100%'>
        <Box width='100%'>
            <Label htmlFor='options'>Options</Label>
            <TextArea
                {...register('options')}
                rows={5}
                placeholder={`Add options separated by a new line.`}
            />
        </Box>
        {errors.options && <ErrorText>{errors.options?.message}</ErrorText>}
        <HelperText>You can limit the values that the bot can fill in this field by adding options.<br />This helps the bot to make less mistakes.</HelperText>
        <Box pt='2'>
            {fieldname && <OptionsAutoFill

                doctype={doctypeName}
                fieldname={fieldname}

            />
            }
        </Box>

    </Stack>

}

const OptionsAutoFill = ({ doctype, fieldname }: { doctype: string, fieldname: string }) => {

    const { doc: doctypeMeta } = useDoctypeMeta(doctype)


    const linkDoctypeName = useMemo(() => {

        if (!doctypeMeta) return ''

        return doctypeMeta.fields?.find((field) => field.fieldtype === 'Link' && field.fieldname === fieldname)?.options ?? ''

    }, [doctypeMeta, fieldname])


    const { setValue } = useFormContext<RavenAIFunctionParams>()

    const { db } = useContext(FrappeContext) as FrappeConfig

    const { data } = useFrappeGetCall<{ message: number }>('frappe.desk.reportview.get_count', {
        doctype: linkDoctypeName,
        limit: 21
    }, linkDoctypeName ? undefined : null)



    const autoFillOptions = () => {

        db.getDocList(linkDoctypeName, {
            fields: ['name']
        }).then((options) => {
            setValue('options', options.map((option) => option.name).join('\n'))
        })

    }

    if (!linkDoctypeName || !data || data?.message === 0) {
        return null
    }

    // Allow the user to select the options from the list
    if (data?.message === 21) {
        return <Callout.Root className="block" size='1'>
            <HStack align='center' width='100%' justify='between'>
                <Callout.Text weight={'medium'}>
                    Quickly import {linkDoctypeName}s?
                </Callout.Text>
                <Box>
                    <QuickImportPopover doctype={linkDoctypeName} />
                </Box>

            </HStack>
        </Callout.Root>
    }

    return <Callout.Root className="block" size='1'>
        <HStack align='center' width='100%' justify='between'>
            <Callout.Text>
                There are only {data?.message} options in {linkDoctypeName}.
                <br />Do you want to autofill these as options?
            </Callout.Text>
            <Box>
                <Button
                    type='button'
                    variant='surface'
                    className="not-cal"
                    onClick={autoFillOptions}
                >
                    Auto Fill Options
                </Button>
            </Box>

        </HStack>
    </Callout.Root>
}

const QuickImportPopover = ({ doctype }: { doctype: string }) => {

    const [searchText, setSearchText] = useState('')

    const { data } = useSearch(doctype, searchText, undefined, 15)

    const { setValue, getValues } = useFormContext<RavenAIFunctionParams>()

    const addToList = (value: string) => {
        const options = getValues('options') || ''

        let optionsArray: string[] = []

        if (options) {
            optionsArray = options.split('\n')
        } else {
            optionsArray = []
        }
        // Check if the value is already in the options
        if (optionsArray.includes(value)) {
            return
        } else {
            const newOptions = [...optionsArray, value]
            setValue('options', newOptions.join('\n'))
        }
    }

    return <Popover.Root>
        <Popover.Trigger>
            <Button
                type='button'
                variant='surface'
                className="not-cal"
            >
                Select {doctype}s
            </Button>
        </Popover.Trigger>
        <Popover.Content width='360px'>
            <Stack>
                <TextField.Root value={searchText} onChange={(e) => setSearchText(e.target.value)}>
                    <TextField.Slot side='left'>
                        <BiSearch />
                    </TextField.Slot>
                </TextField.Root>
                <ScrollArea style={{ height: 360 }}>
                    {data?.message?.slice(0, 15).map((item) => <Stack gap='0'
                        role='button'
                        className="hover:bg-gray-2 px-2 py-1.5 rounded-md cursor-pointer"
                        onClick={() => addToList(item.value)} key={item.value}>
                        <Text size='2' weight='medium'>{item.value}</Text>
                        {item.description && <Text size='1' weight='light'>{item.description}</Text>}
                    </Stack>)}
                </ScrollArea>
            </Stack>
        </Popover.Content>
    </Popover.Root>

}