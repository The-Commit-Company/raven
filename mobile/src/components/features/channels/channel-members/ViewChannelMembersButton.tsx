import { IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { IoPeople } from "react-icons/io5"
import { ViewChannelMembers } from "./ViewChannelMembers"

interface ViewChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const ViewChannelMembersButton = ({ pageRef, channelID }: ViewChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem lines="full" button onClick={() => setIsOpen(true)}>
                <div slot='start'>
                    <IoPeople size='18' color='var(--ion-color-medium)' />
                </div>
                <IonLabel color='medium'>
                    View Members
                </IonLabel>
            </IonItem>
            <ViewChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID} />
        </>
    )
}