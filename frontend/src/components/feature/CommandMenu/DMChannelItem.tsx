import { UserAvatar } from "@/components/common/UserAvatar"
import { useGetUser } from "@/hooks/useGetUser"
import { Command } from "cmdk"
import { commandMenuOpenAtom } from "./CommandMenu"
import { useSetAtom } from "jotai"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "@/utils/auth/UserProvider"
import { replaceCurrentUserFromDMChannelName } from "@/utils/operations"
import { Badge, Flex } from "@radix-ui/themes"

const DMChannelItem = ({ channelID, peer_user_id, channelName }: { channelID: string, channelName: string, peer_user_id: string }) => {

    const { currentUser } = useContext(UserContext)
    const user = useGetUser(peer_user_id)
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        navigate(`/channel/${channelID}`)
        setOpen(false)
    }

    return <Command.Item
        keywords={[user?.full_name ?? peer_user_id ?? `${replaceCurrentUserFromDMChannelName(channelName, currentUser)}`]}
        value={peer_user_id ?? channelID}
        onSelect={onSelect}>
        <Flex gap='2' align='center' justify={'between'} width='100%'>
            <Flex gap='2' align='center'>
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? peer_user_id}
                    isBot={user?.type === 'Bot'} />
                {user?.full_name ?? peer_user_id ?? `${replaceCurrentUserFromDMChannelName(channelName, currentUser)} (Deleted)`}
            </Flex>
            {!user?.enabled && <Badge color='gray' variant="soft">Disabled</Badge>}
        </Flex>
    </Command.Item>
}

export default DMChannelItem