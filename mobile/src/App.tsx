import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
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

import './styles/global.css';
import './styles/variables.css';
import { IonReactRouter } from '@ionic/react-router';
import { Login } from './pages/auth';
import { FrappeProvider } from 'frappe-react-sdk';
import { Storage } from '@ionic/storage';
import { useEffect, useState } from 'react';
import { UserProvider } from './utils/UserProvider';
import { AppRouter } from './utils/Router';

export const store = new Storage();
await store.create();
setupIonicReact({
  mode: 'ios',
});

function App() {

  const [loading, setLoading] = useState<boolean>(true)
  const [frappeURL, setFrappeURL] = useState<string | undefined>(undefined)
  /** 
   * Fetch the Frappe URL from the storage and set it in the context.
   * If no Frappe URL is found, redirect to the login page.
   */
  useEffect(() => {
    store.get('frappeURL').then(url => {
      if (url) {
        setFrappeURL(url)
        setLoading(false)
      } else {
        setFrappeURL(undefined)
        setLoading(false)
      }
    })
  }, [])

  const refreshFrappeURL = async () => {
    return store.get('frappeURL').then(url => {
      if (url) {
        setFrappeURL(url)
      } else {
        setFrappeURL(undefined)
      }
    })
  }

  return (
    <IonApp>
      {!loading &&
        <FrappeProvider url={frappeURL}>
          <UserProvider>
            <AppRouter refreshFrappeURL={refreshFrappeURL} />
          </UserProvider>
        </FrappeProvider>
      }
    </IonApp>
  )
}

export default App
