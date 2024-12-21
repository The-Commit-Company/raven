import useGetChannels from '@raven/lib/hooks/useGetChannels';
import ChannelListUI from './ChannelListUI';

const ChannelList = () => {
    const { channels } = useGetChannels({ showArchived: false })
    return <ChannelListUI channels={channels} />
}

export default ChannelList