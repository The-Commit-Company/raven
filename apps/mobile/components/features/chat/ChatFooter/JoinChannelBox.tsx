import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk"
import { Button } from "@components/nativewindui/Button"
import ErrorBanner from "@components/common/ErrorBanner"
import { Text } from "@components/nativewindui/Text"
import { View } from "react-native"

interface JoinChannelBoxProps {
    channelID: string,
    isThread: boolean,
    user: string,
}

export const JoinChannelBox = ({ channelID, isThread, user }: JoinChannelBoxProps) => {

    const { mutate } = useSWRConfig()

    const { createDoc, error, loading } = useFrappeCreateDoc()

    const joinChannel = async () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelID,
            user_id: user
        }).then(() => {
            mutate(["channel_members", channelID])
        })
    }

    return (
        <View className="flex-col gap-2 items-center border-t border-l border-r border-border rounded-2xl px-4 py-4">
            {error && <ErrorBanner error={error} />}
            <Text className="text-sm text-muted-foreground">You are not a member of this {isThread ? 'thread' : 'channel'}.</Text>
            <Button
                onPress={joinChannel}
                size="md"
                variant="primary"
                className="w-full rounded-lg"
                disabled={loading}
            >
                {loading ? <Text className="gap-1 text-center w-full font-semibold text-base">Joining</Text> :
                    <Text className="gap-1 text-center w-full font-semibold text-base">Join</Text>}
            </Button>
        </View>
    )
}