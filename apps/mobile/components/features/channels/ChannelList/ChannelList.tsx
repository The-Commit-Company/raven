import useGetChannels from '@raven/lib/hooks/useGetChannels';
import ChannelListUI from './ChannelListUI';
import { useMemo } from 'react';

const ChannelList = ({ workspace }: { workspace: string }) => {
    const { channels } = useGetChannels({ showArchived: false })

    const workspaceChannels = useMemo(() => {
        return channels?.filter((channel) => channel.workspace === workspace) ?? []
    }, [channels, workspace])

    return <ChannelListUI channels={workspaceChannels} />
}

export default ChannelList