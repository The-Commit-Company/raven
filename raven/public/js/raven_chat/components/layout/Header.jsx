import * as React from "react";
import useGetChannel from "../../hooks/useGetChannel";
import ChannelIcon from "../common/ChannelIcon";
import Avatar from "../common/Avatar";
import useGetUser from "../../hooks/useGetUser";
/**
 * Header will have the following:
 * - Logo
 * - TODO: Unread message count
 * - Expand button
 */
const Header = ({
    toggle, selectedChannel, isOpen, setSelectedChannel, unreadMessageCount
}) => {

    const closeChannel = () => {
        setSelectedChannel('')
    }

    const toggleRaven = () => {
        closeChannel()
        toggle()
    }

    return <div className="raven-header">
        {selectedChannel ? <ChannelHeader channelID={selectedChannel} onBackClick={closeChannel} /> :
            <div>
                <span role='button' className="raven-logo cal-sans" onClick={toggle}>raven</span>
            </div>

        }
        <div>
            {unreadMessageCount ? <span className="raven-unread-count">{unreadMessageCount} unread</span> : null}
            <button className="btn btn-md back-button" onClick={toggleRaven}>
                {isOpen ?
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path></svg>
                }
            </button>
        </div>

    </div>
}

export default Header


const ChannelHeader = ({ channelID, onBackClick }) => {

    const channel = useGetChannel(channelID)
    console.log(channel)
    return <div className="raven-channel-header">
        <button className="btn btn-md back-button" onClick={onBackClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg>
        </button>

        {channel?.is_direct_message ? <DMChannelHeader channel={channel} /> :
            <>
                <ChannelIcon channelType={channel?.channel_type} />
                <span className="raven-channel-header-name cal-sans">{channel?.channel_name ?? channelID}</span>
            </>

        }
    </div>
}

const DMChannelHeader = ({ channel }) => {

    const user = useGetUser(channel.peer_user_id)
    return <div className="raven-dm-channel-header">
        <Avatar user={user} fallback={channel.peer_user_id} />
        <span className="raven-channel-header-name cal-sans">{user?.full_name ?? user?.name}</span>
    </div>

}