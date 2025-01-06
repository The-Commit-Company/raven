import { PropsWithChildren, useContext } from 'react'
import { Box, Flex, Heading } from '@radix-ui/themes';
import { FullPageLoader } from "./Loaders/FullPageLoader";
import { Link } from 'react-router-dom';
import { UserContext } from '@/utils/auth/UserProvider';


const AuthContainer = ({ children, ...props }: PropsWithChildren) => {
    const { isLoading } = useContext(UserContext)

    return (
        <Box className={'min-h-screen'}>
            <Flex justify='center' align='center' className={'min-h-screen w-full dark:bg-[#191919]'}>
                {
                    isLoading ? <FullPageLoader /> :
                        <Box className={'w-full max-w-md p-8'}>
                            <Flex direction='column' gap='6' className={'w-full'}>

                                <Link to="/" tabIndex={-1}>
                                    <Flex>
                                        <Heading size='9' className='cal-sans leading-normal tracking-normal w-fit'>raven</Heading>
                                    </Flex>
                                </Link>
                                {children}
                            </Flex>
                        </Box>
                }
            </Flex>
        </Box>
    )

}

export default AuthContainer;