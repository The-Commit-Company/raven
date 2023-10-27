import { IonButton } from "@ionic/react"
import { useState } from "react"
import { DeleteChannelAlert } from "."

export const DeleteChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonButton fill="clear" color="danger" onClick={() => setIsOpen(true)}>Delete Channel</IonButton>
            <DeleteChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}