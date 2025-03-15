import { useColorScheme } from '@hooks/useColorScheme'
import { TouchableOpacity } from 'react-native'
import ThreeHorizontalDots from '@assets/icons/ThreeHorizontalDots.svg'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useLocalSearchParams } from 'expo-router'
import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useMemo } from 'react';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import MuteThread from './MuteThread';
import DeleteThread from './DeleteThread';
import LeaveThread from './LeaveThread';

const ThreadActions = () => {

    const { id: threadID } = useLocalSearchParams()
    const { colors } = useColorScheme()

    const { channelMembers } = useFetchChannelMembers(threadID as string)
    const { myProfile: user } = useCurrentRavenUser()

    const channelMember = useMemo(() => {
        if (user && channelMembers) {
            return channelMembers[user.name]
        }
        return null
    }, [user, channelMembers])

    console.log("channelMember", channelMember)

    if (!channelMember) return null

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity hitSlop={10} >
                    <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <MuteThread channelMember={channelMember} />
                <LeaveThread />
                {channelMember.is_admin && <DeleteThread />}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

export default ThreadActions