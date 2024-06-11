import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonIcon } from '@ionic/react'
import { FrappeConfig, FrappeContext, useFrappeGetDoc } from 'frappe-react-sdk'
import { logOutOutline } from 'ionicons/icons'
import { useContext } from 'react'
import { ErrorBanner } from '../../components/layout'
import { UserContext } from '../../utils/auth/UserProvider'
import { ProfileLoader } from '@/components/layout/loaders/ProfileLoader'
import { UserAvatar } from '@/components/common/UserAvatar'
import PushNotificationSetting from './PushNotificationSetting'
import { Heading, Text } from '@radix-ui/themes'

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

                {data &&
                    <div className="px-2 my-8 flex justify-center flex-col items-center ion-text-center space-y-4">
                        <UserAvatar size='6' alt={data.full_name} src={data.user_image ? `${url}${data.user_image}` : undefined} />
                        <div className='flex flex-col gap-1'>
                            <Heading className='font-bold h2 text-2xl'>{data.full_name}</Heading>
                            <Text as='span' color='iris'>{data.email}</Text>
                        </div>

                    </div>
                }
                <IonList inset>
                    <PushNotificationSetting />
                    <IonItem onClick={handleLogout} color='light'>
                        <IonIcon slot="end" icon={logOutOutline} />
                        Logout
                    </IonItem>
                </IonList>
                <div className="ion-text-center mt-16">
                    <Text as='span'><Text as='span' size='6' className='cal-sans'>raven</Text> <Text as='span' color='gray'>v1.6.0</Text></Text>
                    <br />
                    <Text as='span' color='gray'>Made by The Commit Company</Text>
                </div>
            </IonContent>
        </IonPage>
    )
}