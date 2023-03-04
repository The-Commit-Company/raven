import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonPage, IonSpinner, IonText, IonTitle, IonToolbar, useIonAlert } from '@ionic/react'
import { FrappeConfig, FrappeContext, FrappeError, useFrappeAuth } from 'frappe-react-sdk'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { store } from '../../App'
import { UserContext } from '../../utils/UserProvider'

type Props = {
    refreshFrappeURL: () => Promise<void>
}

interface LoginFormFields {
    frappeURL: string
    email: string
    password: string
}

export const Login = ({ refreshFrappeURL }: Props) => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>({
        defaultValues: {
            frappeURL: url
        }
    })

    const [loading, setLoading] = useState(false)

    const [presentAlert] = useIonAlert();
    const { login } = useContext(UserContext)
    const onSubmit = (data: LoginFormFields) => {
        setLoading(true)
        store.set('frappeURL', data.frappeURL)
            .then(() => refreshFrappeURL())
            .then(() => login(data.email, data.password))
            .catch(err => presentAlert({
                header: 'Uh oh! There was an error.',
                message: err?.message,
                buttons: ['Ok'],
            }))
            .finally(() => setLoading(false))
    }
    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Raven</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>
                        <IonTitle size="large">Raven</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <IonList className="ion-margin-vertical">
                        <IonItem className={errors?.frappeURL ? 'ion-invalid' : 'ion-valid'}>
                            <IonLabel position="stacked">Frappe URL <IonText color="danger">*</IonText></IonLabel>
                            <IonInput
                                type="url"
                                clearInput
                                inputMode="url"
                                enterkeyhint="next"
                                required
                                disabled={loading}
                                {...register("frappeURL", { required: "Frappe URL is required." })} />
                            {errors.frappeURL && <IonNote slot="error">{errors.frappeURL?.message}</IonNote>}
                        </IonItem>
                        <IonItem className={errors?.email ? 'ion-invalid' : 'ion-valid'}>
                            <IonLabel position='stacked'>Email <IonText color="danger">*</IonText></IonLabel>
                            <IonInput
                                type="email"
                                clearInput
                                autocomplete="email"
                                inputMode="email"
                                enterkeyhint="next"
                                required
                                disabled={loading}
                                {...register("email", { required: "Email is required." })} />
                            {errors.email && <IonNote slot="error">{errors.email?.message}</IonNote>}
                        </IonItem>
                        <IonItem className={errors?.password ? 'ion-invalid' : 'ion-valid'}>
                            <IonLabel position="stacked">Password <IonText color="danger">*</IonText></IonLabel>
                            <IonInput
                                type="password"
                                clearInput
                                autocomplete="current-password"
                                enterkeyhint="done"
                                required
                                disabled={loading}
                                {...register("password", { required: "Password is required." })} />
                            {errors.password && <IonNote slot="error">{errors.password?.message}</IonNote>}
                        </IonItem>
                    </IonList>
                    <div className="ion-padding">
                        <IonButton onClick={handleSubmit(onSubmit)} type="submit" expand="block" fill="solid" disabled={loading}>
                            {loading ? <IonSpinner name="crescent" /> : "Login"}</IonButton>
                    </div>
                </form>
            </IonContent>

        </IonPage>
    )
}