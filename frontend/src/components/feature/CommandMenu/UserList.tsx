import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useChannelList } from '@/utils/channel/ChannelListProvider'
import { UserListContext } from '@/utils/users/UserListProvider'
import { Command } from 'cmdk'
import { useContext, useMemo } from 'react'
import DMChannelItem from './DMChannelItem'
import { useNavigate, useParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from './CommandMenu'
import { useFrappePostCall } from 'frappe-react-sdk'
import { Badge, Flex } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

const UserList = ({ text }: { text: string }) => {

    const { dm_channels } = useChannelList()

    const { users } = useContext(UserListContext)

    const { usersWithChannels, usersWithoutChannels } = useMemo(() => {

        const usersWithChannels = []
        const usersWithoutChannels = []

        for (const user of users) {
            const dmChannel = dm_channels.find((channel) => channel.peer_user_id === user.name)
            if (dmChannel) {
                usersWithChannels.push({
                    user,
                    channel: dmChannel
                })
            } else {
                usersWithoutChannels.push(user)
            }
        }

        const deletedUserChannels = dm_channels.filter((channel) => !users.find((user) => user.name === channel.peer_user_id))
        for (const channel of deletedUserChannels) {
            usersWithChannels.push({
                user: null,
                channel: channel
            })
        }

        return {
            usersWithChannels,
            usersWithoutChannels
        }

    }, [users, dm_channels])


    const { filteredUsersWithChannels, filteredUsersWithoutChannels } = useMemo(() => {
        return {
            filteredUsersWithChannels: usersWithChannels.filter((userWithChannel) => {
                if (userWithChannel.user) {
                    return userWithChannel.user.full_name.toLowerCase().includes(text.toLowerCase())
                } else {
                    return userWithChannel.channel.peer_user_id?.toLowerCase()?.includes(text.toLowerCase()) ?? false
                }
            }),
            filteredUsersWithoutChannels: usersWithoutChannels.filter((user) => user.full_name.toLowerCase().includes(text.toLowerCase()))
        }
    }, [usersWithChannels, usersWithoutChannels, text])

    if (filteredUsersWithChannels.length === 0 && filteredUsersWithoutChannels.length === 0) {
        return null
    }

    return (
        <Command.Group heading="Members">
            {filteredUsersWithChannels.map((userWithChannel) => <DMChannelItem key={userWithChannel.channel.name} user={userWithChannel.user} channel={userWithChannel.channel} />)}
            {filteredUsersWithoutChannels.map((user) => <UserWithoutDMItem key={user.name} userID={user.name} />)}
        </Command.Group>
    )
}

const UserWithoutDMItem = ({ userID }: { userID: string }) => {

    const { workspaceID } = useParams()

    const user = useGetUser(userID)
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)
    const { call, loading } = useFrappePostCall<{ message: string }>('raven.api.raven_channel.create_direct_message_channel')

    const onSelect = () => {
        call({
            user_id: userID
        }).then((res) => {
            if (workspaceID) {
                navigate(`/${workspaceID}/${res?.message}`)
            } else {
                navigate(`/channel/${res?.message}`)
            }

            setOpen(false)
        }).catch(err => {
            toast.error('Could not create a DM channel', {
                description: getErrorMessage(err)
            })
        })
    }

    return <Command.Item
        keywords={[user?.full_name ?? userID]}
        value={userID}
        onSelect={onSelect}>
        <Flex width='100%' justify={'between'} align='center'>
            <Flex gap='2' align='center'>
                <UserAvatar
                    src={user?.user_image}
                    isBot={user?.type === 'Bot'}
                    alt={user?.full_name ?? userID} />
                {user?.full_name}
            </Flex>
            {loading ? <Loader /> : null}
            {!user?.enabled ? <Badge color='gray' variant='soft'>Disabled</Badge> : null}
        </Flex>
    </Command.Item>
}

export default UserList