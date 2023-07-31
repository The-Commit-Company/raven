import { IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react"
import { BiBell, BiChat, BiHash, BiSearch, BiUser } from "react-icons/bi"
import { Route } from "react-router-dom"
import { ChannelList } from "../../pages/channels"
import { DirectMessageList } from "../../pages/direct-messages/DirectMessageList"
import { Notifications } from "../../pages/notifications/Notifications"
import { Profile } from "../../pages/profile"
import { Search } from "../../pages/search/Search"

export const Navbar = () => {
    return <IonTabs>
        <IonRouterOutlet animated>
            <Route exact path="/:tab(channels)">
                <ChannelList />
            </Route>
            <Route exact path="/:tab(direct-messages)">
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
            <IonTabButton tab="direct-messages" href="/direct-messages">
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