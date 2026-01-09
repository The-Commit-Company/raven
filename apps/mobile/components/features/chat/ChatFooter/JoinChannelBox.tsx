import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk"
import { Button } from "@components/nativewindui/Button"
import ErrorBanner from "@components/common/ErrorBanner"
import { Text } from "@components/nativewindui/Text"
import { View } from "react-native"
import { useTranslation } from "react-i18next"

interface JoinChannelBoxProps {
    channelID: string,
    isThread: boolean,
    user: string,
}

export const JoinChannelBox = ({ channelID, isThread, user }: JoinChannelBoxProps) => {

    const { t } = useTranslation()
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
            <Text className="text-sm text-muted-foreground">{isThread ? t('channels.notThreadMember') : t('channels.notMember')}</Text>
            <Button
                onPress={joinChannel}
                size="md"
                variant="primary"
                className="w-full rounded-lg"
                disabled={loading}
            >
                {loading ? <Text className="gap-1 text-center w-full font-semibold text-base">{t('channels.joining')}</Text> :
                    <Text className="gap-1 text-center w-full font-semibold text-base">{t('channels.join')}</Text>}
            </Button>
        </View>
    )
}