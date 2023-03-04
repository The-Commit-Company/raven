import { IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, IonText } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { UserContext } from './UserProvider'
import { personCircleOutline, homeOutline } from 'ionicons/icons';
import { Login } from '../pages/auth'
import { Profile } from '../pages/profile'
import { FullPageLoader } from '../components/common'
import { ChannelList } from '../pages/channels'
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
            <IonRouterOutlet animated>
                <Route exact path="/channels" component={Tabs} />
                <Route exact path="/profile" component={Tabs} />
                <Route exact path="/">
                    <Redirect to="/channels" />
                </Route>
                <Route exact path="/channel/:channelID">
                </Route>
            </IonRouterOutlet>
        </IonReactRouter>
    }
    return (
        <Login refreshFrappeURL={refreshFrappeURL} />
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