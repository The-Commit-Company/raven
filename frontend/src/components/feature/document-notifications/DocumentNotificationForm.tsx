import { ErrorText, HelperText, Label } from '@/components/common/Form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { HStack, Stack } from '@/components/layout/Stack'
import useDoctypeMeta from '@/hooks/useDoctypeMeta'
import { RavenDocumentNotification } from '@/types/RavenIntegrations/RavenDocumentNotification'
import { Badge, Box, Button, Checkbox, Code, Flex, Grid, IconButton, Link, Select, Separator, Table, Text, TextArea, TextField, Tooltip, VisuallyHidden } from '@radix-ui/themes'
import { Tabs } from '@radix-ui/themes'
import { Controller, ControllerFieldState, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { LuBell, LuUsers, LuWorkflow } from 'react-icons/lu'
import { VariableRow } from '../settings/ai/InstructionField'
import { Fragment, useMemo, useState } from 'react'
import { in_list } from '@/utils/validations'
import { VALID_DOCTYPE_FIELD_TYPES } from '../settings/ai/functions/DoctypeVariableDialogForm'
import { BiSearch } from 'react-icons/bi'
import { FiInfo, FiTrash2 } from 'react-icons/fi'
import clsx from 'clsx'
import { DocField } from '@/types/Core/DocField'
import LinkField from '@/components/common/LinkField/LinkField'

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}


const DocumentNotificationForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    return (
        <Tabs.Root defaultValue='general'>
            <Tabs.List>
                <Tabs.Trigger value='general'><LuBell {...ICON_PROPS} /> Details</Tabs.Trigger>
                <Tabs.Trigger value='recipients'><LuUsers {...ICON_PROPS} /> Recipients</Tabs.Trigger>
                <Tabs.Trigger value='condition'><LuWorkflow {...ICON_PROPS} /> Conditions</Tabs.Trigger>
            </Tabs.List>
            <Box pt='4'>
                <Tabs.Content value='general'>
                    <GeneralTab isEdit={isEdit} />
                </Tabs.Content>

                <Tabs.Content value='recipients'>
                    <RecipientsTab />
                </Tabs.Content>
                <Tabs.Content value='condition'>
                    <ConditionTab />
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    )
}

export default DocumentNotificationForm


const GeneralTab = ({ isEdit }: { isEdit: boolean }) => {
    const { register, control, formState: { errors } } = useFormContext<RavenDocumentNotification>()

    const document_type = useWatch<RavenDocumentNotification>({
        name: 'document_type',
        control
    })


    return <Stack gap='4'>

        <Grid columns={'2'} gap='4' align='center'>
            <Stack>
                <Box>
                    <Label htmlFor='notification_name' isRequired>Name</Label>
                    <TextField.Root
                        id='notification_name'
                        {...register('notification_name', {
                            required: 'Name is required',
                            disabled: isEdit
                        })}
                        disabled={isEdit}
                        placeholder="Salary Slip Notification"
                        aria-invalid={errors.notification_name ? 'true' : 'false'}
                    />
                </Box>
                {errors.notification_name && <ErrorText>{errors.notification_name?.message}</ErrorText>}
            </Stack>
            <Stack>
                <Box>
                    <Label htmlFor='send_alert_on' isRequired>Send Alert On</Label>
                    <Controller
                        control={control}
                        name='send_alert_on'
                        rules={{
                            required: 'Trigger is required',
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} name={field.name} onValueChange={(value) => field.onChange(value)}>
                                <Select.Trigger placeholder='Pick a trigger' className='w-full' autoFocus />
                                <Select.Content>
                                    <Select.Item value='New Document'>New Document</Select.Item>
                                    <Select.Item value='Update'>Update</Select.Item>
                                    <Select.Item value='Submit'>Submit</Select.Item>
                                    <Select.Item value='Cancel'>Cancel</Select.Item>
                                    <Select.Item value='Delete'>Delete</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box>
                {errors.send_alert_on && <ErrorText>{errors.send_alert_on?.message}</ErrorText>}
            </Stack>
            <Stack>
                <LinkFormField
                    name='document_type'
                    label='Document Type'
                    required
                    placeholder='e.g. Salary Slip'
                    filters={[["istable", "=", 0], ["issingle", "=", 0]]}
                    doctype='DocType'
                    rules={{
                        required: 'Document Type is required'
                    }}
                />
                <HelperText>
                    The document type to send the notification for.
                </HelperText>
                {errors.document_type && <ErrorText>{errors.document_type?.message}</ErrorText>}
            </Stack>

            <Stack>
                <LinkFormField
                    name='sender'
                    label='Sender'
                    required
                    placeholder='Select a bot'
                    doctype='Raven Bot'
                    rules={{
                        required: 'Sender is required'
                    }}
                />
                <HelperText>Notifications are sent via bots. Select the bot to send the notification.</HelperText>
                {errors.sender && <ErrorText>{errors.sender?.message}</ErrorText>}
            </Stack>

        </Grid>
        <Stack width={'fit-content'} gap='4'>
            <Text as="label" size="2">
                <HStack>
                    <Controller
                        control={control}
                        name='enabled'
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value ? true : false}
                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                            />
                        )} />

                    Enabled
                </HStack>
            </Text>

            <Text as="label" size="2">
                <HStack>
                    <Controller
                        control={control}
                        name='do_not_attach_doc'
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value ? true : false}
                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                            />
                        )} />

                    <Stack gap='1'>
                        Hide document preview in the notification message
                        <HelperText>
                            If checked, the document preview will not be attached to the notification message.
                        </HelperText>
                    </Stack>

                </HStack>

            </Text>
        </Stack>

        <Separator size='4' />

        <Stack>
            <Box>
                <Label htmlFor='message'>Message Content</Label>
                <TextArea
                    {...register('message')}
                    id='message'
                    placeholder='Hi {{ doc.employee_name }}, your salary slip is ready.'
                    rows={10}
                    resize='vertical'
                    aria-invalid={errors.message ? 'true' : 'false'}
                />
            </Box>
            {errors.message && <ErrorText>{errors.message?.message}</ErrorText>}
            <HelperText size='2'>
                The contents of the message to be sent. You can use Jinja tags to embed data from the document.
                <br />
                You can use data from the document like this: <Code>{`{{ doc.employee_name }}`}</Code>.
                You can also use functions like <Code>{`{{ frappe.utils.today() }}`}</Code>.
                <br />
                For a complete list of functions, see <Link href='https://docs.frappe.io/framework/user/en/api/jinja'>Frappe's Jinja documentation</Link>.
            </HelperText>
        </Stack>
        {document_type && <DoctypeVariables doctype={document_type as string} />}
    </Stack>
}

const DoctypeVariables = ({ doctype, withoutJinja }: { doctype: string, withoutJinja?: boolean }) => {

    const { doc } = useDoctypeMeta(doctype)

    const [search, setSearch] = useState('')

    const fields = useMemo(() => {

        if (!doc) return []

        const VALID_FIELD_TYPES = [...VALID_DOCTYPE_FIELD_TYPES, 'Read Only']

        const searchTerm = search.toLowerCase()

        return doc.fields?.filter((field) => in_list(VALID_FIELD_TYPES, field.fieldtype) && field.fieldname && field.label?.toLowerCase().includes(searchTerm)).map((field) => ({
            variable: `doc.${field.fieldname}`,
            description: <span>{field.label} <Badge color='gray' variant='soft'>{field.fieldtype}</Badge></span>
        }))

    }, [doc, search])

    return <Stack>
        <Text size='2'>
            Here are some variables you can use. Simply copy by clicking on the variable.
        </Text>
        <Box>
            <VisuallyHidden>
                <Label htmlFor='search'>Search</Label>
            </VisuallyHidden>
            <TextField.Root placeholder='Search' id='search' value={search} onChange={(e) => setSearch(e.target.value)}>
                <TextField.Slot>
                    <BiSearch />
                </TextField.Slot>
            </TextField.Root>
        </Box>
        <Table.Root variant='surface'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Variable</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {fields?.map((v) => <VariableRow key={v.variable} variable={v.variable} description={v.description} withoutJinja={withoutJinja} />)}
            </Table.Body>
        </Table.Root>
    </Stack>
}

const RecipientsTab = () => {

    const { control } = useFormContext<RavenDocumentNotification>()

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'recipients'
    })

    const onAddRow = () => {
        // @ts-ignore
        append({
            channel_type: 'Channel',
            variable_type: 'Static',
            value: ''
        })
    }

    return <Stack gap='4'>

        <HStack justify={'between'} align={'center'}>
            <Text size='2'>
                Recipients are the users who will receive the notification. You can choose to send the notification to channels or specific users.
            </Text>
            <Button onClick={onAddRow} variant='soft' size={'2'} type="button" className='not-cal'>Add Recipient</Button>
        </HStack>

        <div className='grid grid-cols-11 gap-y-2 border border-gray-4 rounded-md'>
            <div className='col-span-3 bg-gray-2 p-3 font-bold text-sm border-b border-gray-4'>
                <HStack align='center'>
                    Channel Type
                    <Tooltip content='The channel to send the notification to.'>
                        <Flex align='center' justify='center'>
                            <FiInfo />
                        </Flex>
                    </Tooltip>
                </HStack>
            </div>
            <div className='col-span-3 bg-gray-2 p-3 font-bold text-sm border-b border-gray-4'>
                <HStack align='center'>
                    Variable Type
                    <Tooltip content='The type of variable to use.<br /><br />Static: fixed channel/user<br /><br />Document Field: use a field from the document which will point to a channel/user<br /><br />Jinja: use a Jinja expression that resolves to a channel/user'>
                        <Flex align='center' justify='center'>
                            <FiInfo />
                        </Flex>
                    </Tooltip>
                </HStack>
            </div>
            <div className='col-span-4 bg-gray-2 p-3 font-bold text-sm border-b border-gray-4'>
                <HStack align='center'>
                    Value
                    <Tooltip content='The value to use for the recipient. This can be a channel or user ID.'>
                        <Flex align='center' justify='center'>
                            <FiInfo />
                        </Flex>
                    </Tooltip>
                </HStack>
            </div>
            <div className='col-span-1 bg-gray-2 p-3 font-bold text-sm border-b border-gray-4'>

            </div>

            {fields.map((row, index) => (
                <Fragment key={index}>
                    <div className={clsx('col-span-3 p-2', index !== fields.length - 1 ? 'border-b border-gray-4' : '')}>
                        <Box>
                            <VisuallyHidden>
                                <Label htmlFor={`recipients.${index}.channel_type`}>Channel Type for Row {index + 1}</Label>
                            </VisuallyHidden>
                            <Controller
                                control={control}
                                name={`recipients.${index}.channel_type`}
                                rules={{
                                    required: 'Channel Type is required'
                                }}
                                render={({ field, fieldState }) => (
                                    <Stack gap='1'>
                                        <Select.Root value={field.value} onValueChange={(value) => field.onChange(value)}>
                                            <Select.Trigger placeholder='Pick a channel type' className='w-64'
                                                aria-invalid={fieldState.error ? 'true' : 'false'} />
                                            <Select.Content>
                                                <Select.Item value='Channel'>Channel</Select.Item>
                                                <Select.Item value='User'>Direct Message</Select.Item>
                                            </Select.Content>
                                        </Select.Root>
                                        {fieldState.error && <ErrorText>{fieldState.error.message}</ErrorText>}
                                    </Stack>
                                )}
                            />
                        </Box>
                    </div>
                    <div className={clsx('col-span-3 p-2', index !== fields.length - 1 ? 'border-b border-gray-4' : '')}>
                        <Box>
                            <VisuallyHidden>
                                <Label htmlFor={`recipients.${index}.variable_type`}>Variable Type for Row {index + 1}</Label>
                            </VisuallyHidden>
                            <Controller
                                control={control}
                                name={`recipients.${index}.variable_type`}
                                render={({ field, fieldState }) => (
                                    <Stack gap='1'>
                                        <Select.Root value={field.value} onValueChange={(value) => field.onChange(value)}>
                                            <Select.Trigger placeholder='Pick a variable type' className='w-64'
                                                aria-invalid={fieldState.error ? 'true' : 'false'} />
                                            <Select.Content>
                                                <Select.Item value='Static'>Static</Select.Item>
                                                <Select.Item value='DocField'>Document Field</Select.Item>
                                                <Select.Item value='Jinja'>Jinja</Select.Item>
                                            </Select.Content>
                                        </Select.Root>
                                        {fieldState.error && <ErrorText>{fieldState.error.message}</ErrorText>}
                                    </Stack>
                                )}
                            />
                        </Box>
                    </div>
                    <div className={clsx('col-span-4 p-2', index !== fields.length - 1 ? 'border-b border-gray-4' : '')}>
                        <Box>
                            <VisuallyHidden>
                                <Label htmlFor={`recipients.${index}.value`}>Value for Row {index + 1}</Label>
                            </VisuallyHidden>
                            <Stack gap='1'>
                                <Controller
                                    control={control}
                                    name={`recipients.${index}.value`}
                                    rules={{
                                        required: 'Value is required'
                                    }}
                                    render={({ field, fieldState }) => (
                                        <RecipientValueField
                                            index={index}
                                            value={field.value}
                                            onChange={(v: string) => field.onChange(v)}
                                            fieldState={fieldState}
                                            onBlur={field.onBlur} />
                                    )}
                                />
                            </Stack>
                        </Box>
                    </div>
                    <div className={clsx('col-span-1 p-2 flex justify-center', index !== fields.length - 1 ? 'border-b border-gray-4' : '')}>
                        <IconButton
                            variant='surface'
                            color='red'
                            onClick={() => remove(index)}
                        >
                            <FiTrash2 />
                        </IconButton>
                    </div>
                </Fragment>
            ))}
        </div>

        <Text size='2'>
            You can use Jinja to get the recipient.
            <br />
            For example, you might have the employee ID in the document and you want to send the notification to the user linked to that employee ID.

            You can use the following variable to get the recipient: <Code color='gray' size='2'>{`{{ frappe.db.get_value('Employee', doc.employee_id, 'user') }}`}</Code>
        </Text>
    </Stack>
}

const RecipientValueField = ({ index, value, onChange, onBlur, fieldState }: { index: number, value: string, onChange: (v: string) => void, onBlur: () => void, fieldState?: ControllerFieldState }) => {

    const { control } = useFormContext<RavenDocumentNotification>()

    const variable_type = useWatch({
        control,
        name: `recipients.${index}.variable_type`
    })

    const channel_type = useWatch({
        control,
        name: `recipients.${index}.channel_type`
    })

    const document_type = useWatch({
        control,
        name: 'document_type'
    })

    if (variable_type === 'Static') {

        // const filters: Filter[] = row.channel_type === 'Channel' ? [['is_archived',]]
        if (channel_type === 'Channel') {
            return <LinkField
                label='Channel'
                hideLabel
                filters={[['is_direct_message', '=', 0], ['is_archived', '=', 0], ['is_thread', '=', 0]]}
                required
                placeholder='Select a channel'
                doctype='Raven Channel'
                value={value}
                aria-invalid={fieldState?.error ? 'true' : 'false'}
                setValue={onChange}
            />
        } else {
            return <LinkField
                label='User'
                hideLabel
                filters={[['enabled', '=', 1], ['type', '=', 'User']]}
                required
                placeholder='Select a user'
                doctype='Raven User'
                value={value}
                aria-invalid={fieldState?.error ? 'true' : 'false'}
                setValue={onChange}
            />
        }
    }

    if (variable_type === "DocField" && document_type) {
        return <DoctypeVariableField
            index={index}
            type={channel_type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            document_type={document_type}
        />
    }

    return <TextField.Root
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder='e.g. {{ frappe.db.get_value("Employee", doc.employee_id, "user_id") }}'
        aria-invalid={fieldState?.error ? 'true' : 'false'}
    />
}

const DoctypeVariableField = ({ type, document_type, value, onChange, onBlur, fieldState }: { index: number, type: 'Channel' | 'User', document_type: string, value: string, onChange: (v: string) => void, onBlur: () => void, fieldState?: ControllerFieldState }) => {

    const { doc } = useDoctypeMeta(document_type)

    const { suggestedFields, fields } = useMemo(() => {

        const VALID_FIELD_TYPES = [...VALID_DOCTYPE_FIELD_TYPES, 'Read Only']

        const suggested: DocField[] = []
        const fields: DocField[] = []

        if (!doc) return { fields, suggestedFields: [] }

        doc.fields?.forEach((field) => {
            if (in_list(VALID_FIELD_TYPES, field.fieldtype)) {

                if (field.fieldtype === 'Link') {
                    if (field.options) {
                        if (type === 'Channel') {
                            if (field.options.includes('Raven Channel')) {
                                suggested.push(field)
                            } else {
                                fields.push(field)
                            }
                        }
                        if (type === 'User') {
                            if (field.options.includes('Raven User') || field.options.includes('User')) {
                                suggested.push(field)
                            } else {
                                fields.push(field)
                            }
                        }
                    }
                } else {
                    fields.push(field)
                }
            }
        })

        // Add owner and modified fields to the fields
        const owner_field = {
            fieldname: 'owner',
            label: 'Owner',
            fieldtype: 'Link',
            options: 'User'
        } as DocField

        if (type === 'User') {
            suggested.push(owner_field)
        } else {
            fields.push(owner_field)
        }

        const modified_field = {
            fieldname: 'modified_by',
            label: 'Modified By',
            fieldtype: 'Link',
            options: 'User'
        } as DocField

        if (type === 'User') {
            suggested.push(modified_field)
        } else {
            fields.push(modified_field)
        }

        return { fields, suggestedFields: suggested }


    }, [doc, type])

    return <Select.Root onValueChange={onChange} value={value}>
        <Select.Trigger placeholder='Pick a field' className='w-full' onBlur={onBlur} aria-invalid={fieldState?.error ? 'true' : 'false'} />
        <Select.Content>
            {suggestedFields.length > 0 && <Select.Group>
                <Select.Label>Suggested</Select.Label>
                {suggestedFields.map((field) => <Select.Item key={field.fieldname} value={field.fieldname ?? ''}>{field.label} ({field.fieldname})</Select.Item>)}
            </Select.Group>}
            <Select.Group>
                <Select.Label>All</Select.Label>
                {fields.map((field) => <Select.Item key={field.fieldname} value={field.fieldname ?? ''}>{field.label ?? ''} ({field.fieldname})</Select.Item>)}
            </Select.Group>
        </Select.Content>
    </Select.Root>
}

const ConditionTab = () => {

    const { register, control, formState: { errors } } = useFormContext<RavenDocumentNotification>()

    const document_type = useWatch<RavenDocumentNotification>({
        name: 'document_type',
        control
    })

    return <Stack>
        <Box>
            <Flex direction={'row'} gap={'4'} align={'start'}>
                <Flex direction={'column'} style={{
                    width: '60%'
                }} >
                    <Label htmlFor='condition'>Condition</Label>
                    <TextArea
                        id='condition'
                        {...register('condition')}
                        placeholder='e.g. doc.docstatus == 1'
                        rows={10}
                    />
                    {errors?.condition && <ErrorText className='pt-1'>{errors.condition.message}</ErrorText>}
                    <HelperText style={{
                        paddingTop: '0.25rem'
                    }}>Optional: The notification will be sent if this expression is true.</HelperText>
                </Flex>
                <Code color='gray' size='2' className='mt-7 p-4'>
                    <Text weight='bold' size='2' className='block'>Some examples:</Text><br />
                    doc.status == "Open"<br /><br />
                    doc.status == "Received" or doc.status == "Partially Received" <br /><br />
                    {`doc.total > 10000`}
                </Code>
            </Flex>
        </Box>

        {document_type && <DoctypeVariables doctype={document_type as string} withoutJinja={true} />}
    </Stack>
}