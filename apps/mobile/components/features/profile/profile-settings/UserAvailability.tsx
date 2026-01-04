import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import CircleIcon from '@assets/icons/CircleIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { useTranslation } from 'react-i18next'

export type AvailabilityStatus = 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | ''

const UserAvailability = () => {

    const { t } = useTranslation()
    const { myProfile, mutate } = useCurrentRavenUser()
    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const setAvailabilityStatus = (status: AvailabilityStatus) => {
        call({
            'availability_status': status
        }).then(() => {
            toast.success(t('profile.availabilityUpdated'), {
                duration: 600
            })
            mutate()
        }).catch((error) => {
            toast.error(t('profile.availabilityUpdateFailed'), {
                description: error.message
            })
        })
    }

    const getStatusText = (status: AvailabilityStatus) => {
        switch (status) {
            case 'Available':
                return t('profile.statusAvailable')
            case 'Away':
                return t('profile.statusAway')
            case 'Do not disturb':
                return t('profile.statusDoNotDisturb')
            case 'Invisible':
                return t('profile.statusInvisible')
            default:
                return t('profile.statusAvailable')
        }
    }

    const { colors } = useColorScheme()

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2.5'>
                    <CircleIcon height={15} width={15} color={colors.icon} strokeWidth={2.5} />
                    <Text className='text-base'>{t('profile.availability')}</Text>
                </View>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Text className='text-base text-muted-foreground/80'>
                            {getStatusText(myProfile?.availability_status ?? 'Available')}
                        </Text>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content side='bottom' align='end'>
                        <DropdownMenu.Item key="available" onSelect={() => setAvailabilityStatus('Available')}>
                            <DropdownMenu.ItemIcon ios={{
                                name: 'checkmark.circle', // Green circle for Available
                                pointSize: 16,
                                scale: 'medium',
                                hierarchicalColor: {
                                    dark: '#93C572',
                                    light: 'green',
                                },
                            }} />
                            <DropdownMenu.ItemTitle>{t('profile.statusAvailable')}</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item key="away" onSelect={() => setAvailabilityStatus('Away')}>
                            <DropdownMenu.ItemIcon ios={{
                                name: 'clock', // Clock icon for Away
                                pointSize: 16,
                                scale: 'medium',
                                hierarchicalColor: {
                                    dark: '#FFD699',
                                    light: 'orange',
                                },
                            }} />
                            <DropdownMenu.ItemTitle>{t('profile.statusAway')}</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item key="do-not-disturb" onSelect={() => setAvailabilityStatus('Do not disturb')}>
                            <DropdownMenu.ItemIcon ios={{
                                name: 'minus.circle', // Minus circle for Do Not Disturb
                                pointSize: 16,
                                scale: 'medium',
                                hierarchicalColor: {
                                    dark: '#E06666',
                                    light: '#D22B2B',
                                },
                            }} />
                            <DropdownMenu.ItemTitle>{t('profile.statusDoNotDisturb')}</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item key="invisible" onSelect={() => setAvailabilityStatus('Invisible')}>
                            <DropdownMenu.ItemIcon ios={{
                                name: 'circle', // Dot circle for Invisible
                                pointSize: 16,
                                scale: 'medium',
                                hierarchicalColor: {
                                    dark: 'gray',
                                    light: '#BEBEBE',
                                },
                            }} />
                            <DropdownMenu.ItemTitle>{t('profile.statusInvisible')}</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item key="reset" onSelect={() => setAvailabilityStatus('')}>
                            <DropdownMenu.ItemIcon ios={{
                                name: 'arrow.clockwise', // Refresh icon for Reset
                                pointSize: 16,
                                scale: 'medium',
                                hierarchicalColor: {
                                    dark: 'gray',
                                    light: 'gray',
                                },
                            }} />
                            <DropdownMenu.ItemTitle>{t('profile.statusReset')}</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </View>
        </View>
    )
}

export default UserAvailability