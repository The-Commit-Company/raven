import { useState } from 'react'
import { Check, MoreVertical } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '@hooks/use-mobile'

/** The channel sidebar's overflow menu — create channel + sidebar view options. */
export const CustomizeSidebarButton = ({ showMyChannelsOnly, setShowMyChannelsOnly }: { showMyChannelsOnly: boolean, setShowMyChannelsOnly: (showMyChannelsOnly: boolean) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const navigate = useNavigate()
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
                <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="min-w-64">
                    <DropdownMenuItem onClick={() => setShowMyChannelsOnly(!showMyChannelsOnly)}>
                        <span>{_("Only show channels I've joined")}</span>{showMyChannelsOnly && <Check className="h-4 w-4 text-ink-gray-8" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                        <span>{_("Create a new channel")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                        <span>{_("Customize my sidebar")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/channels')}>
                        <span>{_("Manage channels")}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
