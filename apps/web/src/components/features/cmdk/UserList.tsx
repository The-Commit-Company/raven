import { CommandGroup, CommandItem } from '@components/ui/command'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { useChannels } from '@hooks/useChannels'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from './atoms'
import _ from '@lib/translate'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { Badge } from '@components/ui/badge'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, UserData } from "@db"
import { useMemo } from 'react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { getErrorMessage } from '@lib/frappe'
import { Loader2 } from 'lucide-react'

const UserList = ({ text }: { text: string }) => {

    const filteredUsers = useLiveQuery(() => db.users
        .filter((user: UserData) => user.name.toLowerCase().includes(text.toLowerCase()) || user.full_name.toLowerCase().includes(text.toLowerCase()))
        .toArray(),
        [text])

    const { dm_channels } = useChannels()

    const mappedUsers = useMemo(() => {
        if (text) {
            if (!filteredUsers) return []
            return filteredUsers.map(user => {
                const dmChannel = dm_channels.find(channel => channel.peer_user_id === user.name)
                return dmChannel ? { user, channel: dmChannel } : { user, channel: null }
            })
        } else {
            return dm_channels.slice(0, 3).map(channel => {
                const user = filteredUsers?.find(user => user.name === channel.peer_user_id) || null
                return { user, channel }
            })
        }
    }, [filteredUsers, dm_channels])

    if (text && (!filteredUsers || !filteredUsers.length)) return null
    // filteredUsers need to be mapped to dm_channels and then render DMChannelItem or UserItem based on whether dm_channel exists or not. In UserItem, we will do api call on click to create dm_channel and then navigate to that dm_channel

    return (
        <CommandGroup heading={_("Users")}>
            {mappedUsers.map(({ user, channel }) => {
                if (!user) return null
                return channel ? (
                    <DMChannelItem key={channel.name} user={user} channel={channel} />
                ) : (
                    <UserItem key={user.name} user={user} />
                )
            })}
        </CommandGroup>
    )
}

const DMChannelItem = ({ user, channel }: { user: UserData; channel: DMChannelListItem }) => {
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)
    const displayName = user?.full_name || channel.peer_user_id

    return (
        <CommandItem
            value={channel.name}
            keywords={[displayName, channel.peer_user_id]}
            onSelect={() => {
                navigate(`/dm-channel/${channel.name}`)
                setOpen(false)
            }}
            className='cursor-pointer'
        >
            {user ? (
                <UserAvatar user={user} size="xs" showStatusIndicator={false} />
            ) : null}
            <span className="truncate">{displayName}</span>
            {user?.enabled === 0 && (
<Badge variant="subtle" className="ml-auto text-xs">
    {_("Disabled")}
</Badge>
            )}
        </CommandItem>
    )
}

const UserItem = ({ user }: { user: UserData }) => {
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)
    const { call, loading } = useFrappePostCall<{ message: string }>('raven.api.raven_channel.create_direct_message_channel')

    const onSelect = () => {
        if (user.enabled === 0) return
        call({
            user_id: user.name
        }).then((res) => {
            navigate(`/dm-channel/${res?.message}`)
            setOpen(false)
        }).catch(err => {
            toast.error('Could not create a DM channel', {
                description: getErrorMessage(err)
            })
        })
    }

    return (
        <CommandItem
            value={user.name}
            keywords={[user.full_name, user.name]}
            onSelect={onSelect}
            className={user.enabled === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
            <UserAvatar user={user} size="xs" showStatusIndicator={false} />
            <span className="truncate">{user.full_name}</span>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user?.enabled === 0 && (
                <Badge variant="subtle" className="ml-auto text-xs">
                    {_("Disabled")}
                </Badge>
            )}
        </CommandItem>
    )
}
export default UserList
