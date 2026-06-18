import { Label, ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { Box, Checkbox, Text, TextField, Select, TextArea, Tabs, Grid } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { FUNCTION_TYPES } from './FunctionConstants'
import { ChangeEvent, MutableRefObject, useRef } from 'react'
import VariableBuilder from './VariableBuilder'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import AINotEnabledCallout from '../AINotEnabledCallout'
import DoctypeVariableBuilder from './DoctypeVariableBuilder'
import { LuSquareFunction, LuVariable } from 'react-icons/lu'
import { __ } from '@/utils/translations'
import { in_list } from '@/utils/validations'

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}

type DoctypeFunctionConfig = {
    functionName: (normalizedDoctype: string) => string
    description: (doctype: string) => string
    anyDoctype: {
        function_name: string
        description: string
    }
}

const DOCTYPE_FUNCTION_CONFIG = {
    "Get Document": {
        functionName: (normalizedDoctype: string) => `get_${normalizedDoctype}`,
        description: (doctype: string) => `This function fetches a ${doctype} document using its name from the system.`,
        anyDoctype: {
            function_name: 'get_doc',
            description: __('This function fetches a document from any DocType in the system using its DocType and name.')
        }
    },
    "Get Multiple Documents": {
        functionName: (normalizedDoctype: string) => `get_${normalizedDoctype}s`,
        description: (doctype: string) => `This function fetches multiple ${doctype} documents using their names from the system.`,
        anyDoctype: {
            function_name: 'get_docs',
            description: __('This function fetches multiple documents from any DocType in the system using their DocType and names.')
        }
    },
    "Get List": {
        functionName: (normalizedDoctype: string) => `get_${normalizedDoctype}_list`,
        description: (doctype: string) => `This function fetches a list of ${doctype} from the system.`,
        anyDoctype: {
            function_name: 'get_doc_list',
            description: __('This function fetches a list of documents from any DocType in the system.')
        }
    },
    "Get Value": {
        functionName: (normalizedDoctype: string) => `get_${normalizedDoctype}_value`,
        description: (doctype: string) => `This function fetches a value from a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'get_doc_value',
            description: __('This function fetches one or more field values from a document in any DocType in the system.')
        }
    },
    "Set Value": {
        functionName: (normalizedDoctype: string) => `set_${normalizedDoctype}_value`,
        description: (doctype: string) => `This function sets a value in a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'set_doc_value',
            description: __('This function sets one or more field values in a document from any DocType in the system.')
        }
    },
    "Create Document": {
        functionName: (normalizedDoctype: string) => `create_${normalizedDoctype}`,
        description: (doctype: string) => `This function creates a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'create_doc',
            description: __('This function creates a document in any DocType in the system.')
        }
    },
    "Create Multiple Documents": {
        functionName: (normalizedDoctype: string) => `create_${normalizedDoctype}s`,
        description: (doctype: string) => `This function creates multiple ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'create_docs',
            description: __('This function creates multiple documents in any DocType in the system.')
        }
    },
    "Update Document": {
        functionName: (normalizedDoctype: string) => `update_${normalizedDoctype}`,
        description: (doctype: string) => `This function updates a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'update_doc',
            description: __('This function updates a document in any DocType in the system.')
        }
    },
    "Update Multiple Documents": {
        functionName: (normalizedDoctype: string) => `update_${normalizedDoctype}s`,
        description: (doctype: string) => `This function updates multiple ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'update_docs',
            description: __('This function updates multiple documents in any DocType in the system.')
        }
    },
    "Delete Document": {
        functionName: (normalizedDoctype: string) => `delete_${normalizedDoctype}`,
        description: (doctype: string) => `This function deletes a ${doctype} from the system.`,
        anyDoctype: {
            function_name: 'delete_doc',
            description: __('This function deletes a document from any DocType in the system.')
        }
    },
    "Delete Multiple Documents": {
        functionName: (normalizedDoctype: string) => `delete_${normalizedDoctype}s`,
        description: (doctype: string) => `This function deletes multiple ${doctype} from the system.`,
        anyDoctype: {
            function_name: 'delete_docs',
            description: __('This function deletes multiple documents from any DocType in the system.')
        }
    },
    "Submit Document": {
        functionName: (normalizedDoctype: string) => `submit_${normalizedDoctype}`,
        description: (doctype: string) => `This function submits a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'submit_doc',
            description: __('This function submits a document from any DocType in the system.')
        }
    },
    "Cancel Document": {
        functionName: (normalizedDoctype: string) => `cancel_${normalizedDoctype}`,
        description: (doctype: string) => `This function cancels a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'cancel_doc',
            description: __('This function cancels a document from any DocType in the system.')
        }
    },
    "Get Amended Document": {
        functionName: (normalizedDoctype: string) => `get_amended_${normalizedDoctype}`,
        description: (doctype: string) => `This function gets the amended document for a ${doctype} in the system.`,
        anyDoctype: {
            function_name: 'get_amended_doc',
            description: __('This function fetches the amended version of a document from any DocType in the system.')
        }
    }
} satisfies Record<string, DoctypeFunctionConfig>

type DoctypeFunctionType = keyof typeof DOCTYPE_FUNCTION_CONFIG

const ANY_DOCTYPE_FUNCTIONS = Object.keys(DOCTYPE_FUNCTION_CONFIG) as DoctypeFunctionType[]

const normalizeDoctype = (doctype: string) => doctype.toLowerCase().replace(/\s/g, '_')

const getFunctionConfig = (type: string) => DOCTYPE_FUNCTION_CONFIG[type as DoctypeFunctionType]

const getDoctypeFunctionName = (type: string, doctype?: string) => {
    const functionConfig = getFunctionConfig(type)

    if (!doctype || !functionConfig) {
        return ''
    }

    return functionConfig.functionName(normalizeDoctype(doctype))
}

const getDoctypeDescription = (type: string, doctype?: string) => {
    const functionConfig = getFunctionConfig(type)

    if (!doctype || !functionConfig) {
        return ''
    }

    return functionConfig.description(doctype)
}

const getSuggestedFunctionName = (type: string, doctype?: string, allowAnyDoctype?: boolean | 0 | 1) => {
    const functionConfig = getFunctionConfig(type)

    if (!functionConfig) {
        return ''
    }

    if (allowAnyDoctype) {
        return functionConfig.anyDoctype.function_name
    }

    return getDoctypeFunctionName(type, doctype)
}

const FunctionForm = ({ isEdit }: { isEdit?: boolean }) => {

    const { watch } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    return (
        <Tabs.Root defaultValue='function_details'>
            <Tabs.List>
                <Tabs.Trigger value='function_details'>
                    <LuSquareFunction {...ICON_PROPS} /> Details
                </Tabs.Trigger>
                <Tabs.Trigger
                    value='variables'
                    disabled={in_list([
                        "Get Document",
                        "Get Multiple Documents",
                        "Delete Document",
                        "Delete Multiple Documents",
                        "Attach File to Document",
                        "Submit Document",
                        "Cancel Document",
                        "Get Amended Document",
                        "Get List",
                        "Get Value",
                        "Set Value",
                        "Get Report Result"
                    ], type)}>
                    <LuVariable {...ICON_PROPS} /> Variables
                </Tabs.Trigger>
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

            if (!ANY_DOCTYPE_FUNCTIONS.includes(functionDef.value as typeof ANY_DOCTYPE_FUNCTIONS[number])) {
                setValue('allow_any_doctype', 0)
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
            <ReferenceDoctypeField isEdit={isEdit} />
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

const AllowAnyDoctype = ({
    compact = false,
    isEdit,
    lastReferenceDoctype
}: {
    compact?: boolean,
    isEdit?: boolean,
    lastReferenceDoctype?: MutableRefObject<string>
}) => {
    const { watch, control, setValue, getValues } = useFormContext<RavenAIFunction>()
    const type = watch('type')

    if (!ANY_DOCTYPE_FUNCTIONS.includes(type as typeof ANY_DOCTYPE_FUNCTIONS[number])) {
        return null
    }

    const checkbox = <Text as="label" size="2">
        <HStack align='center'>
            <Controller
                control={control}
                name='allow_any_doctype'
                render={({ field }) => (
                    <Checkbox
                        checked={field.value ? true : false}
                        onCheckedChange={(v) => {
                            const enabled = v ? 1 : 0
                            field.onChange(enabled)

                            if (enabled) {
                                const referenceDoctype = getValues('reference_doctype')
                                if (referenceDoctype && lastReferenceDoctype) {
                                    lastReferenceDoctype.current = referenceDoctype
                                }
                                setValue('reference_doctype', '')

                                const defaults = getFunctionConfig(type)?.anyDoctype
                                if (!isEdit && defaults?.function_name) {
                                    setValue('function_name', defaults.function_name)
                                }

                                if (!getValues('description') && defaults?.description) {
                                    setValue('description', defaults.description)
                                }
                            } else if (lastReferenceDoctype?.current) {
                                setValue('reference_doctype', lastReferenceDoctype.current)

                                const nextSuggestedName = getSuggestedFunctionName(
                                    type,
                                    lastReferenceDoctype.current,
                                    false
                                )
                                if (!isEdit && nextSuggestedName) {
                                    setValue('function_name', nextSuggestedName)
                                }
                            }
                        }}
                    />
                )} />

            {__("Allow Any DocType")}
        </HStack>
    </Text>

    if (compact) {
        return checkbox
    }

    return <Stack maxWidth={'560px'}>
        {checkbox}
        <HelperText>
            {__("When enabled, this tool accepts a doctype parameter at runtime instead of being locked to one reference DocType. Normal Frappe permissions still apply.")}
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

const ReferenceDoctypeField = ({ isEdit }: { isEdit?: boolean }) => {

    const { watch, formState: { errors }, setValue, getValues } = useFormContext<RavenAIFunction>()

    const type = watch('type')
    const allowAnyDoctype = watch('allow_any_doctype')
    const lastReferenceDoctype = useRef(getValues('reference_doctype') || '')

    const supportsAnyDoctype = ANY_DOCTYPE_FUNCTIONS.includes(type as DoctypeFunctionType)

    const onReferenceDoctypeChange = (e: ChangeEvent<HTMLInputElement>) => {

        if (e.target.value) {
            lastReferenceDoctype.current = e.target.value

            const nextSuggestedName = getSuggestedFunctionName(type, e.target.value, false)
            const description = getDoctypeDescription(type, e.target.value)

            if (!isEdit && nextSuggestedName) {
                setValue('function_name', nextSuggestedName)
            }
            if (description) {
                setValue('description', description)
            }
        }
    }

    if (!supportsAnyDoctype) {
        return null
    }

    return <Stack>
        <HStack align='end' gap='4' className='w-full'>
            {!allowAnyDoctype && (
                <Box className='flex-1'>
                    <LinkFormField
                        name='reference_doctype'
                        label={__('Reference Doctype')}
                        required
                        filters={[["istable", "=", 0], ["issingle", "=", 0]]}
                        doctype='DocType'
                        rules={{
                            required: supportsAnyDoctype && !allowAnyDoctype ? __('Reference Doctype is required') : false,
                            onChange: onReferenceDoctypeChange
                        }}
                    />
                </Box>
            )}
            <Box className='shrink-0 pb-1'>
                <AllowAnyDoctype
                    compact
                    isEdit={isEdit}
                    lastReferenceDoctype={lastReferenceDoctype}
                />
            </Box>
        </HStack>
        {allowAnyDoctype ? (
            <HelperText>
                {__("This function will accept a doctype parameter at runtime instead of being locked to one reference DocType.")}
            </HelperText>
        ) : (
            <HelperText>
                {__("The document you want this function to operate on.")}
            </HelperText>
        )}
        {!allowAnyDoctype && errors.reference_doctype && <ErrorText>{errors.reference_doctype?.message}</ErrorText>}
    </Stack>
}

export default FunctionForm