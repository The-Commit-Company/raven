import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FrappeContext, FrappeConfig, FrappeError } from "frappe-react-sdk";
import { IonButton, IonInput, IonItem, IonRouterLink, IonSpinner, IonText } from '@ionic/react'
import { ActiveScreenProps } from "@/components/layout/AuthContainer";
import { CalloutObject, ErrorCallout, SuccessCallout } from "@/components/common/Callouts";
import { isEmailValid } from "@/utils/validations/validations";


export type SignUpInputs = {
    email: string,
    full_name: string,
    redirect_to: string
}

export const SignUp = (props: ActiveScreenProps) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpInputs>();
    const { call } = useContext(FrappeContext) as FrappeConfig;
    const [error, setError] = useState<FrappeError | null>(null)
    const [callout, setCallout] = useState<CalloutObject | null>(null)


    async function signup(values: SignUpInputs) {
        return call
            .post("frappe.core.doctype.user.user.sign_up", {
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
            .catch((err) => {
                setError(err);
            });
    }

    return (
        <div>
            {error && <ErrorCallout message={error.message} />}
            {callout && <SuccessCallout message={callout.message} />}
            <div>
                <form onSubmit={handleSubmit(signup)}>
                    <div >
                        <div >
                            <IonItem>
                                <Controller
                                    name="full_name"
                                    control={control}
                                    rules={{
                                        required: "Full Name is required."
                                    }}
                                    render={({ field }) => <IonInput
                                        type="text"
                                        onIonChange={(e) => field.onChange(e.detail.value)}
                                        required
                                        errorText={errors?.full_name?.message}
                                        placeholder="Jane Doe"
                                        className={!!errors?.full_name ? 'ion-invalid ion-touched' : ''}
                                        label='Full Name'
                                        labelPlacement='stacked'
                                    />}
                                />
                            </IonItem>
                        </div>
                        <div >
                            <IonItem>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        validate: (email) =>
                                            isEmailValid(email) ||
                                            "Please enter a valid email address.",
                                    }}
                                    render={({ field }) => <IonInput
                                        onIonChange={(e) => field.onChange(e.detail.value)}
                                        required
                                        placeholder='jane@example.com'
                                        className={!!errors?.email ? 'ion-invalid ion-touched' : ''}
                                        label='Email'
                                        errorText={errors?.email?.message}
                                        inputMode='email'
                                        labelPlacement='stacked'
                                    />}
                                />
                            </IonItem>
                        </div>

                        <div>
                            <IonButton type="submit"
                                disabled={isSubmitting}
                                expand="block"
                                className="ion-margin-top"
                            >
                                {isSubmitting ? <IonSpinner name="crescent" /> : "Sign Up"}
                            </IonButton>
                        </div>
                        <div className="mt-4 flex justify-center items-center">
                            <IonText className='flex self-center' color="gray">Have an Account?</IonText>
                            <IonRouterLink
                                onClick={() => props.setActiveScreen({ login: true, loginWithEmail: false, signup: false })}
                                className='cursor-pointer ml-1'
                            >
                                Login
                            </IonRouterLink>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}