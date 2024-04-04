import { useState } from "react"
import { DeleteChannelAlert } from "."
import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { trashOutline } from "ionicons/icons";


export const DeleteChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem color='light' button onClick={() => setIsOpen(true)}>
                <IonIcon color='danger' size='small' icon={trashOutline} slot="start" />
                <IonLabel color='danger'>Delete Channel</IonLabel>
            </IonItem>
            <DeleteChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}