import { useState } from 'react'
import { NumberVariableType, StringVariableType, VariableType } from './FunctionConstants'
import { Label, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { Box, Select, TextField, Checkbox, TextArea, Dialog, Button, Text } from '@radix-ui/themes'

type Props = {
    defaultValues?: VariableType
    defaultRequired?: boolean
    onAdd: (name: string, variable: Partial<VariableType>, required?: boolean) => void
    allowNameChange: boolean
    name?: string
}

const VariableDialog = ({ defaultValues, onAdd, allowNameChange, name: defaultName, defaultRequired }: Props) => {

    const [type, setType] = useState<'object' | 'array' | 'string' | 'number' | 'boolean'>(defaultValues?.type || 'string')
    const [name, setName] = useState(defaultName ?? '')
    const [description, setDescription] = useState(defaultValues?.description ?? '')
    const [required, setRequired] = useState<boolean>(defaultRequired ?? false)
    const [enumValues, setEnumValues] = useState<string[]>(defaultValues?.type === 'string' || defaultValues?.type === 'number' ? defaultValues?.enum ?? [] : [])

    const [items, setItems] = useState<StringVariableType | NumberVariableType | undefined>(defaultValues?.type === 'array' ? defaultValues?.items ?? [] : undefined)

    const areAllFieldsFilled = !name || !type || !description

    const onSubmit = () => {

        onAdd(name, {
            type,
            description,
            enum: enumValues.length > 0 ? enumValues : undefined,
            items: type === 'array' ? items : undefined,
        }, required)

    }
    return (
        <Stack gap='4' pt='2'>
            <Stack gap='4' className='max-h-[75vh] overflow-y-auto'>
                <HStack>
                    <Stack width='50%' gap='4'>
                        <Box>
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
                        <Box>
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
                    </Stack>

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

                {type === 'array' &&
                    <Box width='50%'>
                        <Label isRequired>Type of items in the array</Label>
                        <Select.Root value={items?.type}
                            onValueChange={(value) => setItems(v => ({ ...v, type: value as 'string' | 'number' }))}
                        >
                            <Select.Trigger placeholder='Select a variable type' className='w-full' />
                            <Select.Content>
                                <Select.Item value='string'>String</Select.Item>
                                <Select.Item value='number'>Number</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Box>
                }


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

                {(type === 'string' || type === 'number') &&
                    <Stack>
                        <Stack>
                            <Box>
                                <Label htmlFor='enumValues'>Options</Label>
                                <TextArea
                                    rows={7}
                                    resize='vertical'
                                    name='enumValues' value={enumValues.join('\n')} onChange={(e) => setEnumValues(e.target.value.split('\n'))} />
                            </Box>
                            <HelperText>
                                Add a new option on a new line.

                                If you want this variable to have a default value, just add one option.
                            </HelperText>
                        </Stack>
                    </Stack>
                }
            </Stack>
            <HStack justify='end'>
                <Dialog.Close>
                    <Button variant='soft' color='gray'>Close</Button>
                </Dialog.Close>
                <Button onClick={onSubmit} disabled={areAllFieldsFilled}>Add</Button>
            </HStack>
        </Stack >
    )
}

export default VariableDialog