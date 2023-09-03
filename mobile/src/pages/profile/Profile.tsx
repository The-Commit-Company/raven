import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonText, IonItem, IonIcon, useIonLoading, useIonAlert, IonLabel } from '@ionic/react'
import { FrappeConfig, FrappeContext, useFrappeGetDoc } from 'frappe-react-sdk'
import { logOutOutline, pizza } from 'ionicons/icons'
import { useContext } from 'react'
import { ErrorBanner, FullPageLoader } from '../../components/layout'
import { UserContext } from '../../utils/auth/UserProvider'

interface User {
    name: string
    email: string,
    full_name: string,
    user_image?: string,

}
export const Profile = () => {

    const { currentUser, logout } = useContext(UserContext)

    const { url } = useContext(FrappeContext) as FrappeConfig

    const { data, isLoading, error } = useFrappeGetDoc<User>('User', currentUser)

    const handleLogout = () => {
        logout()
    }

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Profile</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>
                        <IonTitle size="large">Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {isLoading && <FullPageLoader />}
                {error && <ErrorBanner error={error} />}
                <IonList>
                    {data &&
                        <div className="my-8 flex justify-center flex-col items-center ion-text-center space-y-2">
                            <img alt={data.full_name} src={url + data.user_image ?? ""} className='w-32 h-auto mb-2 rounded-full' />
                            <h2 className='font-bold h2 text-2xl'>{data.full_name}</h2>
                            <span><IonText color="primary">{data.email}</IonText></span>
                        </div>
                    }
                    <IonItem button onClick={handleLogout}>
                        <IonIcon slot="start" icon={logOutOutline} />
                        Logout
                    </IonItem>
                </IonList>
                <div className="ion-text-center mt-16">
                    <IonText color="medium">Raven v1.2.0</IonText>
                    <br />
                    <IonText color="dark">Made by <IonText className='font-semibold'>The Commit Company</IonText>.</IonText>
                </div>
            </IonContent>
        </IonPage>
    )
}