import { AddChannelMembersButton, ViewChannelMembersButton } from "@/components/features/channels/channel-members"
import { ArchiveChannelButton } from "@/components/features/channels/ArchiveChannel"
import { DeleteChannelButton } from "@/components/features/channels/DeleteChannel"
import { LeaveChannelButton } from "@/components/features/channels/LeaveChannel"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
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
                    <IonItemGroup className="py-2">
                        <LeaveChannelButton channelID={channelID} />
                    </IonItemGroup>
                    <IonItemGroup className="py-2">
                        <IonItemDivider className="bg-transparent text-sm text-zinc-300 pt-2">
                            <IonLabel>Channel Management</IonLabel>
                        </IonItemDivider>
                        <ArchiveChannelButton channelID={channelID} />
                        <DeleteChannelButton channelID={channelID} />
                    </IonItemGroup>
                </IonList>
            </IonContent>
        </IonPage>
    )
}