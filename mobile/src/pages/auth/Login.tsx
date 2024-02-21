import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { ErrorBanner } from '../../components/layout'
import raven_logo from '../../assets/raven_logo.png'
import { useContext, useState } from 'react'
import { UserContext } from '../../utils/auth/UserProvider'
import { Controller, set, useForm } from 'react-hook-form'
import { isEmailValid } from '../../utils/validations/validations'

type Inputs = {
    email: string,
    password: string
}

export const Login = () => {

    const [error, setError] = useState<Error | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { control, handleSubmit, formState: { errors } } = useForm<Inputs>()
    const [loading, setLoading] = useState(false)

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
                                    placeholder='sally@example.com'
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
                            expand="block">
                            {loading ? <IonSpinner name="crescent" /> : "Login"}
                        </IonButton>
                    </form>
                </div>
            </IonContent>

        </IonPage>
    )
}