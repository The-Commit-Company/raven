import { Redirect, Route } from 'react-router-dom'
import { Navbar } from '../../components/layout'
import { IonReactRouter } from '@ionic/react-router'
import { IonRouterOutlet } from '@ionic/react'
import { ChatSpace } from '../../pages/chat'

export const Routes = () => {

    return (
        // @ts-ignore
        <IonReactRouter basename={import.meta.env.VITE_BASE_NAME ?? ''}>
            <IonRouterOutlet animated>
                <Route exact path="/channels" component={Navbar} />
                <Route exact path="/direct-messages" component={Navbar} />
                <Route exact path="/search" component={Navbar} />
                <Route exact path="/notifications" component={Navbar} />
                <Route exact path="/profile" component={Navbar} />
                <Route exact path="/">
                    <Redirect to="/channels" />
                </Route>
                <Route exact path="/channel/:channelID" component={ChatSpace} />
            </IonRouterOutlet>
        </IonReactRouter>
    )
}