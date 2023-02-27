import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import { AlertBanner } from '../../components/layout/AlertBanner';
import { FullPageLoader } from '../../components/layout/Loaders';
import { UserContext } from '../auth/UserProvider'

type Props = {}

export const ChannelRedirect = (props: Props) => {

    const { logout } = useContext(UserContext);
    const { data, error } = useFrappeGetDocList<{ name: string }>('Raven Channel', {
        fields: ["name"],
        filters: [["type", "=", "Open"]],
        limit: 1
    })

    if (!data && !error) {
        return <FullPageLoader />
    }

    if (error) {
        return <AlertBanner heading='An error occurred'>There was an error while fetching channel. [HTTP {error.httpStatus} - {error.httpStatusText}]</AlertBanner>
    }
    if (data) {
        if (data.length > 0) {
            return (
                <Navigate to={`/channel/${data[0].name}`} replace />
            )
        } else {
            return <Center h='100vh' w='100vw'>
                <VStack spacing={4}>
                    <Text>There is no Open channel present. Please contact your Administrator</Text>
                    <Button colorScheme={'red'} variant="outline" onClick={logout}>Log out</Button>
                </VStack>
            </Center>
        }

    }

    return null


}