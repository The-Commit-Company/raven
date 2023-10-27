import { IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { DeleteChannelAlert } from "."
import { IoTrashOutline } from "react-icons/io5"

export const DeleteChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} detail={false}>
                <div slot='start'>
                    <IoTrashOutline color='var(--ion-color-danger)' />
                </div>
                <IonLabel color='danger'>Delete Channel</IonLabel>
            </IonItem>
            <DeleteChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}