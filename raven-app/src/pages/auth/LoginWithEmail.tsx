import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FrappeContext, FrappeConfig, FrappeError } from "frappe-react-sdk";
import {
    Box,
    Button,
    Flex,
    TextField,
    Link as LinkButton,
} from "@radix-ui/themes";
import { ErrorText, Label } from "@/components/common/Form";
import { Loader } from "@/components/common/Loader";
import { SuccessCallout, ErrorCallout, CalloutObject } from "@/components/common/Callouts";
import { isEmailValid } from "@/utils/validations";
import { LoginInputs } from "@/types/Auth/Login";
import { Auth } from "@/pages/auth/Auth";


export const Component = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInputs>();
    const { call } = useContext(FrappeContext) as FrappeConfig;
    const [error, setError] = useState<FrappeError | null>(null)
    const [callout, setCallout] = useState<CalloutObject | null>(null)


    async function sendEmailLink(values: LoginInputs) {
        setError(null)
        return call
            .post("frappe.www.login.send_login_link", {
                email: values.email,
            })
            .then((result) => {
                setCallout({
                    state: true,
                    message: "Login Link sent on Email",
                });
            })
            .catch((err) => {
                setError(err);
            });
    }

    return (
        <Auth>

            {error && <ErrorCallout message={error.message} />}
            {callout && <SuccessCallout message={callout.message} />}

            <Box>
                <form onSubmit={handleSubmit(sendEmailLink)}>
                    <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2">
                            <Label htmlFor="email" isRequired>
                                Email
                            </Label>
                            <TextField.Root>
                                <TextField.Input
                                    {...register("email", {
                                        validate: (email) =>
                                            isEmailValid(email) ||
                                            "Please enter a valid email address.",
                                        required: "Email is required.",
                                    })}
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="jane@example.com"
                                    tabIndex={0}
                                />
                            </TextField.Root>
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
        </Auth>
    );
};

Component.displayName = "LoginWithEmailPage";