import { PropsWithChildren, useState } from 'react'
import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import raven_logo from '../../assets/raven_logo.png'
import { LoginWithEmail } from '@/pages/auth/LoginWithEmail';
import { Login } from '@/pages/auth/Login';
import { SignUp } from '@/pages/auth/SignUp';

type ActiveScreenType = {
    login: boolean,
    loginWithEmail: boolean,
    signup: boolean;
}

export type ActiveScreenProps = {
    setActiveScreen: (screen: ActiveScreenType) => void
}

const AuthContainer = ({ children, ...props }: PropsWithChildren) => {

    // default active screen should be login and others should be shown depending on action by user
    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>({
        login: true,
        loginWithEmail: false,
        signup: false
    })


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
                            <>
                                {activeScreen.login && <Login setActiveScreen={setActiveScreen}></Login>}
                                {activeScreen.loginWithEmail && <LoginWithEmail setActiveScreen={setActiveScreen}></LoginWithEmail>}
                                {activeScreen.signup && <SignUp setActiveScreen={setActiveScreen}></SignUp>}
                            </>
                        }
                    </div>
                </div>
            </IonContent>
        </IonPage>
    )
}

export default AuthContainer;