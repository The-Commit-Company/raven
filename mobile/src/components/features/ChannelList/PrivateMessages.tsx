import { IonAvatar, IonIcon, IonItem, IonLabel } from '@ionic/react';
import { useFrappeGetDocList, useFrappePostCall } from 'frappe-react-sdk'
import { personCircleOutline } from 'ionicons/icons';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../../utils/UserProvider';

type User = {
    full_name: string
    user_image: string
    name: string
}

export const PrivateMessages = () => {

    const { currentUser } = useContext(UserContext)
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const history = useHistory();

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        history.push(`/channel/${result?.message}`)
    }

    if (users) {
        return (<div>
            <div className='ion-padding-horizontal py-4'>
                <IonLabel className='text-sm font-medium' color='medium'>Private Messages</IonLabel>
            </div>
            {users.map((user) => <IonItem key={user.name} onClick={() => gotoDMChannel(user.name)} lines='none' detail={false}>
                {user.user_image ?
                    <IonAvatar slot='start' style={{ borderRadius: 2, "--border-radius": "4px" }}>
                        <img src={user.user_image} alt={user.full_name} />
                    </IonAvatar>
                    :
                    <IonIcon slot='start' icon={personCircleOutline} color='medium' />
                }
                <IonLabel className='text-sm font-medium'>{user.name !== currentUser ? user.full_name : user.full_name + ' (You)'}</IonLabel>
            </IonItem>)}

        </div>)
    }
    return (
        <div>PrivateMessages</div>
    )
}