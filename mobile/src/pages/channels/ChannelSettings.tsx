import { AddChannelMembersButton, ViewChannelMembersButton } from "@/components/features/channels/channel-members"
import { ArchiveChannelButton } from "@/components/features/channels/archive-channel"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonList, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef } from "react"
import { useParams } from "react-router-dom"

export const ChannelSettings = () => {

    const pageRef = useRef()
    const { channelID } = useParams<{ channelID: string }>()

    return (
        <IonPage ref={pageRef}>

            <IonHeader>
                <IonToolbar>
                    <IonButtons slot='start'>
                        <IonBackButton color='medium' text=' ' className='px-2' defaultHref="../" />
                    </IonButtons>
                    <IonTitle>Channel Settings</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen={true}>
                <IonList>

                    <ViewChannelMembersButton pageRef={pageRef} channelID={channelID} />
                    <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />
                    <ArchiveChannelButton channelID={channelID} />

                </IonList>
            </IonContent>
        </IonPage>
    )
}