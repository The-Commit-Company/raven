import { ChannelListContext, ChannelListContextType } from '@raven/lib/providers/ChannelListProvider'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { SiteContext } from 'app/[site_id]/_layout'
import { router } from 'expo-router'
import { FrappeDoc, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useContext } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { toast } from 'sonner-native'
import { Alert } from '@components/nativewindui/Alert'
import { Text } from '@components/nativewindui/Text'
import ArchiveIcon from "@assets/icons/ArchiveIcon.svg";
import { useColorScheme } from '@hooks/useColorScheme'

const ArchiveChannel = ({ channel }: { channel: FrappeDoc<ChannelListItem> | undefined }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc()
    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { colors } = useColorScheme()

    const siteContext = useContext(SiteContext)
    const siteId = siteContext?.sitename

    const onArchiveChannel = () => {
        updateDoc('Raven Channel', channel?.name ?? '', {
            is_archived: 1
        }).then(() => {
            toast.success(`You have left ${channel?.channel_name} channel`)
            router.replace(`${siteId}/home`)
            mutate()
        }).catch(() => {
            toast.error('Could not archive channel', {
                description: error?.httpStatusText
            })
        })
    };

    return (
        <Alert
            title="Archive channel?"
            message={`Are you sure you want to archive ${channel?.channel_name} channel?`}
            buttons={
                [
                    {
                        text: 'Cancel',
                    },
                    {
                        text: 'Archive',
                        style: 'default',
                        onPress: onArchiveChannel
                    },
                ]} >
            <Pressable
                style={styles.settingsContainer}
                className='rounded-xl ios:active:bg-linkColor border border-border'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <ArchiveIcon height={20} width={20} fill={colors.icon} />
                <Text className="text-base">{loading ? 'Archiving...' : 'Archive Channel'}</Text>
            </Pressable>
        </Alert>
    )
}

const styles = StyleSheet.create({
    settingsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12
    }
})

export default ArchiveChannel