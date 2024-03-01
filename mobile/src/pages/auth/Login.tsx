import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonPage, IonSpinner, IonTitle, IonToolbar, IonText, IonRow } from '@ionic/react'
import { ErrorBanner } from '../../components/layout'
import {SuccessCallout, CalloutObject} from '@/components/common/SuccessCallout'
import raven_logo from '../../assets/raven_logo.png'
import { useContext, useState } from 'react'
import { UserContext } from '../../utils/auth/UserProvider'
import { Controller, useForm } from 'react-hook-form'
import { LoginWithEmail } from '@/pages/auth/LoginWithEmail'

type Inputs = {
    email: string,
    password: string
}

export const Login = () => {

    const [error, setError] = useState<Error | null>(null)
    const { login } = useContext(UserContext)
    const { control, handleSubmit, formState: { errors } } = useForm<Inputs>()
    const [loading, setLoading] = useState(false)
    const [callout, setCallout] = useState<CalloutObject | null>(null)
    const [isLoginWithEmailLink, setIsLoginWithEmailLink] = useState<boolean>(false)

     // to show/unshow login with email section
     const onClickLoginWithEmail = () =>{
        setError(null)
        setCallout(null)
        setIsLoginWithEmailLink(!isLoginWithEmailLink)   
    }

    async function onSubmit(values: Inputs) {
        setError(null)
        setLoading(true)
        return login(values.email, values.password).catch((error) => { setError(error) }).finally(() => setLoading(false))
    }

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Raven</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className='ion-padding'>
                <div slot='fixed' className="left-0 right-0 top-1/4 p-2 transform justify-center items-center">
                    <IonHeader collapse="condense" translucent>
                        <IonToolbar>
                            <IonImg src={raven_logo} alt="Raven Logo" className="block m-auto mb-4 w-40" />
                        </IonToolbar>
                    </IonHeader>
                    {error && <ErrorBanner overrideHeading={error.message} />}
                    { callout && <SuccessCallout message={callout.message}/> }  
                    {
                        isLoginWithEmailLink ? 
                        <LoginWithEmail 
                             setCallout={setCallout}
                             setError={setError}
                             onClickLoginWithEmail={onClickLoginWithEmail} 
                         />:
                         <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                        <IonItem>
                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: "Email/Username is required",
                                }}
                                render={({ field }) => <IonInput
                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                    required
                                    placeholder='jane@example.com'
                                    className={!!errors?.email ? 'ion-invalid ion-touched' : ''}
                                    label='Email/Username'
                                    errorText={errors?.email?.message}
                                    inputMode='email'
                                    labelPlacement='stacked'
                                />}
                            />
                        </IonItem>
                        <IonItem>
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: "Password is required."
                                }}
                                render={({ field }) => <IonInput
                                    type="password"
                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                    required
                                    errorText={errors?.password?.message}
                                    placeholder='********'
                                    className={!!errors?.password ? 'ion-invalid ion-touched' : ''}
                                    label='Password'
                                    labelPlacement='stacked'
                                />}
                            />
                        </IonItem>
                        <IonButton
                            type="submit"
                            className='ion-margin-top'
                            expand="block"
                            >
                            {loading ? <IonSpinner name="crescent" /> : "Login"}
                        </IonButton>
                    </form>
                    <IonRow class="ion-justify-content-center ion-margin-top ion-margin-bottom">
                        <IonText color="medium" >
                            or
                        </IonText>
                    </IonRow>
                    <IonButton
                        type="button"
                        onClick={onClickLoginWithEmail}
                        expand="block"
                    >
                        {loading ? <IonSpinner name="crescent" /> : "Login With Email Link"}    
                    </IonButton>
            </div>
                    }
                    
        </div>
        </IonContent>

        </IonPage>
    )
}
