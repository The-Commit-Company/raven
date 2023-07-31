import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';

import 'tailwindcss/tailwind.css';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// import './styles/global.css';
import './styles/variables.css';
import { FrappeProvider } from 'frappe-react-sdk';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ViewChannel } from './pages/channels';
import { UserProvider } from './utils/auth/UserProvider';
import { ProtectedRoute } from './utils/auth/ProtectedRoute';

setupIonicReact({
  mode: 'ios',
})

function App() {

  return (
    <IonApp>
      <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''} socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}>
        <UserProvider>
          {/* @ts-ignore */}
          <IonReactRouter>
            <IonRouterOutlet animated>
              <ProtectedRoute exact path="/channels" component={Navbar} />
              <ProtectedRoute exact path="/direct-messages" component={Navbar} />
              <ProtectedRoute exact path="/search" component={Navbar} />
              <ProtectedRoute exact path="/notifications" component={Navbar} />
              <ProtectedRoute exact path="/profile" component={Navbar} />
              <ProtectedRoute exact path="/">
                <Redirect to="/channels" />
              </ProtectedRoute>
              <ProtectedRoute exact path="/channel/:channelID" component={ViewChannel} />
            </IonRouterOutlet>
          </IonReactRouter>
        </UserProvider>
      </FrappeProvider>
    </IonApp>
  )
}

export default App
