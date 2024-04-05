import { useState } from "react"
import { ArchiveChannelAlert } from "."
import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { archiveOutline } from "ionicons/icons"

export const ArchiveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <IonItem color='light' button onClick={() => setIsOpen(true)}>
                <IonIcon icon={archiveOutline} size='small' slot="start" />
                <IonLabel>Archive Channel</IonLabel>
            </IonItem>
            <ArchiveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}