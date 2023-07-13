import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { store } from '../../App'
import { ErrorBanner } from '../../components/common'
import LoginGraphic from '../../assets/login.svg'
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
            <IonContent fullscreen>
                <IonImg src={raven_logo} alt="Raven Logo" className='raven-logo' />
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>

                    </IonToolbar>
                </IonHeader>

                <div className='text-center my-8'>
                    <img src={LoginGraphic} alt="" width='200px' className='mx-auto' />
                </div>
                {error && <ErrorBanner heading={error.message}>
                </ErrorBanner>}
                <IonItem>
                    <IonLabel position="stacked">Frappe URL <IonText color="danger">*</IonText></IonLabel>
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
                        type="submit" expand="block" fill="solid" disabled={loading}
                    >{loading ? <IonSpinner name="crescent" /> : "Login"}
                    </IonButton>
                </div>
            </IonContent>

        </IonPage>
    )
}