import { RouteComponentProps } from "react-router-dom"
import { ChatInterface } from "../../components/features/chat-space"
import { ChannelProvider, IdentityParam } from "../../utils/channel/ChannelProvider"

export const ChatSpace: React.FC<RouteComponentProps<IdentityParam>> = (props) => {
  return (
    <ChannelProvider {...props}>
      <ChatInterface />
    </ChannelProvider>
  )
}