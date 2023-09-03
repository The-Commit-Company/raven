import { ErrorBanner } from "@/components/layout/AlertBanner"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Text, Box, HStack, Stack, Center, ButtonGroup, Button, useToast, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { BiHash } from "react-icons/bi"
import { ViewChannelDetailsModal } from "../../channels/ViewChannelDetailsModal"
import { useContext } from "react"
import { ActiveUsersContext } from "@/utils/users/ActiveUsersProvider"
import { ChannelMembers } from "@/pages/ChatSpace"

interface JoinChannelBoxProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void,
    user: string
}

export const JoinChannelBox = ({ channelData, channelMembers, updateMembers, user }: JoinChannelBoxProps) => {

    const { colorMode } = useColorMode()

    const { createDoc, error, loading } = useFrappeCreateDoc()
    const toast = useToast()

    const joinChannel = () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            updateMembers()
        }).catch((e) => {
            toast({
                title: 'Error: could not join channel.',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true,
                description: `${e.message}`
            })
        })
    }

    const { isOpen, onOpen, onClose } = useDisclosure()
    const activeUsers = useContext(ActiveUsersContext)

    return (
        <Box>
            <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                <ErrorBanner error={error} />
                <HStack justify='center' align='center' pb={4}><BiHash />
                    <Text>{channelData?.channel_name}</Text>
                </HStack>
                <Center>
                    <ButtonGroup>
                        <Button colorScheme='blue' variant='outline' size='sm' onClick={onOpen}>Details</Button>
                        <Button colorScheme='blue' variant='solid' size='sm' onClick={joinChannel} isLoading={loading}>Join Channel</Button>
                    </ButtonGroup>
                </Center>
            </Stack>
            <ViewChannelDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers}
                activeUsers={activeUsers} />
        </Box>
    )
}