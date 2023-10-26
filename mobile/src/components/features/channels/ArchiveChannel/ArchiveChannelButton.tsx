import { IonButton } from "@ionic/react"
import { useState } from "react"
import { ArchiveChannelAlert } from "."

export const ArchiveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonButton fill="clear" color="danger" onClick={() => setIsOpen(true)} className="text-left justify-start">Archive Channel</IonButton>
            <ArchiveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}