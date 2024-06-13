import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FrappeError, useFrappePostCall } from "frappe-react-sdk";
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
import { ForgotPasswordInput } from "@/types/Auth/Login";
import AuthContainer from "@/components/layout/AuthContainer";


export const Component = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>();
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
            }).catch((err) => {
                setCallout(null)
            })
    }

    // TO-DO: To be removed once ErrorBanner/ ErrorCallout is fixed.
    const generateErrorMessage = (error: FrappeError) => {
        if (error.exc_type === "ValidationError") return 'Too many requests. Please try after some time.'
        return 'User does not exist. Please Sign Up.'
    }

    return (
        <AuthContainer>

            {error && <ErrorCallout message={generateErrorMessage(error)} />}
            {callout && <SuccessCallout message={callout.message} />}

            <Box>
                <form onSubmit={handleSubmit(resetPassword)}>
                    <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2">
                            <Label htmlFor="user" isRequired>
                                Email
                            </Label>
                            <TextField.Root {...register("user", {
                                validate: (user) =>
                                    isEmailValid(user) ||
                                    "Please enter a valid email address.",
                                required: "Email is required.",
                            })}
                                name="user"
                                type="email"
                                placeholder="jane@example.com"
                                tabIndex={0}
                                autoFocus />
                            {errors?.user && (
                                <ErrorText>{errors?.user?.message}</ErrorText>
                            )}
                        </Flex>
                        <Flex direction="column" gap="2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader /> : "Reset Password"}
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

Component.displayName = "ForgotPassword";