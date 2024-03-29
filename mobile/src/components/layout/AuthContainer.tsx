import { PropsWithChildren, useState } from 'react'
import { IonPage } from '@ionic/react';
import { LoginWithEmail } from '@/pages/auth/LoginWithEmail';
import { Login } from '@/pages/auth/Login';
import { SignUp } from '@/pages/auth/SignUp';

type ActiveScreenType = {
    login: boolean,
    loginWithEmail: boolean,
    signup: boolean;
}

export interface ActiveScreenProps {
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
            <div className='ion-padding'>
                <div className="left-0 right-0 top-1/4 p-2 transform justify-center items-center">
                        <div className='pb-4'>
                            <span className='cal-sans text-5xl font-semibold leading-normal'>raven</span>
                        </div>
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
            </div>
        </IonPage>
    )
}

export default AuthContainer;