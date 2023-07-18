import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonText, IonItem, IonIcon, useIonLoading, useIonAlert, IonLabel } from '@ionic/react'
import { FrappeConfig, FrappeContext, useFrappeGetDoc } from 'frappe-react-sdk'
import { logOutOutline, pizza } from 'ionicons/icons'
import { useContext } from 'react'
import { ErrorBanner, FullPageLoader } from '../../components/common'
import { AuthContext } from '../../utils/AuthProvider'
import { UserContext } from '../../utils/UserProvider'

interface User {
    name: string
    email: string,
    full_name: string,
    user_image?: string,

}
export const Profile = () => {

    const { currentUser } = useContext(UserContext)
    const { logout } = useContext(AuthContext)

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
                {error && <ErrorBanner heading="There was an error while fetching your profile.">
                    <p>{error.exception} - HTTP {error.httpStatus}</p>
                </ErrorBanner>}
                <IonList>
                    {data &&
                        <div className="my-8 flex justify-center flex-col items-center ion-text-center space-y-2">
                            <img alt={data.full_name} src={url + data.user_image ?? ""} className='w-100 h-auto mb-2 rounded-full' />
                            <h2 className='font-bold h2 text-2xl'>{data.full_name}</h2>
                            <span><IonText color="primary">{data.email}</IonText></span>
                        </div>
                    }
                    <IonItem>
                        <IonLabel color={'medium'}>URL</IonLabel>
                        <IonText color='medium'>{url}</IonText>
                    </IonItem>
                    <IonItem button onClick={handleLogout}>
                        <IonIcon slot="start" icon={logOutOutline} />
                        Logout
                    </IonItem>
                </IonList>
                <div className="ion-text-center mt-16">
                    <IonText color="medium">Raven v1.0.0 (Build 1)</IonText>
                    <br />
                    <IonText color="medium">Made by bots who consume <IonIcon icon={pizza} color="danger" />.</IonText>
                </div>
            </IonContent>
        </IonPage>
    )
}