import { useState } from "react"
import { AddChannelMembers } from "./AddChannelMembers"
import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { personAddOutline } from "ionicons/icons"

interface AddChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const AddChannelMembersButton = ({ pageRef, channelID }: AddChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem color='light' button onClick={() => setIsOpen(true)}>
                <IonIcon icon={personAddOutline} size='small' slot="start" />
                <IonLabel>Add Members</IonLabel>
            </IonItem>
            <AddChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID}
            />
        </>
    )
}