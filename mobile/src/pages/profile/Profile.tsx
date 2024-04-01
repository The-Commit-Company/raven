import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonText, IonItem, IonIcon, useIonLoading, useIonAlert, IonLabel } from '@ionic/react'
import { FrappeConfig, FrappeContext, useFrappeGetDoc } from 'frappe-react-sdk'
import { logOutOutline, pizza } from 'ionicons/icons'
import { useContext } from 'react'
import { ErrorBanner } from '../../components/layout'
import { UserContext } from '../../utils/auth/UserProvider'
import { FullPageLoader } from '@/components/layout/loaders'
import { ProfileLoader } from '@/components/layout/loaders/ProfileLoader'
import { UserAvatar } from '@/components/common/UserAvatar'
import PushNotificationSetting from './PushNotificationSetting'
import { Heading, Strong, Text } from '@radix-ui/themes'

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
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Profile</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {isLoading && <ProfileLoader />}
                {error && <ErrorBanner error={error} />}
                <IonList>
                    {data &&
                        <div className="my-8 flex justify-center flex-col items-center ion-text-center space-y-4">
                            <UserAvatar size='6' alt={data.full_name} src={data.user_image ? `${url}${data.user_image}` : undefined} />
                            <div className='flex flex-col gap-1'>
                                <Heading className='font-bold h2 text-2xl'>{data.full_name}</Heading>
                                <Text as='span' color='iris'>{data.email}</Text>
                            </div>

                        </div>
                    }
                    <PushNotificationSetting />
                    <IonItem button onClick={handleLogout}>
                        <IonIcon slot="start" icon={logOutOutline} />
                        Logout
                    </IonItem>
                </IonList>
                <div className="ion-text-center mt-16">
                    <Text as='span'><Text as='span' size='6' className='cal-sans'>raven</Text> <Text as='span' color='gray'>v1.5.0</Text></Text>
                    <br />
                    <Text as='span' color='gray'>Made by <Strong>The Commit Company</Strong></Text>
                </div>
            </IonContent>
        </IonPage>
    )
}