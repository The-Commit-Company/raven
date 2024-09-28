import { Label, ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { Box, Checkbox, Text, TextField, Select, Separator, TextArea } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { FUNCTION_TYPES } from './FunctionConstants'
import { ChangeEvent } from 'react'
import VariableBuilder from './VariableBuilder'
import LinkFormField from '@/components/common/LinkField/LinkFormField'

const FunctionForm = ({ isEdit }: { isEdit?: boolean }) => {
    const { register, control, formState: { errors }, setValue } = useFormContext<RavenAIFunction>()

    const onFunctionChange = (event: ChangeEvent<HTMLSelectElement>) => {

        const functionDef = FUNCTION_TYPES.find(f => f.value === event.target.value)

        if (functionDef) {
            if (functionDef.requires_write_permissions !== undefined) {
                setValue('requires_write_permissions', functionDef.requires_write_permissions ? 1 : 0)
            }

            if (functionDef.value !== 'Custom Function') {
                setValue('function_path', '')
            }
        }
    }

    return (
        <Stack gap='4'>
            <HStack gap='4'>
                <Stack width='50%'>
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
                                        {FUNCTION_TYPES.map(f => <Select.Item value={f.value}>{f.value}</Select.Item>)}
                                    </Select.Content>
                                </Select.Root>
                            )}
                        />
                    </Box>
                    <FunctionHelperText />
                    {errors.type && <ErrorText>{errors.type?.message}</ErrorText>}
                </Stack>
                <Stack width='50%'>
                    <Box>
                        <Label htmlFor='function_name' isRequired>Name</Label>
                        <TextField.Root
                            id='function_name'
                            {...register('function_name', {
                                required: 'Name is required',
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
            </HStack>

            <ReferenceDoctypeField />

            <Stack>
                <Box>
                    <Label htmlFor='description' isRequired>Description</Label>
                    <TextArea id='description' {...register('description')} placeholder='Describe what this function does.' />
                </Box>
                {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
                <HelperText>This is used to describe what this function does to the AI Bot.</HelperText>
            </Stack>



            <CustomFunction />
            <RequiresWritePermissions />
            <Separator className='w-full' />
            <VariableBuilder />
            <PassParamsAsJSON />

        </Stack>
    )
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

    const { watch, formState: { errors }, setValue } = useFormContext<RavenAIFunction>()

    const type = watch('type')

    const DOCUMENT_REF_FUNCTIONS = ["Get Document", "Get Multiple Documents", "Get List", "Create Document", "Create Multiple Documents", "Update Document", "Update Multiple Documents", "Delete Document", "Delete Multiple Documents"]

    const onReferenceDoctypeChange = (e: ChangeEvent<HTMLInputElement>) => {

        if (e.target.value) {
            // Set the description if none is set
            if (type === 'Get Document') {
                setValue('description', `This function fetches a ${e.target.value} document using its name from the system.`)
            }
            if (type === 'Get Multiple Documents') {
                setValue('description', `This function fetches multiple ${e.target.value} documents using their names from the system.`)
            }
            if (type === 'Get List') {
                setValue('description', `This function fetches a list of ${e.target.value} from the system.`)
            }
            if (type === 'Create Document') {
                setValue('description', `This function creates a ${e.target.value} in the system.`)
            }
            if (type === 'Create Multiple Documents') {
                setValue('description', `This function creates multiple ${e.target.value} in the system.`)
            }
            if (type === 'Update Document') {
                setValue('description', `This function updates a ${e.target.value} in the system.`)
            }
            if (type === 'Update Multiple Documents') {
                setValue('description', `This function updates multiple ${e.target.value} in the system.`)
            }
            if (type === 'Delete Document') {
                setValue('description', `This function deletes a ${e.target.value} from the system.`)
            }
            if (type === 'Delete Multiple Documents') {
                setValue('description', `This function deletes multiple ${e.target.value} from the system.`)
            }
        }
    }

    if (!DOCUMENT_REF_FUNCTIONS.includes(type)) {
        return null
    }
    return <Stack width='50%'>
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