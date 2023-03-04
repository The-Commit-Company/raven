import { IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, IonText } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { UserContext } from './UserProvider'
import { personCircleOutline, homeOutline } from 'ionicons/icons';
import { Login } from '../pages/auth'
import { Profile } from '../pages/profile'
import { FullPageLoader } from '../components/common'
type Props = {
    refreshFrappeURL: () => Promise<void>
}

export const AppRouter = ({ refreshFrappeURL }: Props) => {

    const { currentUser, isLoading } = useContext(UserContext)

    if (isLoading) {
        return <FullPageLoader />
    }
    if (currentUser) {
        {/* @ts-ignore */ }
        return <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <Route exact path="/channels">
                    </Route>
                    <Route exact path="/profile">
                        <Profile />
                    </Route>
                    <Route exact path="/">
                        <Redirect to="/channels" />
                    </Route>
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                    <IonTabButton tab="tab1" href="/channels">
                        <IonIcon aria-hidden="true" icon={homeOutline} />
                        <IonLabel>Home</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="tab2" href="/profile">
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