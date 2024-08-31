import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChangeChannelTypeModal } from './ChangeChannelTypeModal'
import { useState } from 'react'
import { Button, Dialog, Separator } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'

interface ChangeChannelTypeButtonProps {
    channelData: ChannelListItem,
    allowSettingChange: boolean
}

export const ChangeChannelTypeButton = ({ channelData, allowSettingChange }: ChangeChannelTypeButtonProps) => {
    return (
        <>
            {channelData.type === 'Public' && <>
                <ChangeChannelTypePublicPrivate channelData={channelData} allowSettingChange={allowSettingChange} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Public' &&
                <ChangeChannelTypeOpenPublic channelData={channelData} allowSettingChange={allowSettingChange} />}

            {channelData.type === 'Private' && <>
                <ChangeChannelTypePublicPrivate channelData={channelData} allowSettingChange={allowSettingChange} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Private' &&
                <ChangeChannelTypeOpenPrivate channelData={channelData} allowSettingChange={allowSettingChange} />}

            {channelData.type === 'Open' && <>
                <ChangeChannelTypeOpenPublic channelData={channelData} allowSettingChange={allowSettingChange} />
                <Separator className={'w-full'} />
            </>}
            {channelData.type === 'Open' &&
                <ChangeChannelTypeOpenPrivate channelData={channelData} allowSettingChange={allowSettingChange} />}
        </>
    )
}

const ChangeChannelTypePublicPrivate = ({ channelData, allowSettingChange }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
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
    else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
                        {channelData.type === 'Public' ? <BiLockAlt /> : <BiHash />}
                        Change to a {channelData.type === 'Public' ? 'private' : 'public'} channel
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className='pb-16 min-h-48 px-1 overflow-auto'>
                        <ChangeChannelTypeModal
                            newChannelType={channelData.type === 'Public' ? 'Private' : 'Public'}
                            onClose={onClose}
                            channelData={channelData} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
}

const ChangeChannelTypeOpenPublic = ({ channelData, allowSettingChange }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
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
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
                        {channelData.type === 'Open' ? <BiHash /> : <BiGlobe />}
                        Change to a {channelData.type === 'Open' ? 'public' : 'open'} channel
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className='pb-16 min-h-48 px-1 overflow-auto'>
                        <ChangeChannelTypeModal
                            newChannelType={channelData.type === 'Open' ? 'Public' : 'Open'}
                            onClose={onClose}
                            channelData={channelData} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
}

const ChangeChannelTypeOpenPrivate = ({ channelData, allowSettingChange }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
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
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 justify-start rounded-none'} disabled={!allowSettingChange}>
                        {channelData.type === 'Open' ? <BiLockAlt /> : <BiGlobe />}
                        Change to a {channelData.type === 'Open' ? 'private' : 'open'} channel
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className='pb-16 min-h-48 px-1 overflow-auto'>
                        <ChangeChannelTypeModal
                            newChannelType={channelData.type === 'Open' ? 'Private' : 'Open'}
                            onClose={onClose}
                            channelData={channelData} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
}
