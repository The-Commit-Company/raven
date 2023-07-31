import { IonAvatar, IonHeader, IonItem, IonLabel, IonSearchbar, IonText, IonToolbar } from '@ionic/react';
import { useFrappePostCall, FrappeContext, FrappeConfig, useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../../../utils/providers/UserProvider';
import { DMChannelData } from "../../../../../raven-app/src/types/Channel/Channel"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';
import Avatar from 'react-avatar';
import 'swiper/css/scrollbar';
import "swiper/css";

type User = {
    full_name: string
    user_image: string
    first_name: string
    name: string
}

export const PrivateMessages = () => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { currentUser } = useContext(UserContext)
    const { data: users, error: usersError } = useFrappeGetCall<{ message: User[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_raven_users_list', undefined, undefined, {
        revalidateOnFocus: false
    })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const { data: DMChannels, error: DMChannelsError } = useFrappeGetCall<{ message: DMChannelData[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_direct_message_channels_list', undefined, undefined, {
        revalidateOnFocus: false
    })
    const location = useLocation();
    const currentAddress = location.pathname

    const [showData, setShowData] = useState(true)
    const [selectedUser, setSelectedUser] = useState<string[]>([])

    useEffect(() => {
        reset()
    }, [])
    const history = useHistory();

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        history.push(`/channel/${result?.message}`)
        const DMChannel = DMChannels?.message.find((channel: DMChannelData) => channel.user_id === user)
        if (DMChannel) {
            history.push(`/channel/${DMChannel.name}`)
            setSelectedUser([user, `/channel/${DMChannel.name}`])
        }
        else {
            const result = await call({ user_id: user })
            history.push(`/channel/${result?.message}`)
            setSelectedUser([user, `/channel/${result?.message}`])
        }
    }

    let [results, setResults] = useState(users?.message);

    useEffect(() => {
        setResults(users?.message)
    }, [users?.message])

    const handleInput = (ev: Event) => {
        let query = '';
        const target = ev.target as HTMLIonSearchbarElement;
        if (target) query = target.value!.toLowerCase();
        if (users?.message) setResults(users.message.filter((user) => user.full_name.toLowerCase().indexOf(query) > -1));
    };

    if (users) {
        return (<div>
            <IonHeader collapse="condense" translucent>
                <IonToolbar>
                    <IonSearchbar animated={true} placeholder="Search" debounce={1000} onIonInput={(ev) => handleInput(ev)}></IonSearchbar>
                    {/* @ts-ignore */}
                    <Swiper modules={[Scrollbar]} scrollbar={{ draggable: true }} slidesPerView={4} className="px-4 py-2">
                        {results && results?.length > 0 ? results.map((user) => (
                            <SwiperSlide className="inline-block align-top" key={user.name} onClick={() => gotoDMChannel(user.name)}>
                                <div className='flex flex-col items-center justify-start'>

                                    {user.user_image ?
                                        <IonAvatar className="h-16 w-16">
                                            <img src={url + user.user_image} />
                                        </IonAvatar>
                                        :
                                        <Avatar name={user.full_name} round size='64' />}
                                    <div className='flex items-center justify-start'>
                                        <IonText>{user.first_name}</IonText>
                                    </div>
                                </div>
                            </SwiperSlide>))
                            :
                            <div className="ion-text-center">No results found.</div>}
                    </Swiper>
                    <div className="ion-margin-horizontal border-b border-background"></div>
                </IonToolbar>
            </IonHeader>
            {users.message.map((user) => <IonItem key={user.name} onClick={() => gotoDMChannel(user.name)} lines='none' detail={false} className="py-2">
                {user.user_image ?
                    <IonAvatar style={{ "--border-radius": "8px" }} className="h-14 w-14 mr-4">
                        <img src={url + user.user_image} />
                    </IonAvatar>
                    :
                    <Avatar src={url + user.user_image} name={user.full_name} size='56' className="mr-4" round="8px" />}
                <IonLabel className='text-sm font-medium'>{user.name !== currentUser ? user.full_name : user.full_name + ' (You)'}</IonLabel>
            </IonItem>)}
            <div className="ion-padding" />
        </div>)
    }
    return null
}