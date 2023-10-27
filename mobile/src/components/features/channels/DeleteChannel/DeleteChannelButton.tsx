import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { DeleteChannelAlert } from "."
import { trashOutline } from "ionicons/icons"

export const DeleteChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} detail={false}>
                <IonIcon slot='start' icon={trashOutline} color='danger' />
                <IonLabel color='danger'>Delete Channel</IonLabel>
            </IonItem>
            <DeleteChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}