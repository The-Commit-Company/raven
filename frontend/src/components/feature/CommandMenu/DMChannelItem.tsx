import { UserAvatar } from "@/components/common/UserAvatar"
import { useGetUser } from "@/hooks/useGetUser"
import { Command } from "cmdk"
import { commandMenuOpenAtom } from "./CommandMenu"
import { useSetAtom } from "jotai"
import { useNavigate } from "react-router-dom"

const DMChannelItem = ({ channelID, peer_user_id }: { channelID: string, peer_user_id: string }) => {

    const user = useGetUser(peer_user_id)
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        navigate(`/channel/${channelID}`)
        setOpen(false)
    }

    return <Command.Item
        keywords={[user?.full_name ?? peer_user_id]}
        value={peer_user_id}
        onSelect={onSelect}>
        <UserAvatar src={user?.user_image} alt={user?.full_name ?? peer_user_id}
            isBot={user?.type === 'Bot'} />
        {user?.full_name}
    </Command.Item>
}

export default DMChannelItem