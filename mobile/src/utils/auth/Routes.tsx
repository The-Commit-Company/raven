import { Redirect, Route } from 'react-router-dom'
import { Navbar } from '../../components/layout'
import { IonReactRouter } from '@ionic/react-router'
import { IonRouterOutlet, useIonToast } from '@ionic/react'
import { ChatSpace } from '../../pages/chat'
import { useContext, useEffect } from 'react'
import { UserContext } from './UserProvider'
import { App } from '@capacitor/app';
import { FrappeConfig, FrappeContext, useSWRConfig } from 'frappe-react-sdk'
import { wifi } from 'ionicons/icons'
import { ChannelSettings } from '@/pages/channels/ChannelSettings'
import { fetchToken, init } from '@/firebase'

export const Routes = () => {
    const { isLoggedIn } = useContext(UserContext)

    const { mutate } = useSWRConfig()
    const { call } = useContext(FrappeContext) as FrappeConfig

    const [present, dismiss] = useIonToast();

    useEffect(() => {
        const presentToast = () => {
            present({
                message: 'You seem to be offline. Please check your internet connection.',
                position: 'bottom',
                animated: true,
                color: 'danger',
                icon: wifi,
            });
        };

        const dismissToast = () => {
            dismiss();
        }

        const handleNetworkChange = () => {
            if (navigator.onLine) {
                dismissToast();
            } else {
                presentToast();
            }
        }

        window.addEventListener('offline', handleNetworkChange);
        window.addEventListener('online', handleNetworkChange);

        return () => {
            window.removeEventListener('offline', handleNetworkChange);
            window.removeEventListener('online', handleNetworkChange);
        }

    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            call.get('raven.api.user_availability.refresh_user_active_state', {
                deactivate: false
            })
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (isLoggedIn) {
            App.addListener('appStateChange', ({ isActive }) => {

                // Refresh active state
                call.get('raven.api.user_availability.refresh_user_active_state', {
                    deactivate: !isActive
                }).then(() => {
                    if (isActive) {
                        mutate('active_users', undefined, true)
                    }
                })
            })

            init()
            fetchToken()
                .then(token => {
                    if (token) {
                        call.post('raven.api.notification.add_push_token', {
                            token,
                            platform: 'Mobile',
                            //TODO: Add device and OS info
                        })
                    }
                })
        }

        return () => {
            App.removeAllListeners()
        }
    }, [isLoggedIn])

    return (
        // @ts-ignore
        <IonReactRouter basename={import.meta.env.VITE_BASE_NAME ?? ''}>
            <IonRouterOutlet animated>
                <Route path="/channels" component={Navbar} />
                <Route exact path="/direct-messages" component={Navbar} />
                <Route exact path="/search" component={Navbar} />
                <Route exact path="/notifications" component={Navbar} />
                <Route exact path="/profile" component={Navbar} />
                <Route exact path="/">
                    <Redirect to="/channels" />
                </Route>
                <Route exact path="/channel/:channelID" component={ChatSpace} />
                <Route exact path="/channel/:channelID/:channel-settings" component={ChannelSettings} />
            </IonRouterOutlet>
        </IonReactRouter>
    )
}