import {
  IonApp, setupIonicReact
} from '@ionic/react';

import 'tailwindcss/tailwind.css';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import "cal-sans";
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
import { UserProvider } from './utils/auth/UserProvider';
import { Routes } from './utils/auth/Routes';
import { ChannelListProvider } from './utils/channel/ChannelListProvider';
import { UserListProvider } from './utils/users/UserListProvider';
import { ActiveUsersProvider } from './utils/users/ActiveUsersProvider';

setupIonicReact({
  mode: 'ios',
  swipeBackEnabled: false,
})

function App() {

  // We need to pass sitename only if the Frappe version is v15 or above.

  const getSiteName = () => {
    // @ts-ignore
    if (window.frappe?.boot?.versions?.frappe && window.frappe.boot.versions.frappe.startsWith('15')) {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
    }
    return import.meta.env.VITE_SITE_NAME

  }
  return (
    <IonApp>
      <FrappeProvider
        url={import.meta.env.VITE_FRAPPE_PATH ?? ''}
        socketPort={import.meta.env.VITE_SOCKET_PORT ? import.meta.env.VITE_SOCKET_PORT : undefined}
        //@ts-ignore
        siteName={getSiteName()}>
        <UserProvider>
          <UserListProvider>
            <ChannelListProvider>
              <ActiveUsersProvider>
                <Routes />
              </ActiveUsersProvider>
            </ChannelListProvider>
          </UserListProvider>
        </UserProvider>
      </FrappeProvider>
    </IonApp>
  )
}

export default App