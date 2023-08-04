import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react"

export const Notifications = () => {
    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Notifications</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
            </IonContent>
        </IonPage>
    )
}