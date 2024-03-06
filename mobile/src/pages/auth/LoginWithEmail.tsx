import { useState } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { IonButton, IonInput, IonItem, IonRouterLink, IonSpinner } from '@ionic/react'
import { SuccessCallout, CalloutObject, ErrorCallout } from '@/components/common/Callouts'
import { Controller, useForm } from 'react-hook-form'
import { LoginInputs } from "@/types/Auth/Login";
import { ActiveScreenProps } from "@/components/layout/AuthContainer";


export const LoginWithEmail = (props: ActiveScreenProps) => {
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
                <div className="flex justify-center">
                    <IonRouterLink
                        onClick={() => props.setActiveScreen({ login: true, loginWithEmail: false, signup: false })}

                        className='cursor-pointer ml-1'
                    >
                        Back to Login
                    </IonRouterLink>
                </div>
            </div>
        </>
    );
};