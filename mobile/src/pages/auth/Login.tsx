import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { ErrorBanner } from '../../components/layout'
import raven_logo from '../../assets/raven_logo.png'
import { useContext, useState } from 'react'
import { UserContext } from '../../utils/auth/UserProvider'
import { useForm } from 'react-hook-form'
import { isEmailValid } from '../../utils/validations/validations'

type Inputs = {
    email: string,
    password: string
}

export const Login = () => {

    const [error, setError] = useState<Error | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()

    async function onSubmit(values: Inputs) {
        setError(null)
        return login(values.email, values.password).catch((error) => { setError(error) })
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
                    {error && <ErrorBanner heading={error.message}>
                    </ErrorBanner>}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <IonItem>
                            <IonInput
                                type="email" required
                                {...register("email", {
                                    required: "Email is required",
                                    validate: (e) => isEmailValid(e) ? true : "Please enter a valid email"
                                })}
                                placeholder='sally@example.com'
                                className={!!errors?.email ? 'ion-invalid ion-touched' : ''}
                                label='Email'
                                inputMode='email'
                                labelPlacement='stacked'
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                                type="password"
                                {...register("password", {
                                    required: "Password is required."
                                })}
                                required
                                placeholder='********'
                                className={!!errors?.password ? 'ion-invalid ion-touched' : ''}
                                label='Password'
                                labelPlacement='stacked'
                            />
                        </IonItem>
                        <IonButton
                            type="submit"
                            className='ion-margin-top'
                            expand="block">
                            {isLoading ? <IonSpinner name="crescent" /> : "Login"}
                        </IonButton>
                    </form>
                </div>
            </IonContent>

        </IonPage>
    )
}