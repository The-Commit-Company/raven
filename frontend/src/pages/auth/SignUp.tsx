import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { FrappeContext, FrappeConfig, FrappeError } from "frappe-react-sdk";
import { Link } from "react-router-dom";
import {
    Box,
    Button,
    Flex,
    TextField,
    Text,
    Link as LinkButton,
} from "@radix-ui/themes";
import { ErrorText, Label } from "@/components/common/Form";
import { Loader } from "@/components/common/Loader";
import { isEmailValid } from "@/utils/validations";
import AuthContainer from '@/components/layout/AuthContainer';
import { CalloutObject } from "@/components/common/Callouts/CustomCallout";
import { SuccessCallout } from "@/components/common/Callouts/SuccessCallout";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";
import { useTheme } from "@/ThemeProvider";
import { OtherLoginMethods } from "./Login";

export type SignUpInputs = {
    email: string,
    full_name: string,
    redirect_to: string
}

export const Component = () => {

    const { appearance } = useTheme()

    const {
        register,
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
        <AuthContainer>
            {error && <ErrorBanner error={error} />}
            {callout && <SuccessCallout message={callout.message} />}
            <Box>
                <form onSubmit={handleSubmit(signup)}>
                    <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2">
                            <Label htmlFor="full_name" isRequired size='3'>
                                Full Name
                            </Label>
                            <TextField.Root
                                {...register("full_name", {
                                    required: "Full Name is required.",
                                })}
                                name="full_name"
                                type="text"
                                required
                                size='3'
                                color="gray"
                                placeholder="Jane Doe"
                                variant={appearance === 'dark' ? "soft" : undefined}
                                tabIndex={0}
                            />
                            {errors?.email && (
                                <ErrorText>{errors?.email?.message}</ErrorText>
                            )}
                        </Flex>

                        <Flex direction="column" gap="2">
                            <Label htmlFor="email" isRequired size='3'>
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
                                size='3'
                                color="gray"
                                variant={appearance === 'dark' ? "soft" : undefined}
                                required
                                placeholder="jane@example.com"
                                tabIndex={0}
                            />
                            {errors?.email && (
                                <ErrorText>{errors?.email?.message}</ErrorText>
                            )}
                        </Flex>

                        <Flex direction="column" gap="2" my='2'>
                            <Button type="submit" disabled={isSubmitting}
                                size='3'
                                className="not-cal font-medium">
                                {isSubmitting ? <Loader className="text-white" /> : "Sign Up"}
                            </Button>
                        </Flex>

                        <OtherLoginMethods isSubmitting={isSubmitting} />

                        <Flex gap="1" justify="center">
                            <Text size="2" color="gray">Already have an account?</Text>
                            <LinkButton
                                size="2"
                                asChild
                            >
                                <Link to="/login">
                                    <Text>Login</Text>
                                </Link>
                            </LinkButton>
                        </Flex>
                    </Flex>
                </form>
            </Box>
        </AuthContainer>
    )
}


Component.displayName = "SignUpPage";