import { ErrorBanner } from "@/components/layout/AlertBanner"
import { UserContext } from "@/utils/auth/UserProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { Box, Button, Flex, Text } from "@radix-ui/themes"
import { useToast } from "@/hooks/useToast"
import { Loader } from "@/components/common/Loader"

interface ArchivedChannelBoxProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers
}

export const ArchivedChannelBox = ({ channelData, channelMembers }: ArchivedChannelBoxProps) => {

    const { updateDoc, error, loading } = useFrappeUpdateDoc()
    const { toast } = useToast()

    const unArchiveChannel = async () => {
        return updateDoc('Raven Channel', channelData.name, {
            is_archived: 0
        }).then(() => {
            toast({
                title: 'Channel restored.',
                variant: 'success',
                duration: 1000,
            })
        })
    }

    const { currentUser } = useContext(UserContext)

    return (
        <Box>
            <Flex
                direction='column'
                align='center'
                className="border-2 rounded-md bg-surface border-accent-a6"
                p='4'>
                <ErrorBanner error={error} />
                <Flex justify='center' align='center' gap='4'>
                    <Text as='span'>This channel has been archived.</Text>
                    {channelMembers[currentUser].is_admin === 1 && <Button
                        size='1'
                        disabled={loading}
                        onClick={unArchiveChannel}>
                        {loading && <Loader />}
                        Un-archive Channel
                    </Button>}
                </Flex>
            </Flex>
        </Box>
    )
}