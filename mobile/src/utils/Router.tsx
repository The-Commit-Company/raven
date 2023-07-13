import { IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, IonText } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { personCircleOutline, homeOutline } from 'ionicons/icons';
import { Login } from '../pages/auth'
import { Profile } from '../pages/profile'
import { FullPageLoader } from '../components/common'
import { ChannelList, ViewChannel } from '../pages/channels'
import { AuthContext } from './AuthProvider'

export const AppRouter = () => {

    const { isAuthenticated, logout } = useContext(AuthContext)

    if (isAuthenticated) {
        {/* @ts-ignore */ }
        return <IonReactRouter>
            <IonRouterOutlet animated>
                <Route exact path="/channels" component={Tabs} />
                <Route exact path="/profile" component={Tabs} />
                <Route exact path="/">
                    <Redirect to="/channels" />
                </Route>
                <Route exact path="/channel/:channelID" component={ViewChannel} />
            </IonRouterOutlet>
        </IonReactRouter>
        // logout()
    }
    return (
        <Login />
    )
}

const Tabs = () => {
    return <IonTabs>
        <IonRouterOutlet animated>
            <Route exact path="/:tab(channels)">
                <ChannelList />
            </Route>
            <Route exact path="/:tab(profile)">
                <Profile />
            </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
            <IonTabButton tab="channels" href="/channels">
                <IonIcon aria-hidden="true" icon={homeOutline} />
                <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
                <IonIcon aria-hidden="true" icon={personCircleOutline} />
                <IonLabel>Profile</IonLabel>
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
}