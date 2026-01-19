import { ChannelListContext, ChannelListContextType } from '@raven/lib/providers/ChannelListProvider'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { FrappeDoc, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useContext } from 'react'
import { Alert, Pressable } from 'react-native'
import { toast } from 'sonner-native'
import { Text } from '@components/nativewindui/Text'
import ArchiveIcon from "@assets/icons/ArchiveIcon.svg";
import { useColorScheme } from '@hooks/useColorScheme'
import { useRouteToHome } from '@hooks/useRouting'
import { __ } from '@lib/i18n';
const ArchiveChannel = ({ channel }: { channel: FrappeDoc<ChannelListItem> | undefined }) => {
const { updateDoc, loading, error } = useFrappeUpdateDoc()
    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { colors } = useColorScheme()

    const goToHome = useRouteToHome()

    const onArchiveChannel = () => {
        updateDoc('Raven Channel', channel?.name ?? '', {
            is_archived: 1
        }).then(() => {
            toast.success(__("Channel archived"))
            goToHome()
            mutate()
        }).catch(() => {
            toast.error(__("Could not archive channel"), {
                description: error?.httpStatusText
            })
        })
    };

    const onArchiveChannelPressed = () => {
        Alert.alert(__("Archive channel?"), __("Are you sure you want to archive {{channelName}} channel?", { channelName: channel?.channel_name }), [
            { text: __("Cancel"), style: 'cancel' },
            { text: __("Archive"), style: 'destructive', onPress: onArchiveChannel },
        ])
    }

    return (
        <Pressable
            onPress={onArchiveChannelPressed}
            className='flex flex-row items-center py-3 px-4 rounded-xl gap-3 bg-background dark:bg-card active:bg-card-background/50 dark:active:bg-card/80'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ArchiveIcon height={18} width={18} fill={colors.icon} />
            <Text className="text-base">{loading ? __("Archiving...") : __("Archive Channel")}</Text>
        </Pressable>
    )
}

export default ArchiveChannel