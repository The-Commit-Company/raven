import { useState } from 'react'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { BiChevronDown } from 'react-icons/bi'
import { MdTranslate, MdOutlineKeyboardVoice } from 'react-icons/md'
import { BsSoundwave } from 'react-icons/bs'
import { AudioUploadDialog } from './AudioUploadDialog'

export const AudioToolButton = () => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [mode, setMode] = useState<'transcribe' | 'translate'>('transcribe')

    const openDialog = (selectedMode: 'transcribe' | 'translate') => {
        setMode(selectedMode)
        setDialogOpen(true)
    }

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <IconButton size="1" variant="ghost" title="Audio Tools">
                        <BsSoundwave />
                        <BiChevronDown />
                    </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => openDialog('transcribe')}>
                        <MdOutlineKeyboardVoice style={{ marginRight: 8 }} />
                        Transcribe
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => openDialog('translate')}>
                        <MdTranslate style={{ marginRight: 8 }} />
                        Translate
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <AudioUploadDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={mode} />
        </>
    )
}
