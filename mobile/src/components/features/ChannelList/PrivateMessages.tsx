import { IonAvatar, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonSearchbar, IonText, IonToolbar } from '@ionic/react';
import { useFrappeGetDocList, useFrappePostCall, FrappeContext, FrappeConfig, useFrappeGetCall } from 'frappe-react-sdk'
import { personCircleOutline } from 'ionicons/icons';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../../../utils/UserProvider';
import { DMChannelData, UnreadCountData } from "../../../../../raven-app/src/types/Channel/Channel"
import { BsPersonSquare } from 'react-icons/bs'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';
import 'swiper/css/scrollbar';
import "swiper/css";

type User = {
    full_name: string
    user_image: string
    name: string
}

export const PrivateMessages = () => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { currentUser } = useContext(UserContext)
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
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

    let [results, setResults] = useState(users);

    const handleInput = (ev: Event) => {
        let query = '';
        const target = ev.target as HTMLIonSearchbarElement;
        if (target) query = target.value!.toLowerCase();
        if (users) setResults(users.filter((user) => user.full_name.toLowerCase().indexOf(query) > -1));
    };

    console.log(users)
    console.log(url)

    if (users) {
        return (<div>
            <IonHeader collapse="condense" translucent>
                <IonToolbar>
                    <IonSearchbar animated={true} placeholder="Search" debounce={1000} onIonInput={(ev) => handleInput(ev)}></IonSearchbar>
                    <Swiper onSlideChange={() => console.log("swiped")} modules={[Scrollbar]} scrollbar={{ draggable: true }} slidesPerView={4} className="px-4 py-2">
                        {results && results?.length > 0 ? results.map((user) => (
                            <SwiperSlide className="inline-block align-top">
                                {user.user_image ?
                                    <IonAvatar>
                                        <img src={url + user.user_image} alt={user.full_name} />
                                    </IonAvatar>
                                    :
                                    <BsPersonSquare size={36} className="mr-5" />
                                }
                            </SwiperSlide>))
                            :
                            <div className="ion-text-center">No results found.</div>}
                    </Swiper>
                    <div className="ion-margin-horizontal border-b border-background"></div>
                </IonToolbar>
            </IonHeader>
            {users.map((user) => <IonItem key={user.name} onClick={() => gotoDMChannel(user.name)} lines='none' detail={false} className="py-2">
                {user.user_image ?
                    <IonAvatar slot='start' style={{ borderRadius: 2, "--border-radius": "4px" }}>
                        <img src={url + user.user_image} alt={user.full_name} />
                    </IonAvatar>
                    :
                    <BsPersonSquare size={36} className="mr-5" />
                }
                <IonLabel className='text-sm font-medium'>{user.name !== currentUser ? user.full_name : user.full_name + ' (You)'}</IonLabel>
            </IonItem>)}
        </div>)
    }
    return null
}