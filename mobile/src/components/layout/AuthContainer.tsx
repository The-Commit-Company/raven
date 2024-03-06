import { PropsWithChildren, useState } from 'react'
import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import raven_logo from '../../assets/raven_logo.png'
import { LoginWithEmail } from '@/pages/auth/LoginWithEmail';
import { Login } from '@/pages/auth/Login';


const AuthContainer = ({ children, ...props }: PropsWithChildren) => {
    const [isLoginWithEmailScreen, setIsLoginWithEmailScreen] = useState<boolean>(false)

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Raven</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className='ion-padding'>
                <div className="left-0 right-0 top-1/4 p-2 transform justify-center items-center">
                    <IonHeader collapse="condense" translucent>
                        <IonToolbar>
                            <IonImg src={raven_logo} alt="Raven Logo" className="block m-auto mb-4 w-40" />
                        </IonToolbar>
                    </IonHeader>

                    <div className='w-100'>
                        {
                            isLoginWithEmailScreen ? <LoginWithEmail setIsLoginWithEmailScreen={setIsLoginWithEmailScreen}/> : <Login setIsLoginWithEmailScreen={setIsLoginWithEmailScreen}/>
                        }
                    </div>
                </div>
            </IonContent>
        </IonPage>
    )

}

export default AuthContainer;