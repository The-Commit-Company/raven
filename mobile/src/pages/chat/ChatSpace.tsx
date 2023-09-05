import { RouteComponentProps } from "react-router-dom"
import { ChatInterface } from "../../components/features/chat-space"
import { ChannelProvider, IdentityParam } from "../../utils/channel/ChannelProvider"
import { useGetChannelData } from "@/hooks/useGetChannelData"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { ErrorBanner, FullPageLoader } from "@/components/layout"
import { FrappeError } from "frappe-react-sdk"

export const ChatSpace: React.FC<RouteComponentProps<IdentityParam>> = (props) => {

  // Get the channel ID from here and check if it exists in our channel list
  const { channelID } = props.match.params
  // Find the channel from the channel list
  const { channel, isLoading, error } = useGetChannelData(channelID)

  return <IonPage>
    {/* // If the channel list is loading or there is an error, show a page with the error */}
    {isLoading || error ? <LoadingErrorPage isLoading={isLoading} error={error} /> :

      channel === undefined ? <LoadingErrorPage isLoading={isLoading} error={{ message: `Channel <strong>${channelID}</strong> not found.` } as FrappeError} /> :
        // Else show the chat interface
        <ChatInterface channel={channel} />}
  </IonPage>
}

const LoadingErrorPage = ({ isLoading, error }: { isLoading: boolean, error?: FrappeError }) => {
  return <>
    <IonHeader>
      <IonToolbar>
        <IonButtons>
          <IonBackButton defaultHref="/channels" />
        </IonButtons>
        <IonTitle>Channel</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen>
      {isLoading && <FullPageLoader />}
      {error && <ErrorBanner error={error} />}
    </IonContent>
  </>
}