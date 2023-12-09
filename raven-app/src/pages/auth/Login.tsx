import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { BiShow, BiHide } from "react-icons/bi";
import { Link } from "react-router-dom";
import { ErrorBanner } from "../../components/layout/AlertBanner";
import { UserContext } from "../../utils/auth/UserProvider";
import { isEmailValid } from "../../utils/validations";
import { FullPageLoader } from "../../components/layout/Loaders";
import { Box, Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { FrappeError } from "frappe-react-sdk";
import { Loader } from "@/components/common/Loader";
import { ErrorText, Label } from "@/components/common/Form";

type Inputs = {
    email: string;
    password: string;
};

export const Component = () => {
    const [error, setError] = useState<FrappeError | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>()
    const [isOpen, setIsOpen] = useState(false)

    const onClickReveal = () => {
        setIsOpen(!isOpen)
    }

    async function onSubmit(values: Inputs) {
        setError(null)
        return login(values.email, values.password)
            .catch((error) => { setError(error) })
    }

    return (
        <Box className={'min-h-screen'}>
            <Flex justify='center' align='center' className={'h-screen w-full'}>
                {isLoading ? <FullPageLoader /> :
                    <Box className={'w-full max-w-xl'}>
                        <Flex direction='column' gap='6' className={'w-full bg-white rounded-lg shadow dark:border dark:bg-gray-900 dark:border-gray-700 p-8'}>

                            <Link to="/" tabIndex={-1}>
                                <Flex justify="center">
                                    <Text as='span' size='9' className='cal-sans'>raven</Text>
                                </Flex>
                            </Link>

                            <ErrorBanner error={error} />

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Flex direction='column' gap='6'>
                                    <Flex direction='column' gap='4'>

                                        <Flex direction='column' gap='2'>
                                            <Label htmlFor='email' isRequired>Email address</Label>
                                            <TextField.Root>
                                                <TextField.Input {...register("email",
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
                                            </TextField.Root>
                                            {errors?.email && <ErrorText>{errors?.email?.message}</ErrorText>}
                                        </Flex>

                                        <Flex direction='column' gap='2'>
                                            <Label htmlFor='password' isRequired>Password</Label>
                                            <TextField.Root>
                                                <TextField.Input
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
                                                <TextField.Slot>
                                                    <IconButton
                                                        type='button'
                                                        size='1'
                                                        variant='ghost'
                                                        aria-label={isOpen ? "Mask password" : "Reveal password"}
                                                        onClick={onClickReveal}
                                                        tabIndex={-1}>
                                                        {isOpen ? <BiHide /> : <BiShow />}
                                                    </IconButton>
                                                </TextField.Slot>
                                            </TextField.Root>
                                            {errors?.password && <ErrorText>{errors.password?.message}</ErrorText>}
                                        </Flex>
                                    </Flex>

                                    <Button type='submit' disabled={isSubmitting}>
                                        {isSubmitting ? <Loader /> : 'Login'}
                                    </Button>
                                </Flex>
                            </form>
                        </Flex>
                    </Box>
                }
            </Flex>
        </Box>
    )
}

Component.displayName = "LoginPage";