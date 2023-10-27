import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonModal, IonTitle, IonToolbar, useIonToast } from "@ionic/react"
import { useRef } from "react"
import { Tiptap } from "../../chat-input/Tiptap"
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"

interface EditMessageModalProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    originalText: string,
    messageID: string,
    channelID: string,
}

export const EditMessageModal = ({ presentingElement, isOpen, onDismiss, originalText, messageID, channelID }: EditMessageModalProps) => {

    const modal = useRef<HTMLIonModalElement>(null)

    const [present] = useIonToast()

    const { updateDoc, loading } = useFrappeUpdateDoc()
    const { mutate } = useSWRConfig()

    const updateMessage = async (html: string, json: any) => {
        updateDoc('Raven Message', messageID,
            { text: html, json }).then((d) => {
                return present({
                    position: 'bottom',
                    color: 'success',
                    duration: 600,
                    message: 'Message updated',
                })
            }).catch((e) => {
                console.log(e)
                present({
                    color: 'danger',
                    duration: 600,
                    message: "Error: Could not update message",
                })
            }).then(() => mutate(`get_messages_for_channel_${channelID}`))
            .then(() => onDismiss())
    }

    return (
        <IonModal ref={modal} onDidDismiss={onDismiss} isOpen={isOpen} presentingElement={presentingElement}>

            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="medium" onClick={() => onDismiss()}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        <div className='flex flex-col items-center justify-start'>
                            <h1>Edit Message</h1>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => updateMessage} strong={true}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonItem lines="none">
                    <div className={'my-2'}>
                        <Tiptap defaultText={originalText} onMessageSend={updateMessage} messageSending={loading} />
                    </div>
                </IonItem>
            </IonContent>

        </IonModal>
    )
}