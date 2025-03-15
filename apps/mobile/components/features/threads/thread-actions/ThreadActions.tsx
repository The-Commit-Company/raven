import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useMemo } from 'react';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import ActionsDropdownMenu from './ActionsDropdownMenu';

const ThreadActions = ({ threadID }: { threadID: string }) => {

    const { channelMembers } = useFetchChannelMembers(threadID)
    const { myProfile: user } = useCurrentRavenUser()

    const channelMember = useMemo(() => {
        if (user && channelMembers) {
            return channelMembers[user.name]
        }
        return null
    }, [user, channelMembers])

    if (!channelMember) return null

    return (
        <ActionsDropdownMenu threadID={threadID} channelMember={channelMember} />
    )
}

export default ThreadActions