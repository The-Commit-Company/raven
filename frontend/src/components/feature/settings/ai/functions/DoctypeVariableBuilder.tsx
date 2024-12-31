import { HStack, Stack } from '@/components/layout/Stack'
import useDoctypeMeta from '@/hooks/useDoctypeMeta'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { RavenAIFunctionParams } from '@/types/RavenAI/RavenAIFunctionParams'
import { in_list } from '@/utils/validations'
import { Badge, Button, Card, Dialog, IconButton, Separator, Text, Tooltip, VisuallyHidden } from '@radix-ui/themes'
import { useFieldArray, UseFieldArrayUpdate, useFormContext } from 'react-hook-form'
import { BiTrashAlt } from 'react-icons/bi'
import { FiEdit } from 'react-icons/fi'
import DocTypeVariableForm from './DoctypeVariableDialogForm'
import { useMemo, useState } from 'react'
import { getTextAndColorForFieldType } from './utils'
import { DocField } from '@/types/Core/DocField'
import clsx from 'clsx'

type Props = {}

const DoctypeVariableBuilder = (props: Props) => {

    const { control, getValues, setValue, watch } = useFormContext<RavenAIFunction>()

    const type = watch('type')
    const doctype = watch('reference_doctype')

    if (in_list(["Create Document", "Update Document", "Create Multiple Documents", "Update Multiple Documents"], type) && doctype) {
        return (
            <VariableList doctype={doctype} />
        )
    }

    return null
}

export default DoctypeVariableBuilder


const VariableList = ({ doctype }: { doctype: string }) => {

    const { control } = useFormContext<RavenAIFunction>()

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'parameters'
    })

    const addField = (data: Partial<RavenAIFunctionParams>) => {
        // @ts-expect-error
        append(data)
    }

    return <Stack>
        <HStack justify='end' align='center'>
            <ImportDoctypeVariables doctype={doctype} append={addField} />
            <AddDoctypeVariableDialog onAdd={addField} doctype={doctype} />
        </HStack>

        <Stack>
            {fields.map((field, index) => {
                return <FieldRow key={field.id} field={field} index={index}
                    update={update}
                    remove={remove} doctype={doctype} />
            })}
        </Stack>
    </Stack>

}

const FieldRow = ({ field, index, remove, doctype, update }: { field: RavenAIFunctionParams, index: number, remove: (index: number) => void, doctype: string, update: UseFieldArrayUpdate<RavenAIFunction, "parameters"> }) => {

    const { doc: doctypeMeta } = useDoctypeMeta(doctype)
    const onEdit = (data: Partial<RavenAIFunctionParams>) => {
        update(index, data as RavenAIFunctionParams)
    }



    const { options, type } = useMemo(() => {

        if (field.child_table_name) {
            const docfield = doctypeMeta?.fields?.find(f => f.fieldname === field.child_table_name)

            return {
                options: docfield?.options,
                type: docfield?.fieldtype
            }
        } else {
            const docfield = doctypeMeta?.fields?.find(f => f.fieldname === field.fieldname)

            return {
                label: docfield?.label,
                options: docfield?.options,
                type: docfield?.fieldtype
            }

        }



    }, [field.child_table_name, field.fieldname, doctypeMeta])

    return <Card className={clsx({
        'bg-gray-6': field.do_not_ask_ai,
    })}>
        <HStack justify={'between'}>
            <Stack>
                <HStack align='center' gap='2'>
                    <Text className='font-semibold' size='2'>{field.fieldname}</Text>
                    <Separator orientation='vertical' />
                    <HStack align='center'>
                        <Badge {...getTextAndColorForFieldType(field.type)} className='rounded-md' />
                        {field.required ? <Badge color='red' className='rounded-md'>Required</Badge> : null}
                        {field.options ?
                            <Tooltip content={field.options.split('\n').join(', ')}>
                                <Badge color='blue' className='rounded-md'>{field.options.split('\n').length} Options</Badge>
                            </Tooltip>
                            : null}
                        {field.do_not_ask_ai ? <Badge color='gray' className='rounded-md'>Do not ask AI</Badge> : null}
                    </HStack>
                </HStack>
                <Text size='2'>{field.description}</Text>

                <HStack align='center' gap='2'>
                    {field.default_value ? <Text size='2' color='gray'>Default Value: {field.default_value}</Text> : null}
                    {field.default_value && field.child_table_name ? <Separator orientation='vertical' /> : null}
                    {field.child_table_name && in_list(['Table', 'Table MultiSelect'], type) ? <Text size='2' color='gray'>Child Table: {options} ({field.child_table_name})</Text> : null}
                </HStack>
            </Stack>

            <HStack align='center' pr='2' gap='4'>
                <EditDoctypeVariableDialog onEdit={onEdit} field={field} doctype={doctype} />
                <IconButton
                    size='2'
                    color='red'
                    variant='ghost'
                    type='button'
                    onClick={() => remove(index)}>
                    <BiTrashAlt size='16' />
                </IconButton>
            </HStack>
        </HStack>


    </Card>
}

const AddDoctypeVariableDialog = ({ onAdd, doctype }: { onAdd: (data: Partial<RavenAIFunctionParams>) => void, doctype: string }) => {

    const [open, setOpen] = useState(false)

    const onAddField = (data: Partial<RavenAIFunctionParams>) => {
        onAdd(data)
        setOpen(false)
    }


    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button variant='solid' type='button' className='not-cal'>Add</Button>
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Title>Add Variable</Dialog.Title>
            <VisuallyHidden>
                <Dialog.Description>Add a new variable in the function.</Dialog.Description>
            </VisuallyHidden>
            <DocTypeVariableForm doctype={doctype} onAdd={onAddField} />
        </Dialog.Content>
    </Dialog.Root>
}

const EditDoctypeVariableDialog = ({ onEdit, field, doctype }: { onEdit: (data: Partial<RavenAIFunctionParams>) => void, field: RavenAIFunctionParams, doctype: string }) => {

    const [open, setOpen] = useState(false)

    const onEditField = (data: Partial<RavenAIFunctionParams>) => {
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
        <Dialog.Content>
            <Dialog.Title>Edit Variable</Dialog.Title>
            <VisuallyHidden>
                <Dialog.Description>Edit variable - {field.fieldname} in the function.</Dialog.Description>
            </VisuallyHidden>
            <DocTypeVariableForm doctype={doctype} onAdd={onEditField} defaultValues={field} />
        </Dialog.Content>
    </Dialog.Root>
}


const ImportDoctypeVariables = ({ doctype, append }: { doctype: string, append: (data: Partial<RavenAIFunctionParams>) => void }) => {

    const { getValues, setValue } = useFormContext<RavenAIFunction>()

    const { doc: doctypeMeta, childDocs } = useDoctypeMeta(doctype)

    const getFieldInfoFromDocField = (field: DocField, childDoctypeName?: string) => {
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

        if (childDoctypeName) {
            description += ` in ${childDoctypeName}`
        }

        return {
            fieldname: field.fieldname,
            description,
            options,
            type,
            required: field.reqd,
        }
    }

    const getRequiredFieldsForChildTable = (childTable: string, fieldname: string) => {
        // Fetch the child table meta
        const childTableMeta = childDocs?.find(d => d.name === childTable)

        if (childTableMeta) {
            return childTableMeta.fields?.filter(f => f.reqd).map(f => ({
                ...getFieldInfoFromDocField(f, childTableMeta.name),
                child_table_name: fieldname
            })) || []
        }

        return []
    }

    const importFields = () => {

        const fields = getValues('parameters') || []

        // We need to get all required fields from the doctype
        const requiredFields = doctypeMeta?.fields?.filter(f => f.reqd)

        // Filter out the table fields
        const nonTableFields = requiredFields?.filter(f => f.fieldtype !== 'Table' && f.fieldtype !== 'Table MultiSelect')

        // We need to check if the field already exists
        const existingFields = fields.map(f => f.fieldname)

        const regularFieldsToBeAdded = nonTableFields?.filter(f => !existingFields.includes(f.fieldname ?? '')).map((f) => getFieldInfoFromDocField(f)) || []

        const requiredTableFields = requiredFields?.filter(f => f.fieldtype === 'Table' || f.fieldtype === 'Table MultiSelect')

        const requiredTableFieldsFlattened = (requiredTableFields?.map(f => getRequiredFieldsForChildTable(f.options ?? '', f.fieldname ?? '')) ?? []).flat()

        // Filter out the child table fields that are already added
        const tableFieldsToBeAdded = requiredTableFieldsFlattened?.filter(f => {
            // Check if the field already exists - use both the fieldname and the child_table_name
            const exists = fields.some(field => field.fieldname === f.fieldname && field.child_table_name === f.child_table_name)
            return !exists
        })

        const allFieldsToBeAdded = [...regularFieldsToBeAdded, ...tableFieldsToBeAdded]

        // We need to add the fields to the form
        allFieldsToBeAdded?.forEach((field) => {
            append(field)
        })
    }


    return <Button variant='outline' type='button' className='not-cal' onClick={importFields}>Import fields from {doctype}</Button>

}