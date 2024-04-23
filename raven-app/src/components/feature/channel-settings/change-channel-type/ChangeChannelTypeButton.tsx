import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChangeChannelTypeModal } from './ChangeChannelTypeModal'
import { useState } from 'react'
import { Button, Dialog, Separator } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

interface ChangeChannelTypeButtonProps {
    channelData: ChannelListItem
}

export const ChangeChannelTypeButton = ({ channelData }: ChangeChannelTypeButtonProps) => {
    return (
        <>
            {channelData.type === 'Public' && <>
                <ChangeChannelTypePublicPrivate channelData={channelData} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Public' &&
                <ChangeChannelTypeOpenPublic channelData={channelData} />}

            {channelData.type === 'Private' && <>
                <ChangeChannelTypePublicPrivate channelData={channelData} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Private' &&
                <ChangeChannelTypeOpenPrivate channelData={channelData} />}

            {channelData.type === 'Open' && <>
                <ChangeChannelTypeOpenPublic channelData={channelData} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Open' &&
                <ChangeChannelTypeOpenPrivate channelData={channelData} />}
        </>
    )
}

const ChangeChannelTypePublicPrivate = ({ channelData }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button className={'p-6 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start'}>
                    {channelData.type === 'Public' ? <BiLockAlt /> : <BiHash />}
                    Change to a {channelData.type === 'Public' ? 'private' : 'public'} channel
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <ChangeChannelTypeModal
                    newChannelType={channelData.type === 'Public' ? 'Private' : 'Public'}
                    onClose={onClose}
                    channelData={channelData} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

const ChangeChannelTypeOpenPublic = ({ channelData }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button className={'p-6 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start'}>
                    {channelData.type === 'Open' ? <BiHash /> : <BiGlobe />}
                    Change to a {channelData.type === 'Open' ? 'public' : 'open'} channel
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <ChangeChannelTypeModal
                    newChannelType={channelData.type === 'Open' ? 'Public' : 'Open'}
                    onClose={onClose}
                    channelData={channelData} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

const ChangeChannelTypeOpenPrivate = ({ channelData }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button className={'p-6 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start'}>
                    {channelData.type === 'Open' ? <BiLockAlt /> : <BiGlobe />}
                    Change to a {channelData.type === 'Open' ? 'private' : 'open'} channel
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <ChangeChannelTypeModal
                    newChannelType={channelData.type === 'Open' ? 'Private' : 'Open'}
                    onClose={onClose}
                    channelData={channelData} />
            </Dialog.Content>
        </Dialog.Root>
    )
}
