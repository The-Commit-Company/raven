import { useState, useContext } from "react";
import { Box, Button, Flex, FormControl, FormLabel, IconButton, Input, InputGroup, InputRightElement, Stack, useDisclosure, chakra, FormErrorMessage } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorBanner } from "../../components/layout/AlertBanner";
import { UserContext } from "../../utils/auth/UserProvider";
import { isEmailValid } from "../../utils/validations";
import { FullPageLoader } from "../../components/layout/Loaders";
import { Text } from "@radix-ui/themes";
import { FrappeError } from "frappe-react-sdk";

type Inputs = {
    email: string;
    password: string;
};

export const Component = () => {
    const [error, setError] = useState<FrappeError | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>();
    const { isOpen, onToggle } = useDisclosure();
    const onClickReveal = () => {
        onToggle()
    }

    async function onSubmit(values: Inputs) {
        setError(null)
        return login(values.email, values.password)
            .catch((error) => { setError(error) })
    }

    return (
        <Box minH="100vh">
            <Flex justify="center" align="center" height="100vh" width="full">
                {isLoading ? <FullPageLoader /> :
                    <Box w="full" maxW="lg" mx="auto">
                        <Box w="full" maxW="lg" mx="auto">
                            <Stack spacing="8" rounded={{ md: "2xl" }} p={{ base: "4", md: "10" }} borderWidth={{ md: "1px" }} shadow={{ lg: "inner" }}>
                                <Link to="/" tabIndex={-1}>
                                    <Flex justify="center">
                                        <Text as='span' size='9' className='cal-sans'>raven</Text>
                                    </Flex>
                                </Link>

                                <chakra.form onSubmit={handleSubmit(onSubmit)}>
                                    <ErrorBanner error={error} />
                                    <Stack spacing="6">
                                        <FormControl
                                            id="email"
                                            isInvalid={!!errors?.email}
                                            isRequired
                                            isDisabled={isSubmitting}
                                        >
                                            <FormLabel htmlFor="email">Email address</FormLabel>
                                            <Input {...register("email",
                                                {
                                                    validate: (email) => isEmailValid(email) || "Please enter a valid email address.",
                                                    required: "Email is required."
                                                })}
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                placeholder="e.g. example@gmail.com"
                                                tabIndex={0} />
                                            <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl
                                            id="password"
                                            isRequired
                                            isInvalid={!!errors?.password}
                                            isDisabled={isSubmitting}
                                        >
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <InputGroup>
                                                <InputRightElement>
                                                    <IconButton
                                                        bg="transparent !important"
                                                        variant="ghost"
                                                        aria-label={isOpen ? "Mask password" : "Reveal password"}
                                                        icon={isOpen ? <EyeOff /> : <Eye />}
                                                        onClick={onClickReveal}
                                                        tabIndex={-1} />
                                                </InputRightElement>
                                                <Input
                                                    {...register("password",
                                                        {
                                                            required: "Password is required.",
                                                            minLength: { value: 6, message: "Password should be minimum 6 characters." }
                                                        })}
                                                    name="password"
                                                    type={isOpen ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    required
                                                    placeholder="***********" />
                                            </InputGroup>
                                            <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
                                        </FormControl>
                                        <Button type="submit" isLoading={isSubmitting}>
                                            Login
                                        </Button>
                                    </Stack>
                                </chakra.form>
                            </Stack>
                        </Box>
                    </Box>
                }
            </Flex>
        </Box>
    )
}

Component.displayName = "LoginPage";