import useGetChannels from '@raven/lib/hooks/useGetChannels';
import ChannelListUI from './ChannelListUI';
import { useMemo } from 'react';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

const AllChannelsList = ({ workspace }: { workspace: string }) => {

    const { channels } = useGetChannels({ showArchived: false })

    const { myProfile } = useCurrentRavenUser()
    const pinnedChannelIDs = myProfile?.pinned_channels?.map(pin => pin.channel_id)

    const workspaceChannels = useMemo(() => {
        return channels?.filter((channel) => channel.workspace === workspace) ?? []
    }, [channels, workspace])

    const filteredWorkspaceChannels = useMemo(() => {
        return workspaceChannels.filter(channel => !pinnedChannelIDs?.includes(channel.name))
    }, [workspaceChannels, pinnedChannelIDs])

    return <ChannelListUI channels={filteredWorkspaceChannels} />
}

export default AllChannelsList
