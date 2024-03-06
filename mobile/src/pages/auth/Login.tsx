import { IonButton, IonInput, IonItem, IonSpinner, IonText } from '@ionic/react'
import { ErrorCallout } from '@/components/common/Callouts'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { BiLogoFacebookCircle, BiLogoGithub, BiLogoGoogle, BiMailSend } from 'react-icons/bi'
import { useFrappeGetCall, FrappeError, useFrappeAuth, AuthResponse } from 'frappe-react-sdk'
import { LoginContext, LoginInputs } from '@/types/Auth/Login'
import { TwoFactor } from './TwoFactor'
import { LoginWithEmailProps } from './LoginWithEmail'

const SocialProviderIcons = {
    "github": <BiLogoGithub size="18" />,
    "google": <BiLogoGoogle size="18" />,
    "facebook": <BiLogoFacebookCircle size="18" />
}

interface SocialProvider {
    name: 'github' | 'google' | 'facebook'
    provider_name: string,
    auth_url: string,
    redirect_to: string,
    icon: {
        src: string,
        alt: string
    },
}


export const Login = (props: LoginWithEmailProps) => {

    const { control, handleSubmit,formState: { errors,isSubmitting } } = useForm<LoginInputs>()
    // GET call for Login Context (settings for social logins, email link etc)
    const { data: loginContext, mutate } = useFrappeGetCall<LoginContext>('raven.api.login.get_context', {
        "redirect-to": "/raven"
    }, 'raven.api.login.get_context', {
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })
    const [error, setError] = useState<FrappeError | null>(null)

    const { login } = useFrappeAuth()
    // 2FA switch enabled and 2FA response
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false)
    const [loginWithTwoFAResponse, setLoginWithTwoFAResponse] = useState<AuthResponse | null>(null)


    async function onSubmit(values: LoginInputs) {
        setError(null)
        if (loginContext?.message?.two_factor_is_enabled) {
            // first 2FA call to send temp id and verification to user
            return login({ username: values.email, password: values.password }).then((res: AuthResponse) => {
                if (res?.verification && res?.tmp_id) {
                    setIsTwoFactorEnabled(true)
                    setLoginWithTwoFAResponse(res)
                }
            }).catch((error) => setError(error))
        } else {
            // if 2FA is disabled, do normal login
            return login({ username: values.email, password: values.password }).then(() => {
                //Reload the page so that the boot info is fetched again
                const URL = import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ``
                window.location.replace(`${URL}/channels`)
            }).catch((error) => { setError(error) })
        }
    }

    return (
            <>
                {error && <ErrorCallout message={error.message} />}
                {
                    isTwoFactorEnabled ? <TwoFactor loginWithTwoFAResponse={loginWithTwoFAResponse} setIsTwoFactorEnabled={setIsTwoFactorEnabled} /> :
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
                                    {isSubmitting ? <IonSpinner name="crescent" /> : "Login"}
                                </IonButton>
                            </form>
                             {/* Show Separator only when either Email Link or Social Logins are enabled */}
                        {
                            loginContext?.message?.login_with_email_link || loginContext?.message?.social_login ?
                                // <IonRow className="mt-8 mb-8">
                                <div className="flex flex-col w-full items-center">
                                    <IonText>OR</IonText>
                                </div>
                                 : null
                        }
                        {/* Map all social oauth providers */}
                        {
                            loginContext?.message?.social_login ? loginContext?.message?.provider_logins.map((soc: SocialProvider, i: number) => {
                                return (
                                        <IonButton className='ion-margin-top' fill="outline" type="button" expand="block" size="default" href={soc.auth_url}>
                                            {/* <Link to={soc.auth_url} className="items-center"> */}
                                                <div className='flex items-center'>
                                                    <div className='flex mr-1'>
                                                        {SocialProviderIcons[soc.name] ? SocialProviderIcons[soc.name] : <img src={soc.icon.src} alt={soc.icon.alt} ></img>}
                                                    </div>
                                                    <IonText color="dark">Login with {soc.provider_name}</IonText>
                                                </div>
                                                
                                            {/* </Link> */}
                                        </IonButton>

                                )
                            }) : null
                        }

                        {
                            loginContext?.message?.login_with_email_link ?

                                    <IonButton
                                        disabled={isSubmitting}
                                        expand="block"
                                        className="ion-margin-top cursor-default"
                                        fill='outline'
                                        type='button'
                                        size="default"
                                        onClick={()=>props.setIsLoginWithEmailScreen(true)}
                                    >
                                            <BiMailSend size="18" className="mr-1" />
                                            <IonText color="dark">Login with Email Link</IonText>
                                    </IonButton>
                                : null
                        }
                        </div>
                }
            </>
    )
}