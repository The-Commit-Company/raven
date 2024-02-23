import { useContext } from "react";
import { useForm } from "react-hook-form";
import { FrappeContext, FrappeConfig } from "frappe-react-sdk";
import {
    Box,
    Button,
    Flex,
    TextField,
    Link as LinkButton,
} from "@radix-ui/themes";
import { ErrorText, Label } from "@/components/common/Form";
import { Loader } from "@/components/common/Loader";
import { isEmailValid } from "@/utils/validations";
import { LoginInputs } from "@/types/Auth/Login";
import { CalloutObject } from "@/components/common/Callouts/CustomCallout";


type Props = {
    setError: (err: any) => void;
    setCallout: (callout: CalloutObject) => void;
    onClickLoginWithEmail: () => void;
};

export const LoginWithEmail = (props: Props) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInputs>();
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
                    <Flex direction="column" gap="2" align="center">
                        <LinkButton
                            onClick={props.onClickLoginWithEmail}
                            size="2"
                        >
                            Back to Login
                        </LinkButton>
                    </Flex>
                </Flex>
            </form>
        </Box>
    );
};
