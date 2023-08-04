import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { PrivateMessages } from "../../components/features/direct-messages"

export const DirectMessageList = () => {
    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Direct Messages</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <PrivateMessages />
            </IonContent>
        </IonPage>
    )
}