import { IonButton, IonInput, IonSpinner, IonText } from '@ionic/react'
import { Controller, useForm } from "react-hook-form";
import { AuthResponse, FrappeError, OTPCredentials, useFrappeAuth } from "frappe-react-sdk";
import { LoginInputs, VerificationType } from "@/types/Auth/Login";
import { ErrorCallout } from '@/components/common/Callouts';
import { useState } from 'react';

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

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>()
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
            window.location.replace(`${URL}/channel`)
        }).catch((err)=>{
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

            <form onSubmit={handleSubmit(onSubmit)}>
                <div >
                    <div>
                        {
                            error && <ErrorCallout message={error.message} />
                        }
                        {
                            <IonText>
                                {loginWithTwoFAResponse?.verification?.setup ? getVerificationPrompt(loginWithTwoFAResponse?.verification)
                                    : `Verification ${VerificationMethods[loginWithTwoFAResponse?.verification?.method]} not sent. Please contact Administrator.`}
                            </IonText>
                        }
                    </div>
                    <div className='mt-2'>
                        <Controller
                            name="otp"
                            control={control}
                            rules={{
                                required: "OTP is required",
                            }}
                            render={({ field }) => (
                                <IonInput
                                    onIonChange={(e) =>
                                        field.onChange(e.detail.value)
                                    }
                                    required
                                    className={
                                        !!errors?.otp
                                            ? "ion-invalid ion-touched"
                                            : ""
                                    }
                                    errorText={errors?.otp?.message}
                                    name="otp"
                                    type="text"
                                    placeholder="Verification Code"
                                    autoFocus
                                    tabIndex={0}
                                />
                            )}
                        />
                    </div>
                    <div className='mt-2'>
                        <IonButton
                            type="submit"
                            expand="block"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <IonSpinner name="crescent" /> : "Verify"}
                        </IonButton>
                    </div>
                    <div className='mt-1'>
                        <IonButton
                            fill="clear"
                            expand="block"
                            onClick={() => setIsTwoFactorEnabled(false)}
                        >
                            Cancel
                        </IonButton>
                    </div>
                </div>
            </form>
        </div>
    )
}