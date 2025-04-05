
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import { useMemo } from 'react';


/**
 * This hook is used to determine whether the user can send a message to a channel(if member) and whether the user should see the join box.(if not member)
 * It returns the following:
 * - canUserSendMessage: boolean - whether the user can send a message to the channel
 * - shouldShowJoinBox: boolean - whether the user should see the join box
 * - channelMemberProfile: Member | null - the profile of the channel member
 * - channelData: ChannelData | null - the data of the channel - can be used to check if the channel is archived or not
 * - myProfile: UserFields | null - the profile of the current user
 */
const useShouldJoinChannel = (channelID: string, isThread: boolean) => {
    const { channel } = useCurrentChannelData(channelID)
    const channelData = channel?.channelData

    const { myProfile } = useCurrentRavenUser()
    const { channelMembers, isLoading } = useFetchChannelMembers(channelID)

    const channelMemberProfile: Member | null = useMemo(() => {
        if (myProfile?.name && channelMembers) {
            return channelMembers[myProfile?.name] ?? null
        }
        return null
    }, [myProfile?.name, channelMembers])

    const { canUserSendMessage, shouldShowJoinBox } = useMemo(() => {

        if (channelData?.is_archived) {
            return {
                canUserSendMessage: false,
                shouldShowJoinBox: false
            }
        }

        if (channelData?.type === 'Open') {
            return {
                canUserSendMessage: true,
                shouldShowJoinBox: false
            }
        }

        if (channelMemberProfile) {
            return {
                canUserSendMessage: true,
                shouldShowJoinBox: false
            }
        }

        const isDM = channelData?.is_direct_message === 1 || channelData?.is_self_message === 1

        // If the channel data is loaded and the member profile is loaded, then check for this, else don't show anything.
        if (!channelMemberProfile && !isDM && (channelData || isThread) && !isLoading) {
            return {
                shouldShowJoinBox: true,
                canUserSendMessage: false
            }
        }

        return { canUserSendMessage: false, shouldShowJoinBox: false }

    }, [channelMemberProfile, channelData, isLoading, isThread])

    return { canUserSendMessage, shouldShowJoinBox, channelMemberProfile, channelData, myProfile }

}

export default useShouldJoinChannel