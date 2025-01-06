import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import {
    Box,
    Button,
    Flex,
    TextField,
    Link as LinkButton,
} from "@radix-ui/themes";
import { ErrorText, Label } from "@/components/common/Form";
import { Loader } from "@/components/common/Loader";
import { CalloutObject } from "@/components/common/Callouts/CustomCallout";
import { ErrorCallout } from "@/components/common/Callouts/ErrorCallouts";
import { SuccessCallout } from "@/components/common/Callouts/SuccessCallout";
import { isEmailValid } from "@/utils/validations";
import { LoginInputs } from "@/types/Auth/Login";
import AuthContainer from "@/components/layout/AuthContainer";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";


export const Component = () => {
    const {
        register,
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
            }).catch((err) => {
                setCallout(null)
            })
    }

    return (
        <AuthContainer>

            {error && <ErrorBanner error={error} />}
            {callout && <SuccessCallout message={callout.message} />}

            <Box>
                <form onSubmit={handleSubmit(sendEmailLink)}>
                    <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2">
                            <Label htmlFor="email" isRequired>
                                Email
                            </Label>
                            <TextField.Root
                                {...register("email", {
                                    validate: (email) =>
                                        isEmailValid(email) ||
                                        "Please enter a valid email address.",
                                    required: "Email is required.",
                                })}
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                tabIndex={0} />
                            {errors?.email && (
                                <ErrorText>{errors?.email?.message}</ErrorText>
                            )}
                        </Flex>
                        <Flex direction="column" gap="2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader /> : "Send Login Link"}
                            </Button>
                        </Flex>
                        <Flex direction="column" gap="1" align="center">
                            <LinkButton
                                size="2"
                                asChild
                            >
                                <Link to='/login'>
                                    Back to Login
                                </Link>
                            </LinkButton>
                        </Flex>
                    </Flex>
                </form>
            </Box>
        </AuthContainer>
    );
};

Component.displayName = "LoginWithEmailPage";