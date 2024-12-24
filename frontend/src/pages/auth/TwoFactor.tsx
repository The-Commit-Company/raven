import { Box, Button, Flex, Text, TextField, Link as LinkButton } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { AuthResponse, FrappeError, OTPCredentials, useFrappeAuth } from "frappe-react-sdk";
import { LoginInputs, VerificationType } from "@/types/Auth/Login";
import { ErrorText } from "@/components/common/Form";
import { Loader } from "@/components/common/Loader";
import { useTheme } from "@/ThemeProvider";

const VerificationMethods: { [key: string]: string; } = {
    "Email": "Email",
    "SMS": "SMS",
    "OTP App": "OTP",
};

type TwoFactorProps = {
    loginWithTwoFAResponse: AuthResponse | null
    setError: (error: FrappeError | null) => void
    setIsTwoFactorEnabled: (state: boolean) => void
}

export const TwoFactor = ({ loginWithTwoFAResponse, setError, setIsTwoFactorEnabled }: TwoFactorProps) => {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>()
    const { login } = useFrappeAuth()
    const { appearance } = useTheme()

    async function onSubmit(values: LoginInputs) {
        setError(null)
        const credentials: OTPCredentials = {
            tmp_id: loginWithTwoFAResponse?.tmp_id ?? '',
            otp: values.otp ?? ''
        }
        return login(credentials).then((res) => {
            //Reload the page so that the boot info is fetched again
            const URL = import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ``
            window.location.replace(`${URL}`)
        }).catch((error) => setError(error))
    }

    const getVerificationPrompt = (verification: VerificationType): string | undefined => {
        if (verification.method === "Email" || verification.method === "SMS") {
            return verification.prompt
        } else {
            return "Enter Code displayed in OTP App."
        }
    }

    return (
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex direction='column' gap='4' width='100%'>
                    <Flex direction='column' gap='2'>
                        <Box>
                            {
                                <Text size="3" color="gray">
                                    {loginWithTwoFAResponse?.verification?.setup ? getVerificationPrompt(loginWithTwoFAResponse?.verification)
                                        : `Verification ${VerificationMethods[loginWithTwoFAResponse?.verification?.method]} not sent. Please contact Administrator.`}
                                </Text>
                            }
                        </Box>
                    </Flex>
                    <Flex direction='column' gap='4'>
                        <TextField.Root
                            {...register("otp",
                                {
                                    required: `Verification Code is required.`
                                })}
                            name="otp"
                            type="text"
                            size='3'
                            variant={appearance === 'dark' ? "soft" : undefined}
                            color="gray"
                            required
                            placeholder="Verification Code"
                            autoFocus
                            tabIndex={0} />
                        {errors?.otp && <ErrorText>{errors?.otp.message}</ErrorText>}
                    </Flex>
                    <Flex direction='column' gap='4' my='2' >
                        <Button type='submit' className="not-cal font-medium" size='3'>
                            {isSubmitting ? <Loader className="text-white" /> : 'Verify'}
                        </Button>
                    </Flex>
                    <Flex direction="column" gap="4">
                        <Button
                            className="not-cal font-medium border-0 hover:bg-transparent hover:text-gray-12"
                            variant="ghost"
                            type='button'
                            size="3"
                            color='gray'
                            onClick={() => setIsTwoFactorEnabled(false)}
                        >
                            Cancel
                        </Button>
                    </Flex>
                </Flex>
            </form>
        </Box>
    )
}