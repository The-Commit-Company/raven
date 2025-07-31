import { IconButton } from '@radix-ui/themes';
import { Tooltip } from '@radix-ui/themes'
import { useState } from 'react'
import { BiPlus } from 'react-icons/bi'
import { RemindMeMessageDialog } from '../chat/ChatMessage/MessageActions/RemindMeMessage'

interface CreateReminderButtonProps {
    onClose?: () => void
}

function CreateReminderButton({ onClose }: CreateReminderButtonProps) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const onCloseCreateModal = () => {
        setIsCreateModalOpen(false)

        onClose?.()
    }

    return (
        <>
            <Tooltip content="New Reminder">
                <IconButton
                    size="1"
                    variant="soft"
                    color="gray"
                    onClick={() => setIsCreateModalOpen(true)}
                    aria-label="new reminder"
                    className='flex-shrink-0'
                >
                    <BiPlus />
                </IconButton>
            </Tooltip>

            <RemindMeMessageDialog isOpen={isCreateModalOpen} onClose={onCloseCreateModal} />
        </>
    )
}

export default CreateReminderButton