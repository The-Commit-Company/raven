
import { Box, Button, Dialog, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { useCurrentEditor } from '@tiptap/react'
import { BiSolidMagicWand } from 'react-icons/bi'
import { DEFAULT_BUTTON_STYLE, ICON_PROPS } from './ToolPanel'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { RavenBotAIPrompt } from '@/types/RavenAI/RavenBotAIPrompt'
import { getKeyboardMetaKeyString } from '@/utils/layout/keyboardKey'
import { Stack } from '@/components/layout/Stack'
import { useNavigate } from 'react-router-dom'

const AISavedPromptsButton = () => {
    const { editor } = useCurrentEditor()

    const [open, setOpen] = useState(false)

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    if (!editor) {
        return null
    }

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Tooltip content={`Insert a command (${getKeyboardMetaKeyString()} + Shift + K)`}>
            <IconButton
                size='1'
                variant='ghost'
                className={DEFAULT_BUTTON_STYLE}
                onClick={() => setOpen(true)}
                title='Insert a Command'
                aria-label={"insert a command"}>
                <BiSolidMagicWand {...ICON_PROPS} />
            </IconButton>
        </Tooltip>

        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            <Dialog.Title>Insert a command</Dialog.Title>
            <Dialog.Description size='2'>
                Select a saved command to insert into your message.
            </Dialog.Description>
            <SavedPrompts onClose={() => setOpen(false)} />
        </Dialog.Content>
    </Dialog.Root>
}

type SavedPrompt = Pick<RavenBotAIPrompt, 'name' | 'raven_bot' | 'prompt' | 'is_global'>
const SavedPrompts = ({ onClose }: { onClose: () => void }) => {

    const { editor } = useCurrentEditor()

    const isDesktop = useIsDesktop()

    const { data, isLoading } = useFrappeGetCall<{ message: SavedPrompt[] }>('raven.api.ai_features.get_saved_prompts', {
    })

    const navigate = useNavigate()


    return <Command label="Global Command Menu" className='command-menu'>
        <Command.Input
            autoFocus={isDesktop}
            className='ml-0 my-2 text-base italic'
            placeholder='Search saved prompts' />
        <Command.List>
            <Command.Empty className='py-4'>

                <Stack align='center' justify='center' gap='2'>
                    <Text size='2' color='gray' weight='medium'>No saved prompts found</Text>
                    <Box>
                        <Button className='not-cal'
                            variant='soft'
                            onClick={() => navigate('/settings/commands')}>Create</Button>
                    </Box>
                </Stack>
            </Command.Empty>
            {isLoading && <Command.Loading>Loading...</Command.Loading>}
            {data?.message.map((prompt) => (
                <Command.Item key={prompt.name}
                    onSelect={() => {
                        editor?.chain().focus().insertContent(prompt.prompt).run()
                        onClose()
                    }}
                    keywords={[prompt.prompt]}
                    value={prompt.prompt}>
                    {prompt.prompt}
                </Command.Item>
            ))}
        </Command.List>
    </Command>

}

export default AISavedPromptsButton