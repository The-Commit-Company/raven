import { IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { ArchiveChannelAlert } from "."
import { IoArchiveOutline } from "react-icons/io5"

export const ArchiveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} detail={false}>
                <div slot='start'>
                    <IoArchiveOutline />
                </div>
                <IonLabel>Archive Channel</IonLabel>
            </IonItem>
            <ArchiveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}