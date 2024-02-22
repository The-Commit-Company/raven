import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { BiShow, BiHide } from "react-icons/bi";
import { Link } from "react-router-dom";
import { UserContext } from "../../utils/auth/UserProvider";
import { FullPageLoader } from "../../components/layout/Loaders";
import { Box, Button, Flex, IconButton, Text, TextField, Link as LinkButton } from "@radix-ui/themes";
import { FrappeContext, FrappeError, FrappeConfig } from "frappe-react-sdk";
import { Loader } from "@/components/common/Loader";
import { ErrorText, Label } from "@/components/common/Form";
import { ErrorCallout } from "@/components/layout/AlertBanner/ErrorBanner";
import { isEmailValid } from "@/utils/validations";
import { useToast } from "@/hooks/useToast";

type Inputs = {
    email: string;
    password: string;
};

export const Component = () => {
    const [error, setError] = useState<FrappeError | null>(null)
    const { login, isLoading } = useContext(UserContext)
    const { register, handleSubmit, formState: { errors, isSubmitting }, getValues, setValue } = useForm<Inputs>()
    const [isPasswordOpen, setIsPasswordOpen] = useState(false)
    const [isLoginWithEmailLink, setIsLoginWithEmailLink] = useState(false)
    const [isLoginWithEmailSubmitting, setIsLoginWithEmailSubmitting] = useState(false)
    const { call } = useContext(FrappeContext) as FrappeConfig
    const { toast } = useToast()

    const onClickReveal = () => {
        setIsPasswordOpen(!isPasswordOpen)
    }

    const onClickLoginWithEmail = () =>{
        // If input is username then reset the value, else persist with email upon switching
        if(isEmailValid(getValues().email) === false)
            setValue("email","")
        setIsLoginWithEmailLink(!isLoginWithEmailLink)
        
    }

    const sendEmailLink = (email: string) =>{
        setIsLoginWithEmailSubmitting(true)
        call.post('frappe.www.login.send_login_link',{
            email
        }).then((result) => {
            toast({
                title:'Login Link sent on Email',
                variant:'accent',
            })
        }).catch((err)=>{
            setError(err)
        })
        setIsLoginWithEmailSubmitting(false)
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

                            {error && <ErrorCallout>
                                {error.message}
                            </ErrorCallout>}
                           
                           { isLoginWithEmailLink ? 
                           <Box>
                            <Flex direction='column' gap='4'>
                                <Flex direction='column' gap='2'>
                                    <Label htmlFor='email' isRequired>Email</Label>
                                    <TextField.Root>
                                        <TextField.Input {...register("email",
                                            {
                                                validate: (email) => isEmailValid(email) || "Please enter a valid email address.",
                                                required: "Email is required."
                                            })}
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="jane@example.com"
                                            tabIndex={0} />
                                    </TextField.Root>
                                    {errors?.email && <ErrorText>{errors?.email?.message}</ErrorText>}
                                </Flex>
                                <Flex direction='column' gap='2'>
                                    <Button type='button' disabled={isLoginWithEmailSubmitting} onClick={()=>{sendEmailLink(getValues().email)}}>
                                        {isLoginWithEmailSubmitting ? <Loader /> : 'Send Login Link'}
                                    </Button>
                                </Flex>
                                <Flex direction='column' gap='2' align='center'>
                                <LinkButton onClick={onClickLoginWithEmail} size='2' >
                                    Back to Login
                                </LinkButton>
                                </Flex>
                            </Flex>
                           </Box>:
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