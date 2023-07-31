import {
  IonApp,
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
import { Storage } from '@ionic/storage';
import { UserProvider } from './utils/providers/UserProvider';
import { AppRouter } from './utils/Router';
import { FrappeDBProvider } from './utils/providers/FrappeDBProvider';
import { AuthProvider } from './utils/providers/AuthProvider';

export const store = new Storage();
await store.create();
setupIonicReact({
  mode: 'ios',
});

function App() {

  return (
    <IonApp>
      <AuthProvider>
        <FrappeDBProvider>
          <UserProvider>
            <AppRouter />
          </UserProvider>
        </FrappeDBProvider>
      </AuthProvider>
    </IonApp>
  )
}

export default App
