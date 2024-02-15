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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
            }}>
                <span role='button' className="raven-logo cal-sans" onClick={toggle}>raven</span>

                <a href='/raven' target='_blank' className='btn btn-xs open-raven-button' style={{
                    lineHeight: '1.4rem',
                    // width: "24px",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // height: "24px",
                    // marginTop: '0.2rem',
                }} title='Open Raven'>
                    <svg
                        width="18"
                        height="18"
                        // fill='white'
                        viewBox="0 0 24 24"
                        // fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15.6396 7.02527H12.0181V5.02527H19.0181V12.0253H17.0181V8.47528L12.1042 13.3892L10.6899 11.975L15.6396 7.02527Z"
                        // fill="currentColor"
                        />
                        <path
                            d="M10.9819 6.97473H4.98193V18.9747H16.9819V12.9747H14.9819V16.9747H6.98193V8.97473H10.9819V6.97473Z"
                        // fill="currentColor"
                        />
                    </svg>
                </a>
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

    return <div className="raven-channel-header">
        <button className="btn btn-md back-button" onClick={onBackClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg>
        </button>

        {channel?.is_direct_message ? <DMChannelHeader channel={channel} /> :
            <a href={`/raven/channel/${channelID}`} target="_blank" title="Open channel in Raven">
                <ChannelIcon channelType={channel?.channel_type} />
                <span className="raven-channel-header-name cal-sans">{channel?.channel_name ?? channelID}</span>
            </a>

        }
    </div>
}

const DMChannelHeader = ({ channel }) => {

    const user = useGetUser(channel.peer_user_id)
    return <a title="Open channel in Raven" className="raven-dm-channel-header" href={`/raven/channel/${channel.name}`} target="_blank">
        <Avatar user={user} fallback={channel.peer_user_id} />
        <span className="raven-channel-header-name cal-sans">{user?.full_name ?? user?.name}</span>
    </a>

}