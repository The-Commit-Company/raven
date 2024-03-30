import { useForm } from "react-hook-form";
import { AuthResponse, FrappeError, OTPCredentials, useFrappeAuth } from "frappe-react-sdk";
import { LoginInputs, VerificationType } from "@/types/Auth/Login";
import { ErrorCallout } from '@/components/common/Callouts';
import { useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@radix-ui/themes';

const VerificationMethods: { [key: string]: string; } = {
    "Email": "Email",
    "SMS": "SMS",
    "OTP App": "OTP",
};

type TwoFactorProps = {
    loginWithTwoFAResponse: AuthResponse | null
    setIsTwoFactorEnabled: (state: boolean) => void
}

export const TwoFactor = ({ loginWithTwoFAResponse, setIsTwoFactorEnabled }: TwoFactorProps) => {

    const form = useForm<LoginInputs>({
        defaultValues: {
            otp: "",
            tmp_id: ""
        }
    })
    const { login } = useFrappeAuth()
    const [error, setError] = useState<FrappeError | null>(null)


    async function onSubmit(values: LoginInputs) {
        const credentials: OTPCredentials = {
            tmp_id: loginWithTwoFAResponse?.tmp_id ?? '',
            otp: values.otp ?? ''
        }
        return login(credentials).then((res) => {
            //Reload the page so that the boot info is fetched again
            const URL = import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ``
            window.location.replace(`${URL}/channels`)
        }).catch((err) => {
            setError(err);
        })
    }

    const getVerificationPrompt = (verification: VerificationType): string | undefined => {
        if (verification.method === "Email" || verification.method === "SMS") {
            return verification.prompt
        } else {
            return "Enter Code displayed in OTP App."
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-y-8">
                        {
                            error && <ErrorCallout message={error.message} />
                        }
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem className='flex flex-col gap-y-8'>
                                    <div>
                                        <FormLabel size='5'>One-Time Password</FormLabel>
                                        <FormDescription size='2' className='pt-2'>
                                            {loginWithTwoFAResponse?.verification?.setup ? getVerificationPrompt(loginWithTwoFAResponse?.verification)
                                                : `Verification ${VerificationMethods[loginWithTwoFAResponse?.verification?.method]} not sent. Please contact Administrator.`}
                                        </FormDescription>
                                    </div>
                                    <div>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field} >
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                </InputOTPGroup>
                                                <InputOTPSeparator />
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                size='3'
                                loading={form.formState.isSubmitting}
                                // keep the verify button disabled until otp length is equal to 6
                                disabled={form.formState.isSubmitting || form.watch("otp")?.length !== 6}
                            >
                                Verify
                            </Button>

                            <Button
                                type="button"
                                color='gray'
                                size='3'
                                variant='soft'
                                onClick={() => setIsTwoFactorEnabled(false)}
                            >
                                Go back
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}