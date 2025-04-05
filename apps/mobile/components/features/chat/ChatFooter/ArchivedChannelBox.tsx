import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner-native"
import { Text } from "@components/nativewindui/Text"
import { View } from "react-native"
import { Button } from "@components/nativewindui/Button"
import ErrorBanner from "@components/common/ErrorBanner"

interface ArchivedChannelBoxProps {
    channelID: string,
    isMemberAdmin?: 0 | 1
}

export const ArchivedChannelBox = ({ channelID, isMemberAdmin }: ArchivedChannelBoxProps) => {
    return (
        <View className="flex-col gap-2 items-center border-t border-l border-r border-border rounded-2xl px-4 py-4">
            <Text className="text-sm text-muted-foreground">This channel has been archived.</Text>
            {isMemberAdmin === 1 ? <UnArchiveButton channelID={channelID} /> : null}
        </View>
    )
}

const UnArchiveButton = ({ channelID }: { channelID: string }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc()
    const { mutate } = useSWRConfig()

    const unArchiveChannel = async () => {
        return updateDoc('Raven Channel', channelID, {
            is_archived: 0
        }).then(() => {
            toast.success('Channel restored.')
            mutate("channel_list")
        }).catch(err => {
            toast.error(err.message)
        })
    }

    if (error) {
        return <ErrorBanner error={error} />
    }

    return (
        <Button
            onPress={unArchiveChannel}
            size='md'
            variant="tonal"
            className="w-full rounded-full"
            disabled={loading}
        >
            {loading ? <Text className="gap-1 text-center w-full font-semibold text-base">Restoring</Text> : <Text className="gap-1 text-center w-full font-semibold text-base">Restore Channel</Text>}
        </Button>
    )
}