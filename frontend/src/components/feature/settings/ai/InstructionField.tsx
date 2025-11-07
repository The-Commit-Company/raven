import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBotInstructionTemplate } from '@/types/RavenAI/RavenBotInstructionTemplate'
import { Badge, Box, Button, Checkbox, Code, Flex, Popover, RadioCards, SegmentedControl, Separator, Table, Text, TextArea, TextAreaProps, Tooltip } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { RiSparkling2Fill } from 'react-icons/ri'
import { toast } from 'sonner'

type Props = {
    allowUsingTemplate?: boolean,
    instructionRequired?: boolean,
    autoFocus?: boolean
}

interface InstructionFieldForm {
    instruction: string
    dynamic_instructions: 0 | 1
}
const InstructionField = ({ allowUsingTemplate, instructionRequired, autoFocus }: Props) => {

    const { watch, control } = useFormContext<InstructionFieldForm>()

    const isDynamic = watch('dynamic_instructions')

    return (
        <Stack gap='4'>
            <Flex direction={'column'} gap='2'>
                <Text as="label" size="2">
                    <Flex gap="2">
                        <Controller
                            control={control}
                            name='dynamic_instructions'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />

                        Dynamic Instructions
                    </Flex>
                </Text>
                <HelperText size='2'>
                    Dynamic Instructions allow you to embed Jinja tags in your instruction to the bot.
                    <br /><br />
                    Instructions would be different based on the user who is calling the bot or the data in your system as they are computed every time the bot is called.
                </HelperText>
            </Flex>

            {isDynamic ? <DynamicInstructionField autoFocus={autoFocus} instructionRequired={instructionRequired} allowUsingTemplate={allowUsingTemplate} /> : <StaticInstructionField autoFocus={autoFocus} instructionRequired={instructionRequired} allowUsingTemplate={allowUsingTemplate} />}
        </Stack>
    )
}

const variables = [
    { variable: 'first_name', description: 'The first name of the user' },
    { variable: 'full_name', description: 'The full name of the user' },
    { variable: 'email', description: 'The email of the user' },
    { variable: 'user_id', description: 'The ID of the user' },
    { variable: 'company', description: "The default company in the system" },
    { variable: 'employee_id', description: 'The ID of the employee' },
    { variable: "employee_company", description: "The company of the employee (value in Employee DocType)" },
    { variable: 'department', description: 'The department of the employee' },
    { variable: 'lang', description: 'The current user language' },
]

const DynamicInstructionField = ({ allowUsingTemplate, instructionRequired, autoFocus }: Props) => {

    const [view, setView] = useState('editor')

    // const ref = useRef<HTMLTextAreaElement>(null)

    // const { setValue } = useFormContext<InstructionFieldForm>()

    // TODO: Make it smarter
    // const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {

    //     /** When the user pastes, we need to check where the user is pasting the text. 
    //      * 
    //      * If the text has {{ }} then we need to remove it first.
    //      * 
    //      * Then, we need to check if the user has already typed either {{ or }} in the text area based on the current cursor position.
    //      * According to the cursor position, we need to add the missing {{ or }} in the text area.
    //      * 
    //      * 
    //      */

    //     console.log(e)

    //     let textAreaText = e.target.value
    //     let copiedText = e.clipboardData.getData('text/plain')

    //     if (copiedText.includes('{{') || copiedText.includes('}}')) {
    //         copiedText = copiedText.replace('{{', '').replace('}}', '')
    //     }

    //     // Add the copied text to the text area based on the cursor position
    //     const start = e.target.selectionStart
    //     const end = e.target.selectionEnd

    //     // Check if there's a {{ before the cursor position - and the {{ should not be before any text
    //     // Since checking for {{ is difficult, we can check if there's a character before the cursor position

    //     let hasCharacterBefore = false

    //     for (let i = start - 1; i >= 0; i--) {
    //         console.log("text", textAreaText[i], start, textAreaText.length)
    //         if (textAreaText[i] !== ' ' && textAreaText[i] !== '\n' && textAreaText[i] !== '\t' && textAreaText[i] !== '\r') {
    //             hasCharacterBefore = true
    //             break
    //         }

    //         if (textAreaText[i] === '{' && i > 0 && textAreaText[i - 1] === '{') {
    //             hasCharacterBefore = false
    //             break
    //         }
    //     }

    //     if (start === 0) {
    //         hasCharacterBefore = true
    //     }

    //     if (hasCharacterBefore) {
    //         copiedText = '{{ ' + copiedText
    //     }

    //     let hasCharacterAfter = false

    //     for (let i = end; i < textAreaText.length; i++) {
    //         if (textAreaText[i] !== ' ' && textAreaText[i] !== '\n' && textAreaText[i] !== '\t' && textAreaText[i] !== '\r') {
    //             hasCharacterAfter = true
    //             break
    //         }
    //         if (textAreaText[i] === '}' && i < textAreaText.length - 1 && textAreaText[i + 1] === '}') {
    //             hasCharacterAfter = false
    //             break
    //         }
    //     }

    //     if (end === textAreaText.length) {
    //         hasCharacterAfter = true
    //     }

    //     if (hasCharacterAfter) {
    //         copiedText = copiedText + ' }}'
    //     }

    //     const newText = textAreaText.slice(0, start) + copiedText + textAreaText.slice(end)

    //     e.preventDefault()

    //     setValue('instruction', newText)

    //     // Set the cursor to the end of the pasted text for better user experience
    //     setTimeout(() => {
    //         ref.current?.setSelectionRange(start + copiedText.length, start + copiedText.length)
    //     }, 50)
    // }

    return <Stack gap='4'>
        <SegmentedControl.Root defaultValue="editor" value={view} onValueChange={setView}>
            <SegmentedControl.Item value="editor">Editor</SegmentedControl.Item>
            <SegmentedControl.Item value="preview">Preview</SegmentedControl.Item>
        </SegmentedControl.Root>
        {view === 'editor' ? <StaticInstructionField className='w-full'
            allowUsingTemplate={allowUsingTemplate}
            autoFocus={autoFocus}
            instructionRequired={instructionRequired}
        // onPaste={onPaste} 
        /> : <InstructionPreview />}

        <Separator className='w-full' />
        <Text size='2'>
            Here are some variables you can use in your instruction. Simply copy by clicking on the variable.
            <br />You can also use standard Jinja variables available in the system.
        </Text>
        <Table.Root variant='surface'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Variable</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {variables.map((v) => <VariableRow key={v.variable} variable={v.variable} description={v.description} />)}
            </Table.Body>
        </Table.Root>
    </Stack >
}

export const VariableRow = ({ variable, description, withoutJinja = false }: { variable: string, description: React.ReactNode, withoutJinja?: boolean }) => {
    return <Table.Row>
        <Table.Cell><VariableTooltip text={variable} withoutJinja={withoutJinja} /></Table.Cell>
        <Table.Cell>{description}</Table.Cell>
    </Table.Row>
}

export const VariableTooltip = ({ text, withoutJinja = false }: { text: string, withoutJinja?: boolean }) => {

    const [tooltip, setTooltip] = useState('')


    const copyText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        window.navigator.clipboard.writeText(withoutJinja ? text : "{{ " + text + " }}")
            .then(() => {
                setTooltip('Copied!')
                setTimeout(() => {
                    setTooltip('')
                }, 1000)
            })
            .catch(() => {
                toast.error('Failed to copy to clipboard')
            })
    }


    return <Tooltip
        content={tooltip}
        open={tooltip !== ''}
        onOpenChange={(o) => {
            if (o) {
                setTooltip('Copy to clipboard')

                setTimeout(() => {
                    setTooltip('')
                }, 1000)
            }
        }}
    >

        <Code
            role='button'
            onClick={copyText}
            aria-label='Copy to clipboard'
            className='cursor-pointer'
        >
            {text}</Code>
    </Tooltip>
}

const InstructionPreview = () => {

    const { watch } = useFormContext<InstructionFieldForm>()

    const instruction = watch('instruction')

    const { data } = useFrappeGetCall('raven.api.ai_features.get_instruction_preview', {
        instruction
    })

    return <Box className='border-2 px-2 py-1 rounded-md bg-gray-3'>
        {data ? <Text size='2' className='whitespace-pre-wrap'>{data.message}</Text> : null}
    </Box>
}

const StaticInstructionField = ({ allowUsingTemplate, instructionRequired, ...props }: TextAreaProps & { allowUsingTemplate?: boolean, instructionRequired?: boolean }) => {

    const { register, watch, formState: { errors } } = useFormContext<InstructionFieldForm>()


    const isDynamic = watch('dynamic_instructions')

    const placeholder = isDynamic ? "You are an assistant running on an ERP. The current user's name is {{ first_name }} and the current company is {{ company }}." : 'You are an assistant running on an ERP. You can answer questions about the company.'

    return <Stack>
        <Box>
            <HStack justify={'between'}>
                <Label htmlFor='instruction' isRequired>Instruction</Label>
                {allowUsingTemplate && <ImportTemplate />}
            </HStack>
            <TextArea
                id='instruction'
                {...register('instruction', {
                    required: instructionRequired ? 'Instruction is required' : false,
                    validate: (value) => {
                        if (!isDynamic && value.includes('{{')) {
                            return 'You cannot include Jinja tags without enabling dynamic instructions.'
                        }
                        return true
                    }
                })}
                rows={10}
                resize='vertical'
                placeholder={placeholder}
                aria-invalid={errors.instruction ? 'true' : 'false'}
                {...props}
            />
        </Box>
        {errors.instruction && <ErrorText size={'2'}>{errors.instruction?.message}</ErrorText>}

    </Stack>
}

const ImportTemplate = () => {

    const { setValue, getValues, watch } = useFormContext<InstructionFieldForm>()

    const isDynamic = watch('dynamic_instructions')

    const { data, error } = useFrappeGetDocList<RavenBotInstructionTemplate>("Raven Bot Instruction Template", {
        fields: ["template_name", "dynamic_instructions", "instruction"],
        // If status, do not show dynamic templates
        filters: isDynamic ? undefined : [["dynamic_instructions", "=", 0]]
    })

    const [selectedTemplate, setSelectedTemplate] = useState<string>("")

    const onSelectTemplate = (type: 'replace' | 'append') => {
        if (type === 'replace') {
            setValue('instruction', selectedTemplate)
        } else {
            setValue('instruction', getValues('instruction') + selectedTemplate)
        }
    }

    return <Popover.Root onOpenChange={() => setSelectedTemplate("")}>
        <Popover.Trigger>
            <Button variant='ghost' size={'1'} className='not-cal font-medium'>Import from Template</Button>
        </Popover.Trigger>
        <Popover.Content width={'300px'} className='z-50'>
            <Stack gap='6'>
                <ErrorBanner error={error} />
                <Box>
                    <Label htmlFor='template'>Select a template</Label>
                    {data && data.length === 0 && <Text size='2' color='gray'>No templates found</Text>}


                    {/* <Select.Root>
                        <Select.Trigger placeholder='Select a template' className='w-full' />
                        <Select.Content>
                            {data?.map((t) => <Select.Item key={t.name} value={t.instruction}>
                                <Text>{t.template_name}</Text> {t.dynamic_instructions ? <Badge color='purple'>Dynamic</Badge> : null}
                            </Select.Item>)}
                        </Select.Content>
                    </Select.Root> */}


                    <RadioCards.Root
                        columns={'1'}
                        name='template'
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                        className='max-h-96 overflow-y-auto'
                        gap={'2'}>
                        {data?.map((t) => <RadioCards.Item key={t.name} value={t.instruction} className='px-3 py-3'>
                            <HStack width="100%">
                                <Text>{t.template_name}</Text>
                                {t.dynamic_instructions ? <Box><Badge color='purple'><RiSparkling2Fill /> Dynamic</Badge></Box> : null}
                            </HStack>
                        </RadioCards.Item>
                        )}
                    </RadioCards.Root>
                </Box>
                <HStack justify={'end'}>
                    <Button type='button'
                        color='gray'
                        variant='soft'
                        onClick={() => onSelectTemplate('replace')}
                        disabled={!selectedTemplate}>Replace</Button>
                    <Button type='button' variant='soft'
                        disabled={!selectedTemplate}
                        onClick={() => onSelectTemplate('append')}
                    >Add</Button>
                </HStack>
            </Stack>

        </Popover.Content>
    </Popover.Root>


}

export default InstructionField