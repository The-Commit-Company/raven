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

const DMChannelItem = ({ channelID, peer_user_id, channelName }: { channelID: string, channelName: string, peer_user_id: string }) => {

    const { currentUser } = useContext(UserContext)
    const { workspaceID } = useParams()
    const user = useGetUser(peer_user_id)
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        if (workspaceID) {
            navigate(`/${workspaceID}/${channelID}`)
        } else {
            navigate(`/channel/${channelID}`)
        }
        setOpen(false)
    }

    const userName = user?.full_name ?? peer_user_id ?? replaceCurrentUserFromDMChannelName(channelName, currentUser)

    return <Command.Item
        keywords={[userName]}
        value={peer_user_id ?? channelID}
        onSelect={onSelect}>
        <Flex gap='2' align='center' justify={'between'} width='100%'>
            <Flex gap='2' align='center'>
                <UserAvatar src={user?.user_image} alt={userName}
                    isBot={user?.type === 'Bot'} />
                {userName}
            </Flex>
            {user && !user?.enabled && <Badge color='gray' variant="soft">Disabled</Badge>}
            {!user && <Badge color='gray' variant="soft">Deleted</Badge>}
        </Flex>
    </Command.Item>
}

export default DMChannelItem