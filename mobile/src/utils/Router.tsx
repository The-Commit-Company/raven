import { IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, IonText } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { Login } from '../pages/auth'
import { Profile } from '../pages/profile'
import { FullPageLoader } from '../components/common'
import { ChannelList, ViewChannel } from '../pages/channels'
import { AuthContext } from './AuthProvider'
import { BiHash, BiChat, BiBell, BiUser, BiSearch } from 'react-icons/bi'
import { DirectMessageList } from '../pages/directMessages/DirectMessageList'
import { Search } from '../pages/search/Search'
import { Notifications } from '../pages/notifications/Notifications'

export const AppRouter = () => {

    const { isAuthenticated, logout } = useContext(AuthContext)

    if (isAuthenticated) {
        {/* @ts-ignore */ }
        return <IonReactRouter>
            <IonRouterOutlet animated>
                <Route exact path="/channels" component={Tabs} />
                <Route exact path="/directmessages" component={Tabs} />
                <Route exact path="/search" component={Tabs} />
                <Route exact path="/notifications" component={Tabs} />
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
            <Route exact path="/:tab(directmessages)">
                <DirectMessageList />
            </Route>
            <Route exact path="/:tab(search)">
                <Search />
            </Route>
            <Route exact path="/:tab(notifications)">
                <Notifications />
            </Route>
            <Route exact path="/:tab(profile)">
                <Profile />
            </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
            <IonTabButton tab="channels" href="/channels">
                <BiHash size={30} />
            </IonTabButton>
            <IonTabButton tab="directmessages" href="/directmessages">
                <BiChat size={30} />
            </IonTabButton>
            <IonTabButton tab="search" href="/search">
                <BiSearch size={30} />
            </IonTabButton>
            <IonTabButton tab="notifications" href="/notifications">
                <BiBell size={30} />
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
                <BiUser size={30} />
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
}