import { IonBadge, IonItem, IonLabel, IonList, useIonToast } from '@ionic/react';
import { useFrappePostCall } from 'frappe-react-sdk'
import { useHistory } from 'react-router-dom';
import { DMUser } from '@/pages/direct-messages/DirectMessageList';
import { DMChannelListItem, UnreadCountData, useChannelList } from '@/utils/channel/ChannelListProvider';
import { SquareAvatar, UserAvatar } from '@/components/common/UserAvatar';
import { useIsUserActive } from '@/hooks/useIsUserActive';
import { useMemo } from 'react';

export const PrivateMessages = ({ users, unread_count }: { users: DMUser[], unread_count?: UnreadCountData }) => {

    const { mutate } = useChannelList()

    const { call } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")

    const history = useHistory();

    const [toast] = useIonToast();

    const onChannelCreate = async (user_id: string) => {
        return call({ user_id })
            .then((r) => {
                history.push(`channel/${r?.message}`)
                mutate()
            })
            .catch(() => {
                toast({
                    message: `Could not create a message channel with ${user_id}`,
                    color: "danger",
                    duration: 5000,
                    position: 'bottom',
                })
            })
    }


    return <IonList className='pb-4'>
        {users.map(dmUser => {
            if (dmUser.channel !== undefined) {
                return <DMChannelItem key={dmUser.name} user={dmUser as DMChannel} unreadCount={unread_count?.channels ?? []} />
            } else {
                return <UserItem key={dmUser.name} user={dmUser} onChannelCreate={onChannelCreate} />
            }
        })}
    </IonList>
}

/** This is to be used for users who have a channel */
interface DMChannel extends DMUser {
    channel: DMChannelListItem
}
const DMChannelItem = ({ user, unreadCount }: { user: DMChannel, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == user.channel.name)?.unread_count, [user.channel.name, unreadCount])
    const isActive = useIsUserActive(user.name)

    return <IonItem className='py-1' key={user.name} detail={false} lines='none' routerLink={`channel/${user.channel.name}`}>
        <div slot='start' className='flex items-center space-x-4 w-5/6'>
            <SquareAvatar slot='start' alt={user.full_name} src={user.user_image} isActive={isActive} />
            <IonLabel className='w-5/6'>{user.full_name}</IonLabel>
        </div>
        {unreadCountForChannel ? <IonBadge>{unreadCountForChannel < 100 ? unreadCountForChannel : '99'}</IonBadge> : null}
    </IonItem>
}

const UserItem = ({ user, onChannelCreate }: { user: DMUser, onChannelCreate: (user_id: string) => void }) => {
    const isActive = useIsUserActive(user.name)
    return <IonItem className='py-1' key={user.name} detail={false} lines='none' button onClick={() => onChannelCreate(user.name)}>
        <SquareAvatar slot='start' alt={user.full_name} src={user.user_image} isActive={isActive} />
        <IonLabel>{user.full_name}</IonLabel>
    </IonItem>
}