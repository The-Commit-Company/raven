import { IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { IoPersonAdd } from "react-icons/io5"
import { AddChannelMembers } from "./AddChannelMembers"

interface AddChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const AddChannelMembersButton = ({ pageRef, channelID }: AddChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem lines="full" button onClick={() => setIsOpen(true)}>
                <div slot='start'>
                    <IoPersonAdd size='18' color='var(--ion-color-medium)' />
                </div>
                <IonLabel color='medium'>
                    Add Members
                </IonLabel>
            </IonItem>
            <AddChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID} />
        </>
    )
}