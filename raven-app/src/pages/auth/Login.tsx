import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { BiShow, BiHide } from "react-icons/bi";
import { Link } from "react-router-dom";
import { UserContext } from "../../utils/auth/UserProvider";
import { FullPageLoader } from "../../components/layout/Loaders";
import { Box, Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { FrappeError } from "frappe-react-sdk";
import { Loader } from "@/components/common/Loader";
import { ErrorText, Label } from "@/components/common/Form";
import { SuccessCallout, ErrorCallout, CalloutObject } from "@/components/common/Callouts";
import { LoginWithEmail } from "@/pages/auth/LoginWithEmail";
import { LoginInputs } from "@/types/Auth/Login";

export const Component = () => {
    const [error, setError] = useState<FrappeError | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>()
    const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false)
    const [callout, setCallout] = useState<CalloutObject | null>(null)
    const [isLoginWithEmailLink, setIsLoginWithEmailLink] = useState<boolean>(false)

    const onClickReveal = () => {
        setIsPasswordOpen(!isPasswordOpen)
    }

    // to show/unshow login with email section
    const onClickLoginWithEmail = () =>{
        setError(null)
        setCallout(null)
        setIsLoginWithEmailLink(!isLoginWithEmailLink)   
    }

    async function onSubmit(values: LoginInputs) {
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

                            { error && <ErrorCallout message={error.message}/> }

                            { callout && <SuccessCallout message={callout.message}/> }  
                           
                           { isLoginWithEmailLink ? 
                           <LoginWithEmail 
                                setCallout={setCallout}
                                onClickLoginWithEmail={onClickLoginWithEmail} 
                                setError={setError}
                            />:
                           <Box>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Flex direction='column' gap='6'>
                                    <Flex direction='column' gap='4'>

                                        <Flex direction='column' gap='2'>
                                            <Label htmlFor='email' isRequired>Email / Username</Label>
                                            <TextField.Root>
                                                <TextField.Input {...register("email",
                                                    {
                                                        required: "Email or Username is required."
                                                    })}
                                                    name="email"
                                                    type="text"
                                                    required
                                                    placeholder="jane@example.com"
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
                                                    type={isPasswordOpen ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    required
                                                    placeholder="***********" />
                                                <TextField.Slot>
                                                    <IconButton
                                                        type='button'
                                                        size='1'
                                                        variant='ghost'
                                                        aria-label={isPasswordOpen ? "Mask password" : "Reveal password"}
                                                        onClick={onClickReveal}
                                                        tabIndex={-1}>
                                                        {isPasswordOpen ? <BiHide /> : <BiShow />}
                                                    </IconButton>
                                                </TextField.Slot>
                                            </TextField.Root>
                                            {errors?.password && <ErrorText>{errors.password?.message}</ErrorText>}
                                        </Flex>

                                        <Flex direction='column' gap='2'>
                                        <Button type='submit' disabled={isSubmitting}>
                                            {isSubmitting ? <Loader /> : 'Login'}
                                        </Button>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </form>
                            <Flex justify='center' className="mt-2 mb-2">
                                <Text size="2">
                                    or
                                </Text>
                            </Flex>
                            <Flex direction='column'>
                                <Button type="button" onClick={onClickLoginWithEmail} disabled={isSubmitting} variant="outline">
                                    Login with Email Link
                                </Button>
                            </Flex>
                            </Box>
                            }
                            
                        </Flex>
                    </Box>
                }
            </Flex>
        </Box>
    )
}

Component.displayName = "LoginPage";