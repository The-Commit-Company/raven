import ChannelHeader from "@components/features/channel/ChannelHeader/ChannelHeader"
import ChannelSettingsDrawer from "@components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer"
import ChannelMembersDrawer from "@components/features/channel/ChannelMembersDrawer/ChannelMembersDrawer"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { useAtomValue } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useGetMessages } from "@hooks/useGetMessages"

const SETTINGS_DRAWER_TYPES = ["info", "files", "links", "threads", "pins"] as const

export default function Channel() {
    const channelID = useCurrentChannelID()
    const { data, isLoading } = useGetMessages(channelID)
    const drawerType = useAtomValue(channelDrawerAtom(channelID))

    const contextDrawer =
        drawerType === "members" ? (
            <ChannelMembersDrawer />
        ) : SETTINGS_DRAWER_TYPES.includes(drawerType as (typeof SETTINGS_DRAWER_TYPES)[number]) ? (
            <ChannelSettingsDrawer />
        ) : null

    return (
        <div className="flex h-full min-h-0 flex-col">
            <ChannelHeader />
            <ChatContentView
                channelID={channelID}
                messages={data?.messages}
                isLoading={isLoading}
                contextDrawer={contextDrawer}
            />
        </div>
    )
}
