import { RouteComponentProps } from "react-router-dom"
import { ChatInterface } from "../../components/features/chat-space"
import { IdentityParam } from "../../utils/channel/ChannelProvider"
import { useGetChannelData } from "@/hooks/useGetChannelData"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { ErrorBanner } from "@/components/layout"
import { FrappeError, useSWRConfig } from "frappe-react-sdk"
import { ChatLoader } from "../../components/layout/loaders/ChatLoader"
import { UnreadChannelCountItem, UnreadCountData } from "@/utils/channel/ChannelListProvider"

export const ChatSpace: React.FC<RouteComponentProps<IdentityParam>> = (props) => {

  // Get the channel ID from here and check if it exists in our channel list
  const { channelID } = props.match.params
  // Find the channel from the channel list
  const { channel, isLoading, error } = useGetChannelData(channelID)

  const { mutate, cache } = useSWRConfig()

  useIonViewDidEnter(() => {

    // setting last visited channel in local storage
    localStorage.setItem("ravenLastChannel", channelID)

    const unread_count = cache.get('unread_channel_count')

    // If unread count is present
    if (unread_count?.data) {
      // Mutate the unread channel count to set the unread count of the current channel to 0
      //@ts-ignore
      mutate('unread_channel_count', (d: { message: UnreadCountData } | undefined) => {
        if (d) {
          const newChannels: UnreadChannelCountItem[] = d.message.channels.map(c => {
            if (c.name === channelID)
              return {
                ...c,
                unread_count: 0
              }
            return c
          })

          const total_unread_count_in_channels = newChannels.reduce((acc: number, c) => {
            if (!c.is_direct_message) {
              return acc + c.unread_count
            } else {
              return acc
            }
          }, 0)

          const total_unread_count_in_dms = newChannels.reduce((acc: number, c) => {
            if (c.is_direct_message) {
              return acc + c.unread_count
            } else {
              return acc
            }
          }, 0)


          return {
            message: {
              ...d.message,
              channels: newChannels,
              total_unread_count_in_channels,
              total_unread_count_in_dms
            }
          }
        }
        else {
          return d
        }


      }, {
        revalidate: false
      })
    }

  }, [])

  return <IonPage>
    {/* // If the channel list is loading or there is an error, show a page with the error */}
    {isLoading || error ? <LoadingErrorPage isLoading={isLoading} error={error} /> :

      channel === undefined ? <LoadingErrorPage isLoading={isLoading} error={{ message: `Channel <strong>${channelID}</strong> not found.` } as FrappeError} /> :
        // Else show the chat interface
        <ChatInterface channel={channel} />}
  </IonPage>
}

const LoadingErrorPage = ({ isLoading, error, channelID }: { isLoading: boolean, error?: FrappeError, channelID?: string }) => {
  return <>
    <IonHeader>
      <IonToolbar>
        <IonButtons>
          <IonBackButton defaultHref="/channels" text='' className="px-2" color='dark' />
        </IonButtons>
        <IonTitle>{channelID ?? "Channel"}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen className="ion-padding">
      {isLoading && <ChatLoader />}
      {error && <ErrorBanner error={error} />}
    </IonContent>
  </>
}