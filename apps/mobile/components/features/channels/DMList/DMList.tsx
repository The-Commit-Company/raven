import useGetDirectMessageChannels from '@raven/lib/hooks/useGetDirectMessageChannels';
import DMListUI from './DMListUI';

const DMList = () => {
    const { dmChannels } = useGetDirectMessageChannels()
    return <DMListUI dms={dmChannels} />
}

export default DMList