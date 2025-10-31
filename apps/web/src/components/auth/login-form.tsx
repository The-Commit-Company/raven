import { Button } from "@components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@components/ui/field"
import { Input } from "@components/ui/input"
import { cn } from "@lib/utils"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useMemo, useRef, useState } from "react"
import { Link } from "react-router"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const { data: loginContext } = useLoginContext()

    // Show the separator if social login is available and user pass/email login is disabled

    const isSocialLoginEnabled = loginContext?.message?.social_login || false;
    const isUserPassLoginEnabled = !loginContext?.message?.disable_user_pass_login || false;
    const isEmailLinkLoginEnabled = loginContext?.message?.login_with_email_link || false;
    const isSignupEnabled = !loginContext?.message?.disable_signup || false;

    const showSeparator = isSocialLoginEnabled && (isUserPassLoginEnabled || isEmailLinkLoginEnabled);

    const { usernameFieldType, usernameFieldLabel } = useMemo(() => {
        // If username and password login is disabled and only login with email link is enabled, it should be an email
        const loginLabel = loginContext?.message?.login_label || "Email";

        if (loginContext?.message?.disable_user_pass_login && isEmailLinkLoginEnabled) {
            return {
                usernameFieldType: "email",
                usernameFieldLabel: "Email"
            }
        }
        if (loginLabel === "Email") {
            return {
                usernameFieldType: "email",
                usernameFieldLabel: "Email"
            }
        } else {
            return {
                usernameFieldType: "text",
                usernameFieldLabel: loginLabel
            }
        }
    }, [loginContext])

    /**
     * The password field should be shown if username/password login is enabled
     * 
     * And if the password is filled in by the browser (TouchID etc) or if the user selects that they want to login using password
     * 
     */

    const [email, setEmail] = useState("")

    const [password, setPassword] = useState("")

    const passwordRef = useRef<HTMLInputElement>(null)

    const [showPasswordField, setShowPasswordField] = useState(false)

    console.log("Password", password)


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login to connect with your teammates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>

                                {isSocialLoginEnabled ? loginContext?.message?.provider_logins.map((provider) => (
                                    <Button key={provider.name} variant="outline" type="button" asChild>
                                        <a href={provider.auth_url}>
                                            <img src={provider.icon.src} alt={provider.icon.alt} style={{ width: '20px', height: '20px' }} ></img>
                                            Login with {provider.provider_name}
                                        </a>
                                    </Button>
                                )) : null}

                            </Field>
                            {showSeparator && <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                or continue with
                            </FieldSeparator>}
                            {(isEmailLinkLoginEnabled || isUserPassLoginEnabled) && <Field>
                                <FieldLabel htmlFor="email">{usernameFieldLabel}</FieldLabel>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    name="email"
                                    type={usernameFieldType}
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>}
                            {isUserPassLoginEnabled && <Field className={!showPasswordField && isEmailLinkLoginEnabled ? "h-0 overflow-hidden -my-3.5 opacity-0 transition-all duration-300" : "opacity-100 transition-all duration-300"}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    ref={passwordRef}
                                    name='password'
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setShowPasswordField(true)
                                    }}
                                />
                            </Field>
                            }
                            {(isUserPassLoginEnabled || isSignupEnabled || isEmailLinkLoginEnabled) && <Field>

                                {isUserPassLoginEnabled && (showPasswordField || !isEmailLinkLoginEnabled) && <Button type="submit">Login</Button>}
                                {isEmailLinkLoginEnabled && <Button type="button" variant={!isUserPassLoginEnabled || !showPasswordField ? "default" : "outline"}>Send Email Link</Button>}
                                {isEmailLinkLoginEnabled && (!showPasswordField) && isUserPassLoginEnabled &&
                                    <Button type='button' variant='outline' onClick={() => {
                                        setShowPasswordField(true)

                                        if (email) {
                                            passwordRef.current?.focus()
                                        }
                                    }}>
                                        Login using Password
                                    </Button>}
                                {isSignupEnabled && <FieldDescription className="text-center">
                                    Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
                                </FieldDescription>
                                }
                            </Field>}
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            {/* <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription> */}
        </div>
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

interface LoginContext {
    message: {
        login_label: string,
        login_with_email_link: boolean,
        provider_logins: SocialProvider[],
        social_login: boolean,
        two_factor_is_enabled: boolean
        disable_signup: 0 | 1,
        disable_user_pass_login: 0 | 1
    } | undefined
}

interface SocialProvider {
    name: string,
    provider_name: string,
    auth_url: string,
    redirect_to: string,
    icon: {
        alt: string,
        src: string
    },
}