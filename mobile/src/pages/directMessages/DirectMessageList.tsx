import { IonContent, IonHeader, IonLabel, IonPage, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react"
import { PrivateMessages } from "../../components/features/ChannelList"

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