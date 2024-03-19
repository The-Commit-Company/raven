import { useState } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { IonSpinner } from '@ionic/react'
import { SuccessCallout, CalloutObject, ErrorCallout } from '@/components/common/Callouts'
import { useForm } from 'react-hook-form'
import { LoginInputs } from "@/types/Auth/Login";
import { ActiveScreenProps } from "@/components/layout/AuthContainer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isEmailValid } from "@/utils/validations/validations";
import { Button } from "@/components/ui/button";


export const LoginWithEmail = (props: ActiveScreenProps) => {

    const form = useForm<LoginInputs>({
        defaultValues:{
            email: "",
        }
    });
    const [callout, setCallout] = useState<CalloutObject | null>(null)

    // POST Call to send login link (settings for social logins, email link etc)
    const { call, error } = useFrappePostCall('frappe.www.login.send_login_link')

    async function sendEmailLink(values: LoginInputs) {
        return call({
            email: values.email,
        })
            .then((result) => {
                setCallout({
                    state: true,
                    message: "Login Link sent on Email",
                });
            })
    }

    return (
        <>
            {error && <ErrorCallout message={error.message} />}
            {callout && <SuccessCallout message={callout.message} />}

            <div className="flex flex-col gap-y-6">
                <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(sendEmailLink)}>
                    <div className='flex flex-col gap-y-6'>
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
                            variant="default"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? <IonSpinner name="crescent" /> : <span className="font-medium text-sm leading-normal">Send Login Link</span>}
                        </Button>
                        </div>
                    </form>
                </Form>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant='link'
                        className='px-0'
                        onClick={() => props.setActiveScreen({ login: true, loginWithEmail: false, signup: false })}
                    >
                        Back to Login?
                    </Button>
                </div>
            </div>
        </>
    );
};