import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { ArchiveChannelAlert } from "."
import { archiveOutline } from "ionicons/icons"

export const ArchiveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} detail={false}>
                <IonIcon slot='start' icon={archiveOutline} />
                <IonLabel>Archive Channel</IonLabel>
            </IonItem>
            <ArchiveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}