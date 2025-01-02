import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiShow, BiHide, BiLogoGithub, BiLogoFacebookCircle, BiMailSend } from "react-icons/bi";
import { Link } from "react-router-dom";
import { Box, Button, Flex, IconButton, Text, TextField, Link as LinkButton } from "@radix-ui/themes";
import { FrappeError, useFrappeGetCall, useFrappeAuth, AuthResponse } from "frappe-react-sdk";
import { Loader } from "@/components/common/Loader";
import { ErrorText, Label } from "@/components/common/Form";
import { LoginInputs, LoginContext } from "@/types/Auth/Login";
import AuthContainer from "@/components/layout/AuthContainer";
import { TwoFactor } from "@/pages/auth/TwoFactor";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";
import { DateSeparator } from "@/components/layout/Divider/DateSeparator";
import { FcGoogle } from "react-icons/fc";
import { useTheme } from "@/ThemeProvider";
import { Stack } from "@/components/layout/Stack";
import { ErrorCallout } from "@/components/common/Callouts/ErrorCallouts";

export const SocialProviderIcons = {
    "github": <BiLogoGithub size="24" />,
    "google": <FcGoogle size="24" />,
    "facebook": <BiLogoFacebookCircle size="24" color="#316FF6" />
}

export interface SocialProvider {
    name: 'github' | 'google' | 'facebook'
    provider_name: string,
    auth_url: string,
    redirect_to: string,
    icon: {
        src: string,
        alt: string
    },
}

export const Component = () => {


    const { appearance } = useTheme()

    const { data: loginContext, mutate } = useLoginContext()
    const [error, setError] = useState<FrappeError | null>(null)

    const { login } = useFrappeAuth()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>()
    const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false)
    // 2FA switch enabled and 2FA response
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false)
    const [loginWithTwoFAResponse, setLoginWithTwoFAResponse] = useState<AuthResponse | null>(null)

    const onClickReveal = () => {
        setIsPasswordOpen(!isPasswordOpen)
    }

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
                window.location.replace(`${URL}`)
            }).catch((error) => { setError(error) })
        }
    }

    return (
        <AuthContainer>
            {error && <ErrorCallout>
                {error.message}
            </ErrorCallout>}
            {
                isTwoFactorEnabled ? <TwoFactor loginWithTwoFAResponse={loginWithTwoFAResponse} setError={setError} setIsTwoFactorEnabled={setIsTwoFactorEnabled} /> :
                    <Box>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Flex direction='column' gap='6'>
                                <Flex direction='column' gap='4'>

                                    <Flex direction='column' gap='2'>
                                        <Label htmlFor='email' isRequired size='3'>{loginContext?.message?.login_label}</Label>
                                        <TextField.Root {...register("email",
                                            {
                                                required: `${loginContext?.message?.login_label} is required.`
                                            })}
                                            name="email"
                                            type="text"
                                            required
                                            // Adding an ID here so that on Safari, the autofill appears below the field. Else it was appearing in top left corner of the screen.
                                            id="email"
                                            size='3'
                                            color="gray"
                                            variant={appearance === 'dark' ? "soft" : undefined}
                                            placeholder="jane@example.com"
                                            tabIndex={0} />
                                        {errors?.email && <ErrorText>{errors?.email.message}</ErrorText>}
                                    </Flex>

                                    <Flex direction='column' gap='2'>
                                        <Label htmlFor='password' isRequired size='3'>Password</Label>
                                        <TextField.Root  {...register("password",
                                            {
                                                required: "Password is required.",
                                            })}
                                            name="password"
                                            type={isPasswordOpen ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            id="password"
                                            size='3'
                                            variant={appearance === 'dark' ? "soft" : undefined}
                                            placeholder="***********"
                                            color="gray" >
                                            <TextField.Slot side='right'>
                                                <IconButton
                                                    type='button'
                                                    size='1'
                                                    variant='ghost'
                                                    aria-label={isPasswordOpen ? "Mask password" : "Reveal password"}
                                                    onClick={onClickReveal}
                                                    tabIndex={-1}>
                                                    {isPasswordOpen ? <BiHide /> : <BiShow />}
                                                </IconButton>
                                            </TextField.Slot>
                                        </TextField.Root>
                                        {errors?.password && <ErrorText>{errors.password?.message}</ErrorText>}

                                        <Flex direction='column' gap='2' align="end">
                                            <LinkButton
                                                asChild
                                                color='gray'
                                                size="2"
                                            >
                                                <Link to="/forgot-password">
                                                    Forgot Password?
                                                </Link>
                                            </LinkButton>
                                        </Flex>
                                    </Flex>

                                    <Flex direction='column' gap='2'>
                                        <Button type='submit' disabled={isSubmitting}
                                            size='3'
                                            className="not-cal font-medium">
                                            {isSubmitting ? <Loader className="text-white" /> : 'Login'}
                                        </Button>
                                    </Flex>

                                </Flex>
                            </Flex>
                        </form>

                    </Box>
            }
            <OtherLoginMethods isSubmitting={isSubmitting} />
            {
                loginContext?.message?.disable_signup === 0 ?
                    <Flex gap="1" justify="center">
                        <Text size="2" color="gray">Don't have an account yet?</Text>
                        <LinkButton
                            size="2"
                            asChild
                        >
                            <Link to="/signup">
                                <Text>Sign Up</Text>
                            </Link>
                        </LinkButton>
                    </Flex> : null
            }

        </AuthContainer>
    )
}

const useLoginContext = () => {
    // GET call for Login Context (settings for social logins, email link etc)
    return useFrappeGetCall<LoginContext>('raven.api.login.get_context', {
        "redirect-to": "/raven"
    }, 'raven.api.login.get_context', {
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })
}

export const OtherLoginMethods = ({ isSubmitting }: { isSubmitting: boolean }) => {

    const { data: loginContext } = useLoginContext()

    return <Stack gap='3'>
        {/* Show Separator only when either Email Link or Social Logins are enabled */}
        {
            loginContext?.message?.login_with_email_link || loginContext?.message?.social_login ?
                <Flex justify='center' className="mt-1 mb-5 w-full">
                    <DateSeparator className="w-full">
                        <Text size='2' color='gray' className="uppercase">or</Text>
                    </DateSeparator>
                </Flex> : null
        }
        {/* Map all social oauth providers */}
        {
            loginContext?.message?.social_login ? loginContext?.message?.provider_logins.map((soc: SocialProvider, i: number) => {
                return (
                    <Flex direction='column' key={i} >
                        <Button
                            size='3'
                            color='gray'
                            variant="outline"
                            className="not-cal font-medium text-gray-12 dark:text-white"
                            disabled={isSubmitting}
                            asChild>
                            <Link to={soc.auth_url} className="flex items-center">
                                {SocialProviderIcons[soc.name] ? SocialProviderIcons[soc.name] : <img src={soc.icon.src} alt={soc.icon.alt} style={{ width: '20px', height: '20px' }} ></img>}
                                Continue with {soc.provider_name}
                            </Link>
                        </Button>
                    </Flex>
                )
            }) : null
        }

        {
            loginContext?.message?.login_with_email_link ?
                <Flex direction='column' >
                    <Button type="button"
                        asChild
                        size='3'
                        color='gray'
                        variant="outline"
                        className="not-cal font-medium text-gray-12 dark:text-white"
                        disabled={isSubmitting}
                    >
                        <Link to="/login-with-email">
                            <BiMailSend size="24" />
                            <Text>Login with Email Link</Text>
                        </Link>
                    </Button>
                </Flex> : null
        }
    </Stack>

}

Component.displayName = "LoginPage";