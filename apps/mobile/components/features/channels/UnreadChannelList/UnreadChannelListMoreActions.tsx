import { UnreadCountData } from "@raven/lib/hooks/useGetChannelUnreadCounts"
import ThreeDotsVerticalIcon from '@assets/icons/ThreeDotsVerticalIcon.svg'
import { useColorScheme } from "@hooks/useColorScheme"
import { Button } from '@components/nativewindui/Button'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'

const UnreadChannelListMoreActions = ({ channelIDs }: { channelIDs: string[] }) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const { mutate } = useSWRConfig()
    const { call } = useFrappePostCall('raven.api.raven_channel.mark_all_messages_as_read')

    const handleMarkAllAsRead = () => {
        call({
            channel_ids: channelIDs
        }).then(() => {
            toast.success(t('channels.allMarkedAsRead'))
            mutate('unread_channel_count', (d: { message: UnreadCountData } | undefined) => {
                if (d?.message) {
                    // Update all channels with unread count as 0
                    const newChannels = d.message.map(c => {
                        if (c.name && channelIDs.includes(c.name)) {
                            return {
                                ...c,
                                unread_count: 0
                            }
                        }
                        return c
                    })

                    return {
                        message: newChannels
                    }
                }
            }, {
                revalidate: false
            })
        }).catch(() => {
            toast.error(t('channels.markAsReadFailed'))
        })
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="plain" size="none" className='active:bg-card-background px-1.5 py-1 rounded-md'>
                    <ThreeDotsVerticalIcon width={18} height={18} fill={colors.icon} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item key="mark-all-unread-as-read" onSelect={handleMarkAllAsRead}>
                    <DropdownMenu.ItemTitle>{t('channels.markAllRead')}</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

export default UnreadChannelListMoreActions