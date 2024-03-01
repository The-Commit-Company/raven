import { PropsWithChildren, useContext } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes';
import { FullPageLoader } from "./Loaders";
import { Link } from 'react-router-dom';
import { UserContext } from '@/utils/auth/UserProvider';


const AuthContainer = ({ children, ...props }: PropsWithChildren) => {
    const { isLoading } = useContext(UserContext)

    return (
        <Box className={'min-h-screen'}>
            <Flex justify='center' align='center' className={'h-screen w-full'}>
                {
                    isLoading ? <FullPageLoader /> :
                        <Box className={'w-full max-w-lg'}>
                            <Flex direction='column' gap='6' className={'w-full bg-white rounded-lg shadow dark:border dark:bg-gray-900 dark:border-gray-700 p-8'}>

                                <Link to="/" tabIndex={-1}>
                                    <Flex justify="center">
                                        <Text as='span' size='9' className='cal-sans'>raven</Text>
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