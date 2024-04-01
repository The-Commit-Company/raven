import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { ActiveScreenProps } from "@/components/layout/AuthContainer";
import { CalloutObject, ErrorCallout, SuccessCallout } from "@/components/common/Callouts";
import { isEmailValid } from "@/utils/validations/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/types/Auth/Login";
import { EmailLoginProvider, OAuthProvider, OAuthProviderInterface, SocialSeparator } from "@/components/auth/SocialProviders";
import { Button, Heading, Link, Text } from "@radix-ui/themes";


export type SignUpInputs = {
    email: string,
    full_name: string,
    redirect_to: string
}

export const SignUp = (props: ActiveScreenProps) => {

    const form = useForm<SignUpInputs>({
        defaultValues: {
            email: "",
            full_name: "",
            redirect_to: ""
        }
    });
    const [callout, setCallout] = useState<CalloutObject | null>(null)

    // GET call for Signup Context[same as Login Context] (settings for social logins, email link etc)
    const { data: authContext, mutate } = useFrappeGetCall<AuthContext>('raven.api.login.get_context', {
        "redirect-to": "/raven"
    }, 'raven.api.login.get_context', {
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })

    // TO-DO: Will be changed if required.
    // POST Call to perform User sign-up
    const { call, error } = useFrappePostCall('frappe.core.doctype.user.user.sign_up')


    async function signup(values: SignUpInputs) {
        return call({
            email: values.email,
            full_name: values.full_name,
            redirect_to: "/raven"
        })
            .then((result) => {
                setCallout({
                    state: true,
                    message: result?.message[0] ? result?.message[1] : result?.message[1] + ". Please Try Login.",
                });
            })
    }

    return (
        <>
            <div className="flex flex-col gap-y-6">
                <Heading size='5' as='h2' weight='medium' className="not-cal">Create an account</Heading>
                {error && <ErrorCallout message={error.message} />}
                {callout && <SuccessCallout message={callout.message} />}
                <div className='flex flex-col gap-y-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(signup)}>
                            <div className="flex flex-col gap-y-6">
                                <div className='flex flex-col gap-2'>
                                    <FormField
                                        control={form.control}
                                        name="full_name"
                                        rules={{
                                            required: "Full Name is required",
                                        }}
                                        render={({ field, formState }) => (
                                            <FormItem>
                                                <FormLabel>Full Name <span className='text-rose-600'>*</span></FormLabel>
                                                <FormControl>
                                                    {/* Type=email as email is allowed */}
                                                    <Input type="text" placeholder='Jane Doe' {...field} />
                                                </FormControl>
                                                {formState.errors.full_name && <FormMessage>{formState.errors.full_name.message}</FormMessage>}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        rules={{
                                            required: "Email is required",
                                            validate: (email) =>
                                                isEmailValid(email) || "Please enter a valid email address."
                                        }}
                                        render={({ field, formState }) => (
                                            <FormItem>
                                                <FormLabel>Email <span className='text-rose-600'>*</span></FormLabel>
                                                <FormControl>
                                                    {/* Type=email as email is allowed */}
                                                    <Input type="email" placeholder='jane@example.com' {...field} />
                                                </FormControl>
                                                {formState.errors.email && <FormMessage>{formState.errors.email.message}</FormMessage>}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size='3'
                                    mt='2'
                                    loading={form.formState.isSubmitting}
                                >
                                    Sign Up
                                </Button>

                            </div>
                        </form>
                    </Form>

                    {/* Show Separator only when either Email Link or Social Logins are enabled */}
                    {
                        authContext?.message?.login_with_email_link || authContext?.message?.social_login ?
                            <SocialSeparator />
                            : null
                    }
                    {/* Map all social oauth providers */}
                    <div className='flex flex-col gap-2'>
                        {
                            authContext?.message?.social_login ? authContext?.message?.provider_logins.map((soc: OAuthProviderInterface, i: number) => {
                                return (
                                    <OAuthProvider key={i} soc={soc} />
                                )
                            }) : null
                        }

                        <div className='flex flex-col gap-2'>
                            {
                                authContext?.message?.login_with_email_link ?
                                    <EmailLoginProvider setActiveScreen={props.setActiveScreen} isSubmitting={form.formState.isSubmitting} />
                                    : null
                            }
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <Text as='span' size='2' className='font-medium leading-normal'>Already have an account?&nbsp;</Text>
                    <Link
                        underline='always'
                        size='2'
                        href='#'
                        onClick={() => props.setActiveScreen({ login: true, loginWithEmail: false, signup: false })}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </>
    )
}