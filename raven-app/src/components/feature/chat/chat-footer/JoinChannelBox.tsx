import { ErrorBanner } from "@/components/layout/AlertBanner"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { ChannelMembers, ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
interface JoinChannelBoxProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    user: string
}

export const JoinChannelBox = ({ channelData, channelMembers, user }: JoinChannelBoxProps) => {

    const { mutate: updateMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    const { createDoc, error, loading } = useFrappeCreateDoc()

    const joinChannel = async () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            updateMembers()
        })
    }

    return (
        <Box>
            <Flex
                direction='column'
                align='center'
                gap='3'
                className="border-2 rounded-md bg-surface border-accent-a6"
                p='4'>
                <ErrorBanner error={error} />
                <Text as='span'>You are not a member of this channel.</Text>
                <Button
                    onClick={joinChannel}
                    size='3'
                    disabled={loading}>
                    {loading && <Loader />}
                    {loading ? 'Joining' : <span className="inline-flex gap-1">Join
                        <span className="italic">
                            "{channelData.channel_name}"
                        </span>
                    </span>}
                </Button>
            </Flex>
        </Box>
    )
}