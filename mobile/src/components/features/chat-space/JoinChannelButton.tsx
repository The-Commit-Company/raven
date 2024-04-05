import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ErrorBanner } from "@/components/layout"
import { useContext } from "react"
import { UserContext } from "@/utils/auth/UserProvider"
interface JoinChannelBoxProps {
    channelData: ChannelListItem,
}

const JoinChannelButton = ({ channelData }: JoinChannelBoxProps) => {

    const { currentUser } = useContext(UserContext)
    const { mutate } = useSWRConfig()
    const { createDoc, error, loading } = useFrappeCreateDoc()

    const joinChannel = async () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: currentUser
        }).then(() => {

            mutate(`raven.api.chat.get_channel_members.${channelData.name}`)
        })
    }

    return (
        <Box>
            <Flex
                direction='column'
                align='center'
                gap='3'
                className="rounded-md bg-surface animate-fadein"
                p='4'
                pb='8'>
                <ErrorBanner error={error} />
                <Text as='span'>You are not a member of this channel.</Text>
                <Button
                    onClick={joinChannel}
                    size='3'
                    loading={loading}>
                    <span className="inline-flex gap-1">Join
                        "{channelData.channel_name}"
                    </span>
                </Button>
            </Flex>
        </Box>
    )
}

export default JoinChannelButton