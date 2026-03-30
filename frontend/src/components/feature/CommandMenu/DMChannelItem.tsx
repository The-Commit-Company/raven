import { UserAvatar } from "@/components/common/UserAvatar"
import { useGetUser } from "@/hooks/useGetUser"
import { Command } from "cmdk"
import { commandMenuOpenAtom } from "./CommandMenu"
import { useSetAtom } from "jotai"
import { useNavigate, useParams } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "@/utils/auth/UserProvider"
import { replaceCurrentUserFromDMChannelName } from "@/utils/operations"
import { Badge, Flex } from "@radix-ui/themes"
import { UserFields } from "@/utils/users/UserListProvider"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"

const DMChannelItem = ({ channel, user }: { user: UserFields | null, channel: DMChannelListItem }) => {

    const { currentUser } = useContext(UserContext)
    const { workspaceID } = useParams()
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        if (workspaceID) {
            navigate(`/${workspaceID}/${channel.name}`)
        } else {
            navigate(`/channel/${channel.name}`)
        }
        setOpen(false)
    }

    // const userName = user?.full_name ?? peer_user_id ?? replaceCurrentUserFromDMChannelName(channelName, currentUser)

    return <Command.Item
        keywords={[user?.full_name || channel.peer_user_id]}
        value={channel.name}
        onSelect={onSelect}>
        <Flex gap='2' align='center' justify={'between'} width='100%'>
            <Flex gap='2' align='center'>
                <UserAvatar src={user?.user_image} alt={user?.full_name || channel.peer_user_id}
                    isBot={user?.type === 'Bot'} />
                {user?.full_name || channel.peer_user_id}
            </Flex>
            {user && !user?.enabled && <Badge color='gray' variant="soft">Disabled</Badge>}
            {!user && <Badge color='gray' variant="soft">Deleted</Badge>}
        </Flex>
    </Command.Item>
}

export default DMChannelItem