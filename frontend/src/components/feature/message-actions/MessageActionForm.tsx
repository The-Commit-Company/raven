import { ErrorText, HelperText, Label } from '@/components/common/Form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { Box, Button, Checkbox, Dialog, Grid, Link, ScrollArea, Select, Text, TextArea, TextField } from '@radix-ui/themes'
import { Tabs } from '@radix-ui/themes'
import { ChangeEvent } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { BiBoltCircle, BiCode, BiCodeAlt } from 'react-icons/bi'
import { LuVariable } from 'react-icons/lu'
import MessageActionVariableBuilder from './MessageActionVariableBuilder'
import { FiExternalLink } from 'react-icons/fi'
import CodeBlock from '@/components/layout/CodeBlock'

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}


const MessageActionForm = () => {
    return (
        <Tabs.Root defaultValue='general'>
            <Tabs.List>
                <Tabs.Trigger value='general'><BiBoltCircle {...ICON_PROPS} /> General</Tabs.Trigger>
                <Tabs.Trigger value='fields'><LuVariable {...ICON_PROPS} /> Fields</Tabs.Trigger>
            </Tabs.List>
            <Box pt='4'>
                <Tabs.Content value='general'>
                    <GeneralTab />
                </Tabs.Content>
                <Tabs.Content value='fields'>
                    <MessageActionVariableBuilder />
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    )
}

export default MessageActionForm


const GeneralTab = () => {
    const { register, control, formState: { errors }, setValue, watch } = useFormContext<RavenMessageAction>()

    const action = useWatch({ control, name: 'action' })

    const serverScript = useWatch({ control, name: 'server_script' })

    const onActionChange = (event: ChangeEvent<HTMLSelectElement>) => {

        if (event.target.value !== 'Custom Function') {
            setValue('custom_function_path', '')
        }

        if (event.target.value !== "Create Document") {
            setValue('document_type', '')
        }

        if (event.target.value !== "Server Script") {
            setValue('server_script', '')
        }
    }
    return <Stack gap='4'>

        <Grid columns={'2'} gap='4' align='center'>
            <Stack>
                <Box>
                    <Label htmlFor='action_name' isRequired>Name</Label>
                    <TextField.Root
                        id='action_name'
                        {...register('action_name', {
                            required: 'Name is required',
                            onBlur: (e) => {
                                setValue('title', e.target.value.trim())
                            }
                        })}
                        placeholder="Create support ticket"
                        aria-invalid={errors.action_name ? 'true' : 'false'}
                    />
                </Box>
                {errors.action_name && <ErrorText>{errors.action_name?.message}</ErrorText>}
            </Stack>
            <Stack>
                <Box>
                    <Label htmlFor='action' isRequired>Action Type</Label>
                    <Controller
                        control={control}
                        name='action'
                        rules={{
                            required: 'Action Type is required',
                            onChange: onActionChange
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} name={field.name} onValueChange={(value) => field.onChange(value)}>
                                <Select.Trigger placeholder='Pick an action type' className='w-full' autoFocus />
                                <Select.Content>
                                    <Select.Item value='Create Document'>Create Document</Select.Item>
                                    <Select.Item value='Custom Function'>Custom Function (API)</Select.Item>
                                    <Select.Item value='Server Script'>Server Script</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box>
                {errors.action && <ErrorText>{errors.action?.message}</ErrorText>}
            </Stack>
            {action === "Create Document" && <Stack>
                <LinkFormField
                    name='document_type'
                    label='Document Type'
                    required
                    filters={[["istable", "=", 0], ["issingle", "=", 0]]}
                    doctype='DocType'
                    rules={{
                        required: action === "Create Document" ? 'Document Type is required' : false,
                    }}
                />
                <HelperText>
                    The document you want this action to create.
                </HelperText>
                {errors.document_type && <ErrorText>{errors.document_type?.message}</ErrorText>}
            </Stack>}

            {action === 'Custom Function' && <Stack>
                <Box>
                    <Label htmlFor='custom_function_path' isRequired={action === 'Custom Function'}>Custom Function Path</Label>
                    <TextArea
                        id='custom_function_path'
                        {...register('custom_function_path', {
                            required: action === 'Custom Function' ? 'Path is required' : false,
                            validate: (value) => {
                                if (value?.includes(' ')) {
                                    return 'Path cannot contain spaces'
                                }
                                return true
                            }
                        })}
                        placeholder='myapp.api.my_custom_function'
                    />
                </Box>
                <HelperText>
                    Dotted path to the custom function/API. Cannot contain spaces.
                </HelperText>
                {errors.custom_function_path && <ErrorText>{errors.custom_function_path?.message}</ErrorText>}
                {EXAMPLES[action] ? <div><ViewDocsButton /></div> : null}
            </Stack>}

            {action === 'Server Script' && <Stack>
                <LinkFormField
                    name='server_script'
                    label='Server Script'
                    required
                    filters={[["disabled", "=", 0], ["script_type", "=", "API"]]}
                    doctype='Server Script'
                    rules={{
                        required: action === "Server Script" ? 'Server Script is required' : false,
                    }}
                />
                <HelperText className='leading-6'>
                    The Server Script you want this action to run. Server Scripts need to be of type "API".<br />
                    {serverScript ? <Link href={`/app/server-script/${serverScript}`} target='_blank'>Configure {serverScript} <FiExternalLink /></Link>
                        :
                        <Link href="/app/server-script/list" target='_blank'>View Server Scripts <FiExternalLink /></Link>
                    }

                </HelperText>
                {errors.server_script && <ErrorText>{errors.server_script?.message}</ErrorText>}
                {EXAMPLES[action] ? <div><ViewDocsButton /></div> : null}

            </Stack>}



        </Grid>

        <Stack>
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
        </Stack>
        <Stack>
            <Box>
                <Label htmlFor='title' isRequired>Title</Label>
                <TextField.Root
                    id='title'
                    {...register('title', {
                        required: 'Title is required',
                    })}
                    placeholder="Create support ticket"
                    aria-invalid={errors.title ? 'true' : 'false'}
                />
            </Box>
            <HelperText>Title of the message action dialog.</HelperText>
            {errors.title && <ErrorText>{errors.title?.message}</ErrorText>}
        </Stack>


        <Stack>
            <Box>
                <Label htmlFor='description'>Description</Label>
                <TextArea {...register('description')} id='description' placeholder='Create a support ticket from the message.' />
            </Box>
            {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
            <HelperText>This is shown on the message action dialog.</HelperText>
        </Stack>

        <Stack>
            <Box>
                <Label htmlFor='success_message'>Success Message</Label>
                <TextArea {...register('success_message')} id='success_message' placeholder='Ticket created successfully.' />
            </Box>
            {errors.success_message && <ErrorText>{errors.success_message?.message}</ErrorText>}
            <HelperText>The message shown in the toast after performing the action.</HelperText>
        </Stack>
    </Stack>
}

const ViewDocsButton = () => {
    const { control } = useFormContext<RavenMessageAction>()

    const action = useWatch({ control, name: 'action' })

    return <Dialog.Root>
        <Dialog.Trigger>
            <Button className='not-cal' variant='outline'><BiCodeAlt /> View Docs</Button>
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Title>
                Documentation
            </Dialog.Title>
            <Dialog.Description size='2'>
                The following code sample shows how to use the message action values in a {action}.
            </Dialog.Description>
            <div>
                <CodeBlock code={EXAMPLES[action]} />
            </div>
        </Dialog.Content>
    </Dialog.Root>
}

const EXAMPLES: Record<RavenMessageAction['action'], string> = {
    "Server Script": `# Server Scripts would get the values in "frappe.form_dict"
{
    "message_id": "123",
    "action_id": "abc",
    "values": {  
    # Values from the fields in the message action dialog
        "field1": "value1",
        "field2": "value2"
    }
}

# You can use the values to perform any action like this:
print(frappe.form_dict.values.field1)`,
    "Create Document": ``,
    "Custom Function": ` # The API would be called directly with the values from the message action dialog.

# Example:
@frappe.whitelist()
def create_ticket(field1, field2):
    # Do something with the values
    frappe.get_doc({
        "doctype": "Ticket",
        "field1": field1,
        "field2": field2
    }).insert()
`
}