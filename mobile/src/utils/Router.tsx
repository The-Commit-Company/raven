import { IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, IonText } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Route } from 'react-router-dom'
import { UserContext } from './UserProvider'
import { personCircleOutline, homeOutline } from 'ionicons/icons';
import { Login } from '../pages/auth'
type Props = {
    refreshFrappeURL: () => Promise<void>
}

export const AppRouter = ({ refreshFrappeURL }: Props) => {

    const { currentUser, isLoading } = useContext(UserContext)

    if (isLoading) {
        return <div className='h-screen w-screen flex justify-center items-center flex-col'>
            <IonSpinner color={'dark'} name='crescent' />
            <IonText color='medium' className='text-sm mt-3'>Ravens are finding their way to you...</IonText>
        </div>
    }
    if (currentUser) {
        {/* @ts-ignore */ }
        return <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <Route exact path="/tab1">
                        {/* <Tab1 /> */}
                    </Route>
                    <Route exact path="/tab2">
                        {/* <Tab2 /> */}
                    </Route>
                    <Route path="/tab3">
                        {/* <Tab3 /> */}
                    </Route>
                    <Route exact path="/">
                    </Route>
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                    <IonTabButton tab="tab1" href="/tab1">
                        <IonIcon aria-hidden="true" icon={homeOutline} />
                        <IonLabel>Home</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="tab2" href="/tab2">
                        <IonIcon aria-hidden="true" icon={personCircleOutline} />
                        <IonLabel>Profile</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    }
    return (
        <Login refreshFrappeURL={refreshFrappeURL} />
    )
}