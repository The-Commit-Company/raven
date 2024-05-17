import { ErrorBanner } from "@/components/layout/AlertBanner"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { ChannelMembers } from "@/hooks/fetchers/useFetchChannelMembers"
interface JoinChannelBoxProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    user: string
}

export const JoinChannelBox = ({ channelData, user }: JoinChannelBoxProps) => {

    const { mutate } = useSWRConfig()

    const { createDoc, error, loading } = useFrappeCreateDoc()

    const joinChannel = async () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            mutate(["channel_members", channelData?.name])
        })
    }

    return (
        <Box>
            <Flex
                direction='column'
                align='center'
                gap='3'
                className="border-2 rounded-md bg-surface border-accent-a6 animate-fadein"
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