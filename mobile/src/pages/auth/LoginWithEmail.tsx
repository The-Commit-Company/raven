import { useState } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { IonButton, IonInput, IonItem, IonSpinner } from '@ionic/react'
import { SuccessCallout, CalloutObject, ErrorCallout } from '@/components/common/Callouts'
import { Controller, useForm } from 'react-hook-form'
import { LoginInputs } from "@/types/Auth/Login";

export type LoginWithEmailProps = {
    setIsLoginWithEmailScreen: (state: boolean)=>void
}

export const LoginWithEmail = (props: LoginWithEmailProps) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInputs>();
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

            <div>
                <form onSubmit={handleSubmit(sendEmailLink)}>
                    <IonItem>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: "Email is required",
                            }}
                            render={({ field }) => (
                                <IonInput
                                    onIonChange={(e) =>
                                        field.onChange(e.detail.value)
                                    }
                                    required
                                    placeholder="jane@example.com"
                                    className={
                                        !!errors?.email
                                            ? "ion-invalid ion-touched"
                                            : ""
                                    }
                                    label="Email"
                                    errorText={errors?.email?.message}
                                    inputMode="email"
                                    labelPlacement="stacked"
                                    autoFocus
                                />
                            )}
                        />
                    </IonItem>

                    <IonButton
                        type="submit"
                        className="ion-margin-top"
                        expand="block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <IonSpinner name="crescent" />
                        ) : (
                            "Send Login Link"
                        )}
                    </IonButton>
                </form>
                <IonButton
                    type="button"
                    onClick={()=>props.setIsLoginWithEmailScreen(false)}
                    expand="block"
                    fill="clear"
                >
                    Back to Login
                </IonButton>
            </div>
            </>
    );
};