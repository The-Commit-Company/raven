import { useState } from "react"
import { LeaveChannelAlert } from "."
import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { exitOutline } from "ionicons/icons";

export const LeaveChannelButton = ({ channelID, lines = 'inset' }: { channelID: string, lines?: "full" | "inset" | "none" }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem lines={lines} color='light' button onClick={() => setIsOpen(true)}>
                <IonIcon icon={exitOutline} size='small' slot="start" />
                <IonLabel>Leave Channel</IonLabel>
            </IonItem>
            <LeaveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}