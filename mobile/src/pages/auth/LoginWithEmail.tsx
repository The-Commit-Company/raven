import {
    IonButton,
    IonInput,
    IonItem,
    IonSpinner,
} from "@ionic/react";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FrappeContext, FrappeConfig } from "frappe-react-sdk";
import { CalloutObject } from '@/components/common/SuccessCallout'

type Inputs = {
    email: string;
    password: string;
};

export type LoginInputs = {
    email: string;
    password: string;
};

type Props = {
    setError: (err: any) => void;
    setCallout: (callout: CalloutObject) => void;
    onClickLoginWithEmail: () => void;
};

export const LoginWithEmail = (props: Props) => {
    const [error, setError] = useState<Error | null>(null);
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>();
    const [loading, setLoading] = useState(false);
    const { call } = useContext(FrappeContext) as FrappeConfig;

    async function sendEmailLink(values: LoginInputs) {
        return call
            .post("frappe.www.login.send_login_link", {
                email: values.email,
            })
            .then((result) => {
                props.setCallout({
                    state: true,
                    message: "Login Link sent on Email",
                });
            })
            .catch((err) => {
                props.setError(err);
            });
    }

    return (
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
                            />
                        )}
                    />
                </IonItem>

                <IonButton
                    type="submit"
                    className="ion-margin-top"
                    expand="block"
                >
                    {loading ? (
                        <IonSpinner name="crescent" />
                    ) : (
                        "Send Login Link"
                    )}
                </IonButton>
            </form>
            <IonButton
                type="button"
                onClick={props.onClickLoginWithEmail}
                expand="block"
                fill="clear"
            >
                {loading ? <IonSpinner name="crescent" /> : "Back to Login"}
            </IonButton>
        </div>
    );
};
