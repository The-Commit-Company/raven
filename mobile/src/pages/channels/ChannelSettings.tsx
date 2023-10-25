import { AddChannelMembersButton } from "@/components/features/channels/channel-members/AddChannelMembersButton"
import { ViewChannelMembersButton } from "@/components/features/channels/channel-members/ViewChannelMembersButton"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
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
                    <IonListHeader>
                        <IonLabel>Channel Settings</IonLabel>
                    </IonListHeader>

                    <ViewChannelMembersButton pageRef={pageRef} channelID={channelID} />
                    <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />

                </IonList>
            </IonContent>
        </IonPage>
    )
}