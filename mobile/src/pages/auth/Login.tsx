import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { store } from '../../App'
import { ErrorBanner } from '../../components/common'
import { AuthContext } from '../../utils/AuthProvider'
import raven_logo from '../../assets/raven_logo.png'
import './styles.css'

export const Login = () => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { response } = useContext(AuthContext);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [frappeURL, setFrappeURL] = useState<string | undefined>(undefined)

    const refreshFrappeURL = async () => {
        return store.get('frappeURL').then(url => {
            if (url) {
                setFrappeURL(url)
            } else {
                setFrappeURL(undefined)
            }
        })
    }

    if (!url) {
        refreshFrappeURL()
    } else {
        if (frappeURL !== url) {
            store.set('frappeURL', url)
            refreshFrappeURL()
        }
    }

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Raven</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className='ion-padding'>
                <div slot='fixed' className="text-center absolute left-0 right-0 top-1/4 transform justify-center items-center">
                    <IonHeader collapse="condense" translucent>
                        <IonToolbar>
                            <IonImg src={raven_logo} alt="Raven Logo" className="block m-auto w-60" />
                        </IonToolbar>
                    </IonHeader>
                    {error && <ErrorBanner heading={error.message}>
                    </ErrorBanner>}
                    <IonItem>
                        <IonLabel position="stacked">Frappe Site URL <IonText color="danger">*</IonText></IonLabel>
                        <IonInput
                            type="url"
                            clearInput
                            inputMode="url"
                            enterkeyhint="next"
                            required
                            disabled={loading}
                            value={frappeURL}
                        />
                    </IonItem>
                    <div className="ion-padding">
                        <IonButton
                            onClick={() => {
                                setLoading(true)
                                response().then(() => {
                                    setLoading(false)
                                }).catch((error: Error) => {
                                    setError(error)
                                    setLoading(false)
                                })
                            }}
                            type="submit" expand="block" fill="clear" disabled={loading}
                            className="bg-purple-500/[.45] text-white font-bold py-2 px-4 rounded"
                        >{loading ? <IonSpinner name="crescent" /> : "Login"}
                        </IonButton>
                    </div>
                </div>
            </IonContent>

        </IonPage>
    )
}