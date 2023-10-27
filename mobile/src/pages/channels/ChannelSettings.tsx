import { AddChannelMembers } from "@/components/features/channels"
import { ArchiveChannelButton } from "@/components/features/channels/ArchiveChannel"
import { DeleteChannelButton } from "@/components/features/channels/DeleteChannel"
import { IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef, useState } from "react"
import { IoPersonAdd } from "react-icons/io5"
import { useParams } from "react-router-dom"

export const ChannelSettings = () => {

    const pageRef = useRef()
    const [isOpen, setIsOpen] = useState(false)

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

                    <IonItem lines="full" button onClick={() => setIsOpen(true)}>
                        <div slot='start'>
                            <IoPersonAdd size='18' color='var(--ion-color-medium)' />
                        </div>
                        <IonLabel color='medium'>
                            Add Members
                        </IonLabel>
                    </IonItem>
                    <div className="flex flex-col">
                        <ArchiveChannelButton channelID={channelID} />
                        <DeleteChannelButton channelID={channelID} />
                    </div>

                </IonList>
            </IonContent>

            <AddChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID} />
        </IonPage>
    )
}