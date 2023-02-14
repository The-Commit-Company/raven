import { ChatInterface } from "../components/feature/chat"
import { ChannelProvider } from "../utils/channel/ChannelProvider"

type Props = {}

export const ChatSpace = (props: Props) => {

    return (
        <ChannelProvider>
            <ChatInterface />
        </ChannelProvider>
    )
}