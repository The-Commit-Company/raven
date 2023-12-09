import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { LeaveChannelAlert } from "."
import { exitOutline } from "ionicons/icons"

export const LeaveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} detail={false}>
                <IonLabel color='danger'>Leave Channel</IonLabel>
                <IonIcon slot='end' icon={exitOutline} color='danger' />
            </IonItem>
            <LeaveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}