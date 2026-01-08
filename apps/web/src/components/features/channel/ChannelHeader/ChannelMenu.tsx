import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useSetAtom } from "jotai"
import { BellOff, ChevronDown, Hash, Settings, Users } from "lucide-react"

const ChannelMenu = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="default" className="h-7 rounded-sm">
                    <div className="flex items-center gap-1">
                        <Hash className="size-3.5" strokeWidth={2.4} />
                        <span className="text-md font-medium">Channel Name</span>
                    </div>
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <SettingsButton />
                <MembersButton />
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <BellOff className="h-4 w-4" />
                    <span>Mute channel</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const SettingsButton = () => {

    const channelID = useCurrentChannelID()

    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const onOpenSettings = () => {
        setDrawerType('info')
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
            <span>Channel settings</span>
        </DropdownMenuItem>
    )
}

const MembersButton = () => {

    const channelID = useCurrentChannelID()

    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const onOpenMembers = () => {
        setDrawerType('members')
    }

    return <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpenMembers}>
        <Users className="h-4 w-4" />
        <span>Channel members</span>
    </DropdownMenuItem>
}

export default ChannelMenu