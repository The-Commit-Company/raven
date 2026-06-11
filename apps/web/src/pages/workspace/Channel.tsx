import ChannelHeader from "@components/features/channel/ChannelHeader/ChannelHeader"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useChannel } from "@hooks/useChannel"

export default function Channel() {
    const channelID = useCurrentChannelID()
    const { channel } = useChannel(channelID)

    return (
        <div className="flex h-full min-h-0 flex-col">
            <ChannelHeader />
            {/* TODO: Enable once the workspace sidebar layout is rebuilt (SidebarProvider's
                min-h-svh w-full starves the outlet column, breaking the content geometry) */}
            {/* <ChatContentView
                channelID={channelID}
                pinnedMessagesString={channel?.pinned_messages_string}
            /> */}
        </div>
    )
}
