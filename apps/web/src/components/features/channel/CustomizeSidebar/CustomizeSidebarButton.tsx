import { useState } from 'react'
import { FilterIcon, MoreVertical, PlusIcon, SidebarIcon } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
    Dialog,
    DialogContent,
} from '@components/ui/dialog'
import {
    Drawer,
    DrawerContent,
} from '@components/ui/drawer'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { CustomizeSidebarDialog } from './CustomizeSidebarDialog'
import { CreateChannelDialog } from '@components/features/channel/CreateChannel/CreateChannelButton'
import _ from "@lib/translate"
import { useIsMobile } from '@hooks/use-mobile'
import { useSetAtom } from 'jotai'
import { settingsDialogOpenTab } from '@components/features/settings/SettingsDialog'
import { Hash } from '@components/common/ChannelIcon/ChannelIcon'

/** The channel sidebar's overflow menu — create channel + sidebar view options. */
export const CustomizeSidebarButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)

    const setSettingsDialogAtom = useSetAtom(settingsDialogOpenTab)
    const isMobile = useIsMobile()

    const content = <CustomizeSidebarDialog onClose={() => setIsOpen(false)} />

    return (
        <>
            {isMobile ? (
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerContent className="h-[90vh] flex flex-col">
                        {content}
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="md:max-w-[70vw] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                        {content}
                    </DialogContent>
                </Dialog>
            )}

            <CreateChannelDialog open={createOpen} onOpenChange={setCreateOpen} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        aria-label={_("Channel options")}
                    >
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="min-w-64">
                    <DropdownMenuItem onClick={() => setSettingsDialogAtom('preferences')}>
                        <FilterIcon />{_("Filter and sort channels")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSettingsDialogAtom('sidebar')}>
                        <SidebarIcon />{_("Customize my sidebar")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSettingsDialogAtom('channels')}>
                        <Hash />{_("Manage channels")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                        <PlusIcon />{_("Create a new channel")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
