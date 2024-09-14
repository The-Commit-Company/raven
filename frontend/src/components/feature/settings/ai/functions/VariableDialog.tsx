import { useState } from 'react'
import { VariableType } from './FunctionConstants'
import { Label, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { Box, Select, TextField, Checkbox, TextArea, Dialog, Button, Text } from '@radix-ui/themes'

type Props = {
    defaultValues?: VariableType
    onAdd: (name: string, variable: Partial<VariableType>) => void
    allowNameChange: boolean
    name?: string
}

const VariableDialog = ({ defaultValues, onAdd, allowNameChange, name: defaultName }: Props) => {

    const [type, setType] = useState<'object' | 'array' | 'string' | 'number' | 'boolean'>(defaultValues?.type || 'string')
    const [name, setName] = useState(defaultName ?? '')
    const [description, setDescription] = useState(defaultValues?.description ?? '')
    const [required, setRequired] = useState(defaultValues?.required ?? false)
    const [defaultVal, setDefaultVal] = useState(defaultValues?.type === 'string' || defaultValues?.type === 'number' || defaultValues?.type === 'boolean' ? defaultValues?.default?.toString() : '')
    const [restrictOptions, setRestrictOptions] = useState(defaultValues?.type === 'string' || defaultValues?.type === 'number' ? defaultValues?.restrictOptions ?? false : false)
    const [enumValues, setEnumValues] = useState<string>(defaultValues?.type === 'string' || defaultValues?.type === 'number' ? (defaultValues?.enum) ?? '' : '')

    const areAllFieldsFilled = !name || !type || !description

    const onSubmit = () => {

        onAdd(name, {
            type,
            required,
            description,
            enum: enumValues,
            restrictOptions,
            default: defaultVal
        })

    }
    return (
        <Stack gap='4' pt='2'>
            <Stack gap='4' className='max-h-[75vh] overflow-y-auto'>
                <HStack>
                    <Box width='50%'>
                        <Label isRequired>Type</Label>
                        <Select.Root required value={type} onValueChange={(value) => setType(value as 'object' | 'array' | 'string' | 'number' | 'boolean')}>
                            <Select.Trigger placeholder='Select a variable type' className='w-full' />
                            <Select.Content>
                                <Select.Item value='string'>String</Select.Item>
                                <Select.Item value='array'>Array</Select.Item>
                                <Select.Item value='number'>Number</Select.Item>
                                <Select.Item value='boolean'>Boolean</Select.Item>
                                <Select.Item value='object'>Object</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Box>
                    <Stack width='50%'>
                        <Box>
                            <Label isRequired>Name</Label>
                            <TextField.Root name='name' value={name} required
                                readOnly={!allowNameChange}
                                onChange={(e) => setName(e.target.value?.replace(/\s/g, '_'))} />
                        </Box>
                        <HelperText>
                            Variable name must be unique, and cannot have spaces.
                        </HelperText>
                    </Stack>
                </HStack>
                <Box width='50%'>
                    <Text as="label" size="2">
                        <HStack>
                            <Checkbox
                                checked={required}
                                onCheckedChange={(v) => setRequired(v ? true : false)}
                            />
                            Required
                        </HStack>
                    </Text>
                </Box>

                <Box>
                    <Label htmlFor='description' isRequired>Description</Label>
                    <TextArea
                        name='description'
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Enter a description for this variable'
                    />
                </Box>
                {(type === 'string' || type === 'number' || type === 'boolean') &&
                    <Stack>
                        {type === 'string' &&
                            <Box>
                                <Label htmlFor='defaultVal'>Default Value</Label>
                                <TextField.Root name='defaultVal' value={defaultVal} onChange={(e) => setDefaultVal(e.target.value)} />
                            </Box>}

                        {type === 'number' &&
                            <Box>
                                <Label htmlFor='defaultVal'>Default Value</Label>
                                <TextField.Root name='defaultVal' value={defaultVal} onChange={(e) => setDefaultVal(e.target.value)} type='number' />
                            </Box>}

                        {type === 'boolean' &&
                            <Box>
                                <Label htmlFor='defaultVal'>Default Value</Label>
                                <Select.Root value={defaultVal} onValueChange={(value) => setDefaultVal(value as 'true' | 'false')}>
                                    <Select.Trigger placeholder='Select a variable type' className='w-full' />
                                    <Select.Content>
                                        <Select.Item value='true'>True</Select.Item>
                                        <Select.Item value='false'>False</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </Box>}
                        <HelperText>
                            If a default value is provided, we won't ask the bot to provide a value for this variable when calling the function.
                        </HelperText>
                    </Stack>}

                {(type === 'string' || type === 'number') &&
                    <Stack>
                        <Box>
                            <Text as="label" size="2">
                                <HStack>
                                    <Checkbox
                                        checked={restrictOptions}
                                        onCheckedChange={(v) => setRestrictOptions(v ? true : false)}
                                    />
                                    Restrict Options?
                                </HStack>
                            </Text>
                            <HelperText>
                                If restricted, the bot will only be able to choose from the options provided.
                            </HelperText>
                        </Box>

                        {restrictOptions &&
                            <Stack>
                                <Box>
                                    <Label htmlFor='enumValues'>Options</Label>
                                    <TextArea
                                        rows={7}
                                        resize='vertical'
                                        name='enumValues' value={enumValues} onChange={(e) => setEnumValues(e.target.value)} />
                                </Box>
                                <HelperText>
                                    Add a new option on a new line.
                                </HelperText>
                            </Stack>
                        }
                    </Stack>}


            </Stack>
            <HStack justify='end'>
                <Dialog.Close>
                    <Button variant='soft' color='gray'>Close</Button>
                </Dialog.Close>
                <Button onClick={onSubmit} disabled={areAllFieldsFilled}>Add</Button>
            </HStack>
        </Stack>
    )
}

export default VariableDialog