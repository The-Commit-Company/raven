import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { BiShow, BiHide, BiLogoGithub, BiLogoGoogle, BiLogoFacebookCircle, BiMailSend } from "react-icons/bi";
import { Link } from "react-router-dom";
import { Box, Button, Flex, IconButton, Text, TextField, Separator} from "@radix-ui/themes";
import { FrappeError, useFrappeGetCall } from "frappe-react-sdk";
import { UserContext } from "@/utils/auth/UserProvider";
import { Loader } from "@/components/common/Loader";
import { ErrorText, Label } from "@/components/common/Form";
import { ErrorCallout } from "@/components/common/Callouts";
import { LoginInputs, LoginContext } from "@/types/Auth/Login";
import { Auth } from "@/pages/auth/Auth"

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

export const Component = () => {

    // GET call for Login Context (settings for social logins, email link etc)
    const { data: loginContext, mutate } = useFrappeGetCall<LoginContext>('raven.api.login.get_context', {
        "redirect-to": "/raven"
    }, 'raven.api.login.get_context', {
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })
    const [error, setError] = useState<FrappeError | null>(null)
    const { login } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>()
    const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false)

    const onClickReveal = () => {
        setIsPasswordOpen(!isPasswordOpen)
    }

    async function onSubmit(values: LoginInputs) {
        setError(null)
        return login(values.email, values.password)
            .catch((error) => { setError(error) })
    }

    return (
        <Auth>
            {error && <ErrorCallout message={error.message} />}

            <Box>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex direction='column' gap='6'>
                        <Flex direction='column' gap='4'>

                            <Flex direction='column' gap='2'>
                                <Label htmlFor='email' isRequired>{loginContext?.message?.login_label}</Label>
                                <TextField.Root>
                                    <TextField.Input {...register("email",
                                        {
                                            required: `${loginContext?.message?.login_label} is required.`
                                        })}
                                        name="email"
                                        type="text"
                                        required
                                        placeholder="jane@example.com"
                                        tabIndex={0} />
                                </TextField.Root>
                                {errors?.email && <ErrorText>{errors?.email.message}</ErrorText>}
                            </Flex>

                            <Flex direction='column' gap='2'>
                                <Label htmlFor='password' isRequired>Password</Label>
                                <TextField.Root>
                                    <TextField.Input
                                        {...register("password",
                                            {
                                                required: "Password is required.",
                                                minLength: { value: 6, message: "Password should be minimum 6 characters." }
                                            })}
                                        name="password"
                                        type={isPasswordOpen ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        placeholder="***********" />
                                    <TextField.Slot>
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
                            </Flex>

                            <Flex direction='column' gap='2' >
                                <Button type='submit' disabled={isSubmitting} >
                                    {isSubmitting ? <Loader /> : 'Login'}
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </form>
                {/* Show Separator only when either Email Link or Social Logins are enabled */}
                {
                    loginContext?.message?.login_with_email_link || loginContext?.message?.social_login ?
                        <Flex justify='center' className="mt-8 mb-8">
                            <Separator className="w-full" />
                        </Flex> : null
                }
                {/* Map all social oauth providers */}
                {
                    loginContext?.message?.social_login ? loginContext?.message?.provider_logins.map((soc: SocialProvider, i: number) => {
                        return (
                            <Flex direction='column' key={i} className="mb-4" >
                                <Button variant="soft" highContrast className="cursor-default" disabled={isSubmitting} asChild>
                                    <Link to={soc.auth_url} className="flex items-center">
                                        {SocialProviderIcons[soc.name] ? SocialProviderIcons[soc.name] : <img src={soc.icon.src} alt={soc.icon.alt} ></img>}
                                        Login with {soc.provider_name}
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
                                variant="soft"
                                highContrast
                                disabled={isSubmitting}
                                className="cursor-default"
                            >
                                <Link to="/login-with-email">
                                    <BiMailSend size="18" />
                                    <Text>Login with Email Link</Text>
                                </Link>
                            </Button>
                        </Flex> : null
                }
            </Box>
        </Auth>
    )
}

Component.displayName = "LoginPage";