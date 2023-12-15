import React from 'react'
import useChannelList from '../../hooks/useChannelList'
import useGetUser from '../../hooks/useGetUser'
import Avatar from '../common/Avatar'
import ChannelIcon from '../common/ChannelIcon'

const ChannelList = ({ onSelectChannel }) => {

    const { isLoading, channels, dm_channels } = useChannelList()

    return (
        <div>
            {isLoading && <SkeletonLoader />}
            <div className="raven-channel-list">
                {channels?.map(channel => <ChannelListItem key={channel.name} channel={channel} onClick={() => onSelectChannel(channel.name)} />)}
                {dm_channels?.map(channel => <DMChannelListItem key={channel.name} channel={channel} onClick={() => onSelectChannel(channel.name)} />)}
            </div>
        </div>
    )
}

export default ChannelList


const SkeletonLoader = () => {

    return <>{Array.from({ length: 17 }).map((_, i) => <div key={i} className="raven-channel-list-item">
        <span className='skeleton'></span>
    </div>)}
    </>

}

const ChannelListItem = ({ channel, onClick }) => {

    return <button className="raven-channel-list-item" onClick={onClick}>
        <span className='raven-channel-icon'>
            <ChannelIcon channelType={channel.channel_type} />
        </span>
        <span className="raven-channel-list-item__name">{channel.channel_name}</span>
    </button>
}

const DMChannelListItem = ({ channel, onClick }) => {

    const user = useGetUser(channel.peer_user_id)

    return <button className="raven-channel-list-item" onClick={onClick}>
        <Avatar user={user} />
        <span className="raven-channel-list-item__name">{user?.full_name}</span>
    </button>
}