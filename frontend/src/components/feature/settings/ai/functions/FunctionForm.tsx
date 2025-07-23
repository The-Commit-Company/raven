import { Label, ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { Box, Checkbox, Text, TextField, Select, TextArea, Tabs, Grid } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { FUNCTION_TYPES } from './FunctionConstants'
import { ChangeEvent } from 'react'
import VariableBuilder from './VariableBuilder'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import AINotEnabledCallout from '../AINotEnabledCallout'
import DoctypeVariableBuilder from './DoctypeVariableBuilder'
import { LuSquareFunction, LuVariable } from 'react-icons/lu'
import { in_list } from '@/utils/validations'

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}

const FunctionForm = ({ isEdit }: { isEdit?: boolean }) => {

    const { watch } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    return (
        <Tabs.Root defaultValue='function_details'>
            <Tabs.List>
                <Tabs.Trigger value='function_details'><LuSquareFunction {...ICON_PROPS} /> Details</Tabs.Trigger>
                <Tabs.Trigger value='variables' disabled={in_list(["Get Document", "Get Multiple Documents", "Delete Document", "Delete Multiple Documents", "Attach File to Document", "Submit Document", "Cancel Document", "Get Amended Document"], type)}><LuVariable {...ICON_PROPS} /> Variables</Tabs.Trigger>
            </Tabs.List>
            <Stack pt='4'>
                <AINotEnabledCallout />
                <Tabs.Content value='function_details'>
                    <GeneralFunctionDetails isEdit={isEdit} />
                </Tabs.Content>
                <Tabs.Content value='variables'>
                    <VariableSection />
                </Tabs.Content>
            </Stack>
        </Tabs.Root>

    )
}

const GeneralFunctionDetails = ({ isEdit }: { isEdit?: boolean }) => {

    const { register, control, formState: { errors }, setValue } = useFormContext<RavenAIFunction>()

    const onFunctionChange = (event: ChangeEvent<HTMLSelectElement>) => {

        const functionDef = FUNCTION_TYPES.find(f => f.value === event.target.value)

        if (event.target.value === 'Attach File to Document') {
            setValue('reference_doctype', '')
            setValue('function_name', 'attach_file_to_document')
            setValue('description', "This function attaches a file to a document in the system. Call this function after you have created or updated the document.")
        }

        if (functionDef) {
            if (functionDef.requires_write_permissions !== undefined) {
                setValue('requires_write_permissions', functionDef.requires_write_permissions ? 1 : 0)
            }

            if (functionDef.value !== 'Custom Function') {
                setValue('function_path', '')
            }
        }
    }
    return <Stack gap='4'>

        <Grid columns={'2'} gap='4'>
            <Stack>
                <Box>
                    <Label htmlFor='type' isRequired>Type</Label>
                    <Controller
                        control={control}
                        name='type'
                        rules={{
                            required: 'Type is required',
                            onChange: onFunctionChange
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} name={field.name} onValueChange={(value) => field.onChange(value)}>
                                <Select.Trigger placeholder='Pick a function type' className='w-full' autoFocus />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label className='pl-3'>Standard</Select.Label>
                                        {FUNCTION_TYPES.filter(f => f.type === "Standard").map(f => <Select.Item value={f.value} key={f.value}>{f.value}</Select.Item>)}
                                    </Select.Group>

                                    <Select.Group>
                                        <Select.Label className='pl-3'>Miscellaneous</Select.Label>
                                        {FUNCTION_TYPES.filter(f => f.type === "Other").map(f => <Select.Item value={f.value} key={f.value}>{f.value}</Select.Item>)}
                                    </Select.Group>

                                    <Select.Group>
                                        <Select.Label className='pl-3'>Bulk Operations</Select.Label>
                                        {FUNCTION_TYPES.filter(f => f.type === "Bulk Operations").map(f => <Select.Item value={f.value} key={f.value}>{f.value}</Select.Item>)}
                                    </Select.Group>

                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box>
                <FunctionHelperText />
                {errors.type && <ErrorText>{errors.type?.message}</ErrorText>}
            </Stack>
            <ReferenceDoctypeField />
            <Stack>
                <Box>
                    <Label htmlFor='function_name' isRequired>Name</Label>
                    <TextField.Root
                        id='function_name'
                        {...register('function_name', {
                            required: 'Name is required',
                            disabled: isEdit,
                            validate: (value) => {
                                if (value.includes(' ')) {
                                    return 'Name cannot contain spaces'
                                }
                                return true
                            }
                        })}
                        readOnly={isEdit}
                        placeholder="get_purchase_invoice"
                        aria-invalid={errors.function_name ? 'true' : 'false'}
                    />
                </Box>
                {errors.function_name && <ErrorText>{errors.function_name?.message}</ErrorText>}
                <HelperText>This needs to be unique and cannot contain spaces.</HelperText>
            </Stack>
        </Grid>



        <Stack>
            <Box>
                <Label htmlFor='description' isRequired>Description</Label>
                <Controller
                    control={control}
                    name='description'
                    render={({ field }) => (
                        <TextArea id='description' {...field} placeholder='Describe what this function does.' />
                    )}
                />
            </Box>
            {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
            <HelperText>This is used to describe what this function does to the AI Agent.</HelperText>
        </Stack>

        <CustomFunction />
        <RequiresWritePermissions />
    </Stack>
}

const VariableSection = () => {

    return <>
        <DoctypeVariableBuilder />
        <Stack>
            <PassParamsAsJSON />
            <VariableBuilder />
        </Stack>

    </>

}
const FunctionHelperText = () => {

    const { watch } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    const functionDef = FUNCTION_TYPES.find(f => f.value === type)

    if (!functionDef) {
        return <HelperText>Select a function type from the dropdown above.</HelperText>
    }

    return <HelperText>{functionDef.description}</HelperText>

}

const PassParamsAsJSON = () => {
    const { watch, control } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    if (type !== 'Custom Function') {
        return null
    }

    return <Stack maxWidth={'480px'}>
        <Text as="label" size="2">
            <HStack>
                <Controller
                    control={control}
                    name='pass_parameters_as_json'
                    render={({ field }) => (
                        <Checkbox
                            checked={field.value ? true : false}
                            onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                        />
                    )} />

                Pass parameters as JSON
            </HStack>
        </Text>
        <HelperText>
            If checked, the params will be passed as a JSON object instead of named parameters
        </HelperText>
    </Stack>
}

const RequiresWritePermissions = () => {
    const { watch, control } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    return <Stack maxWidth={'480px'}>
        <Text as="label" size="2">
            <HStack>
                <Controller
                    control={control}
                    name='requires_write_permissions'
                    render={({ field }) => (
                        <Checkbox
                            disabled={!(type === 'Custom Function')}
                            checked={field.value ? true : false}
                            onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                        />
                    )} />

                Requires Write Permissions
            </HStack>
        </Text>
        <HelperText>
            Check this if the function you have selected requires write permissions.
        </HelperText>
    </Stack>
}

const CustomFunction = () => {

    const { register, watch, formState: { errors } } = useFormContext<RavenAIFunction>()

    const type = watch('type')

    if (type !== 'Custom Function') {
        return null
    }

    return <Stack>
        <Box>
            <Label htmlFor='function_path' isRequired={type === 'Custom Function'}>Custom Function Path</Label>
            <TextArea
                id='function_path'
                {...register('function_path', {
                    required: type === 'Custom Function' ? 'Path is required' : false,
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
        {errors.function_path && <ErrorText>{errors.function_path?.message}</ErrorText>}
    </Stack>
}

const ReferenceDoctypeField = () => {

    const { watch, formState: { errors }, setValue, getValues } = useFormContext<RavenAIFunction>()

    const type = watch('type')

    const DOCUMENT_REF_FUNCTIONS = ["Get Document", "Get Multiple Documents", "Get List", "Get Value", "Set Value", "Create Document", "Create Multiple Documents", "Update Document", "Update Multiple Documents", "Delete Document", "Delete Multiple Documents", "Submit Document", "Cancel Document", "Get Amended Document"]

    const onReferenceDoctypeChange = (e: ChangeEvent<HTMLInputElement>) => {

        if (e.target.value) {

            let description = ''
            const function_name_exists = getValues('function_name') ? true : false
            let function_name = ''
            // Set the description if none is set
            if (type === 'Get Document') {
                description = `This function fetches a ${e.target.value} document using its name from the system.`
                function_name = `get_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }
            if (type === 'Get Multiple Documents') {
                description = `This function fetches multiple ${e.target.value} documents using their names from the system.`
                function_name = `get_${e.target.value.toLowerCase().replace(/\s/g, '_')}s`
            }
            if (type === 'Get List') {
                description = `This function fetches a list of ${e.target.value} from the system.`
                function_name = `get_${e.target.value.toLowerCase().replace(/\s/g, '_')}_list`
            }
            if (type === 'Get Value') {
                description = `This function fetches a value from a ${e.target.value} in the system.`
                function_name = `get_${e.target.value.toLowerCase().replace(/\s/g, '_')}_value`
            }
            if (type === 'Set Value') {
                description = `This function sets a value in a ${e.target.value} in the system.`
                function_name = `set_${e.target.value.toLowerCase().replace(/\s/g, '_')}_value`
            }
            if (type === 'Create Document') {
                description = `This function creates a ${e.target.value} in the system.`
                function_name = `create_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }
            if (type === 'Create Multiple Documents') {
                description = `This function creates multiple ${e.target.value} in the system.`
                function_name = `create_${e.target.value.toLowerCase().replace(/\s/g, '_')}s`
            }
            if (type === 'Update Document') {
                description = `This function updates a ${e.target.value} in the system.`
                function_name = `update_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }
            if (type === 'Update Multiple Documents') {
                description = `This function updates multiple ${e.target.value} in the system.`
                function_name = `update_${e.target.value.toLowerCase().replace(/\s/g, '_')}s`
            }
            if (type === 'Delete Document') {
                description = `This function deletes a ${e.target.value} from the system.`
                function_name = `delete_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }
            if (type === 'Delete Multiple Documents') {
                description = `This function deletes multiple ${e.target.value} from the system.`
                function_name = `delete_${e.target.value.toLowerCase().replace(/\s/g, '_')}s`
            }
            if (type === 'Submit Document') {
                description = `This function submits a ${e.target.value} in the system.`
                function_name = `submit_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }
            if (type === 'Cancel Document') {
                description = `This function cancels a ${e.target.value} in the system.`
                function_name = `cancel_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }

            if (type === 'Get Amended Document') {
                description = `This function gets the amended document for a ${e.target.value} in the system.`
                function_name = `get_amended_${e.target.value.toLowerCase().replace(/\s/g, '_')}`
            }

            if (function_name && !function_name_exists) {
                setValue('function_name', function_name)
            }
            if (description) {
                setValue('description', description)
            }
        }
    }

    if (!DOCUMENT_REF_FUNCTIONS.includes(type)) {
        return null
    }
    return <Stack>
        <LinkFormField
            name='reference_doctype'
            label='Reference Doctype'
            required
            filters={[["istable", "=", 0], ["issingle", "=", 0]]}
            doctype='DocType'
            rules={{
                required: DOCUMENT_REF_FUNCTIONS.includes(type) ? 'Reference Doctype is required' : false,
                onChange: onReferenceDoctypeChange
            }}
        />
        <HelperText>
            The document you want this function to operate on.
        </HelperText>
        {errors.reference_doctype && <ErrorText>{errors.reference_doctype?.message}</ErrorText>}
    </Stack>
}

export default FunctionForm