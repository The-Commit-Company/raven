import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import CircleIcon from '@assets/icons/CircleIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'

export type AvailabilityStatus = 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | ''

const UserAvailability = () => {

    const { myProfile, mutate } = useCurrentRavenUser()
    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const setAvailabilityStatus = (status: AvailabilityStatus) => {
        call({
            'availability_status': status
        }).then(() => {
            toast.success("Availability updated!", {
                duration: 600
            })
            mutate()
        }).catch((error) => {
            toast.error('Error updating availability', {
                description: error.message
            })
        })
    }

    const getStatusText = (status: AvailabilityStatus) => {
        switch (status) {
            case 'Available':
                return 'Available'
            case 'Away':
                return 'Away'
            case 'Do not disturb':
                return 'Do Not Disturb'
            case 'Invisible':
                return 'Invisible'
            default:
                return 'Available'
        }
    }

    const { colors } = useColorScheme()

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2.5'>
                    <CircleIcon height={15} width={15} color={colors.icon} strokeWidth={2.5} />
                    <Text className='text-base'>Availability</Text>
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
                            <DropdownMenu.ItemTitle>Available</DropdownMenu.ItemTitle>
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
                            <DropdownMenu.ItemTitle>Away</DropdownMenu.ItemTitle>
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
                            <DropdownMenu.ItemTitle>Do Not Disturb</DropdownMenu.ItemTitle>
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
                            <DropdownMenu.ItemTitle>Invisible</DropdownMenu.ItemTitle>
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
                            <DropdownMenu.ItemTitle>Reset</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </View>
        </View>
    )
}

export default UserAvailability