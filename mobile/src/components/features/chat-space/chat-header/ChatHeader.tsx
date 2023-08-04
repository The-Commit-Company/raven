import { useContext } from 'react'
import { DirectMessageHeader } from './DirectMessageHeader'
import { UserContext } from '../../../../utils/auth/UserProvider'
import { ChannelContext } from '../../../../utils/channel/ChannelProvider'
import { ChannelHeader } from './ChannelHeader'

export const ChatHeader = () => {

    const { currentUser } = useContext(UserContext)
    const { channelData, channelMembers } = useContext(ChannelContext)

    if (channelData?.is_self_message) {
        return (
            <DirectMessageHeader name={channelMembers[currentUser]?.full_name + " (You)"} image={channelMembers[currentUser]?.user_image} />
        )
    }
    if (channelData?.is_direct_message) {
        const peer = Object.keys(channelMembers).filter((member) => member !== currentUser)[0]
        return (
            <DirectMessageHeader name={channelMembers[peer].full_name} image={channelMembers[peer].user_image} />
        )
    }
    return (
        <ChannelHeader />
    )
}