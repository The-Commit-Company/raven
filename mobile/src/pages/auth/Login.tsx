import { IonSpinner } from '@ionic/react'
import { ErrorCallout } from '@/components/common/Callouts'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFrappeGetCall, FrappeError, useFrappeAuth, AuthResponse } from 'frappe-react-sdk'
import { LoginContext, LoginInputs } from '@/types/Auth/Login'
import { TwoFactor } from '@/pages/auth/TwoFactor'
import { ActiveScreenProps } from '@/components/layout/AuthContainer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { OAuthProviderInterface, OAuthProvider, EmailLoginProvider, SocialSeparator } from '@/components/auth/SocialProviders'


export const Login = (props: ActiveScreenProps) => {

    const form = useForm<LoginInputs>()
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
            <div className='flex flex-col gap-y-6'>
                {error && <ErrorCallout message={error.message} />}
                {
                    isTwoFactorEnabled ? <TwoFactor loginWithTwoFAResponse={loginWithTwoFAResponse} setIsTwoFactorEnabled={setIsTwoFactorEnabled} /> :
                        <div className='flex flex-col gap-y-6'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className='flex flex-col gap-y-6'>
                                        <div className='flex flex-col gap-2'>
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                rules={{
                                                    required: "Email/Username is required",
                                                }}
                                                render={({ field, formState }) => (
                                                    <FormItem>
                                                        <FormLabel>Email/Username <span className='text-rose-600'>*</span></FormLabel>
                                                        <FormControl>
                                                            {/* Type=text as email/username both are allowed */}
                                                            <Input type="text" placeholder='jane@example.com' {...field} />
                                                        </FormControl>
                                                        {formState.errors.email && <FormMessage>{formState.errors.email.message}</FormMessage>}
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                rules={{
                                                    required: "Password is required.",
                                                    minLength: {
                                                        value: 6,
                                                        message: "Password must be atleast 6 characters."
                                                    }
                                                }}
                                                render={({ field, formState }) => (
                                                    <FormItem>
                                                        <FormLabel>Password <span className='text-rose-600'>*</span></FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="******" {...field} />
                                                        </FormControl>
                                                        {formState.errors.password && <FormMessage>{formState.errors.password.message}</FormMessage>}
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                        <Button
                                            type="submit"
                                            variant="default"
                                            disabled={form.formState.isSubmitting}
                                        >
                                            {form.formState.isSubmitting ? <IonSpinner name="crescent" /> : <span className="font-medium text-sm leading-normal">Login</span>}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                            {/* Show Separator only when either Email Link or Social Logins are enabled */}
                            {
                                loginContext?.message?.login_with_email_link || loginContext?.message?.social_login ?
                                    <SocialSeparator/>
                                    : null
                            }
                            {/* Map all social oauth providers */}
                            <div className='flex flex-col gap-2'>
                                {
                                    loginContext?.message?.social_login ? loginContext?.message?.provider_logins.map((soc: OAuthProviderInterface, i: number) => {
                                        return (
                                            <OAuthProvider key={i} soc={soc}/>
                                        )
                                    }) : null
                                }

                                <div className='flex flex-col gap-2'>
                                    {
                                        loginContext?.message?.login_with_email_link ?
                                            <EmailLoginProvider setActiveScreen={props.setActiveScreen} isSubmitting={form.formState.isSubmitting} />
                                            : null
                                    }
                                </div>
                            </div>

                        </div>
                }

                {
                    loginContext?.message?.disable_signup === 0 ?
                        <div className="flex justify-center items-center">
                            <span className='flex self-center text-sm font-medium leading-normal'>Don't have an account yet?&nbsp;</span>
                            <Button
                                variant='link'
                                className='px-0'
                                onClick={() => props.setActiveScreen({ login: false, loginWithEmail: false, signup: true })}
                            >
                                Sign Up
                            </Button>
                        </div> : null
                }
            </div>
        </>
    )
}