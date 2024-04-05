import { useState } from "react";
import { FrappeError, useFrappePostCall } from "frappe-react-sdk";
import { SuccessCallout, CalloutObject, ErrorCallout } from '@/components/common/Callouts'
import { useForm } from 'react-hook-form'
import { ForgotPasswordInput } from "@/types/Auth/Login";
import { ActiveScreenProps } from "@/components/layout/AuthContainer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@radix-ui/themes";


export const ForgotPassword = (props: ActiveScreenProps) => {

    const form = useForm<ForgotPasswordInput>({
        defaultValues: {
            user: "",
        }
    });
    const [callout, setCallout] = useState<CalloutObject | null>(null)

    // POST Call to send reset password instructions on email
    const { call, error } = useFrappePostCall('frappe.core.doctype.user.user.reset_password')

    async function resetPassword(values: ForgotPasswordInput) {
        return call({
            user: values.user,
        })
            .then((res) => {
                setCallout({
                    state: true,
                    message: "Password reset instructions have been sent to your email.",
                });
            })
    }

    // TO-DO: To be removed once ErrorBanner/ ErrorCallout is fixed.
    const generateErrorMessage = (error: FrappeError) =>{
        if (error.exc_type === "ValidationError") return 'Too many requests. Please try after some time.'
        return 'User does not exist. Please Sign Up.'
    }

    return (
        <>

            <div className="flex flex-col gap-y-6">
                {error && <ErrorCallout message={generateErrorMessage(error)} />}
                {callout && <SuccessCallout message={callout.message} />}
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(resetPassword)}>
                            <div className='flex flex-col gap-y-6'>
                                <div className='flex flex-col gap-2'>
                                    <FormField
                                        control={form.control}
                                        name="user"
                                        rules={{
                                            required: "Email is required",
                                        }}
                                        render={({ field, formState }) => (
                                            <FormItem>
                                                <FormLabel>Email <span className='text-rose-600'>*</span></FormLabel>
                                                <FormControl autoFocus>
                                                    {/* Type=email as email is allowed */}
                                                    <Input type="email" placeholder='jane@example.com' {...field} />
                                                </FormControl>
                                                {formState.errors.user && <FormMessage>{formState.errors.user.message}</FormMessage>}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='flex flex-col gap-y-4'>
                                    <Button
                                        type="submit"
                                        size='3'
                                        loading={form.formState.isSubmitting}
                                    >
                                        Reset Password
                                    </Button>
                                    <Button
                                        type="button"
                                        color='gray'
                                        size='3'
                                        variant='soft'
                                        className="cursor-pointer"
                                        onClick={() => props.setActiveScreen({ login: true, loginWithEmail: false, signup: false, forgotPassword: false })}
                                    >
                                        Back to Login
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
};