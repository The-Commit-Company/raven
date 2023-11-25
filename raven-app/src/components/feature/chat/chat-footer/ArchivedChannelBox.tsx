import { useTheme } from "@/ThemeProvider"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { UserContext } from "@/utils/auth/UserProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { Text, Box, HStack, Stack, useToast, Button } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { Hash } from "lucide-react"

interface ArchivedChannelBoxProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers
}

export const ArchivedChannelBox = ({ channelData, channelMembers }: ArchivedChannelBoxProps) => {

    const { appearance } = useTheme()

    const { updateDoc, error, loading } = useFrappeUpdateDoc()
    const toast = useToast()

    const unArchiveChannel = async () => {
        return updateDoc('Raven Channel', channelData.name, {
            is_archived: 0
        }).then(() => {
            toast({
                title: 'Channel un-archived.',
                status: 'success',
                duration: 3000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true,
            })
        }).catch((e) => {
            toast({
                title: 'Error: could not un-archive channel.',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true,
                description: `${e.message}`
            })
        })
    }


    const { currentUser } = useContext(UserContext)

    return (
        <Box>
            <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={appearance === "light" ? "white" : "gray.800"} p={4}>
                <ErrorBanner error={error} />
                <HStack justify='center' align='center' pb={4}>
                    <Hash />
                    <Text>{channelData.channel_name}</Text>
                </HStack>
                <HStack justify='center' align='center'>
                    <Text>This channel has been archived.</Text>
                    {channelMembers[currentUser].is_admin === 1 && <Button colorScheme='blue' variant='solid' size='xs' onClick={unArchiveChannel} isLoading={loading}>Un-archive Channel</Button>}
                </HStack>
            </Stack>
        </Box>
    )
}