import { IonItem, IonLabel, IonList, useIonToast } from '@ionic/react';
import { useFrappePostCall } from 'frappe-react-sdk'
import { useHistory } from 'react-router-dom';
import { DMUser } from '@/pages/direct-messages/DirectMessageList';
import { DMChannelListItem, useChannelList } from '@/utils/channel/ChannelListProvider';
import { SquareAvatar, UserAvatar } from '@/components/common/UserAvatar';
import { useIsUserActive } from '@/hooks/useIsUserActive';

export const PrivateMessages = ({ users }: { users: DMUser[] }) => {

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
                return <DMChannelItem key={dmUser.name} user={dmUser as DMChannel} />
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
const DMChannelItem = ({ user }: { user: DMChannel }) => {
    const isActive = useIsUserActive(user.name)
    return <IonItem className='py-1' key={user.name} detail={false} lines='none' routerLink={`channel/${user.channel.name}`}>
        <SquareAvatar slot='start' alt={user.full_name} src={user.user_image} isActive={isActive} />
        <IonLabel>{user.full_name}</IonLabel>
    </IonItem>
}

const UserItem = ({ user, onChannelCreate }: { user: DMUser, onChannelCreate: (user_id: string) => void }) => {
    const isActive = useIsUserActive(user.name)
    return <IonItem className='py-1' key={user.name} detail={false} lines='none' button onClick={() => onChannelCreate(user.name)}>
        <SquareAvatar slot='start' alt={user.full_name} src={user.user_image} isActive={isActive} />
        <IonLabel>{user.full_name}</IonLabel>
    </IonItem>
}