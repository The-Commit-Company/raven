import { IonAvatar, IonText, IonTitle } from '@ionic/react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext } from 'react'
import Avatar from 'react-avatar'
import { BiGlobe, BiHash, BiLock } from 'react-icons/bi'
import { ChannelContext } from '../../../pages/channels/ViewChannel'
import { UserContext } from '../../../utils/providers/UserProvider'

type Props = {}

export const ChannelHeader = (props: Props) => {
    const { currentUser } = useContext(UserContext)
    const { channelData, channelMembers } = useContext(ChannelContext)

    if (channelData?.is_self_message) {
        return (
            <DirectMessageChannelHeader name={channelMembers[currentUser]?.full_name + " (You)"} image={channelMembers[currentUser]?.user_image} />
        )
    }
    if (channelData?.is_direct_message) {
        const peer = Object.keys(channelMembers).filter((member) => member !== currentUser)[0]
        return (
            <DirectMessageChannelHeader name={channelMembers[peer].full_name} image={channelMembers[peer].user_image} />
        )
    }
    return (
        <IonTitle>
            <div className='flex flex-col items-center justify-start'>
                <div className='flex items-center justify-start'>
                    {channelData?.type === 'Private' ? <BiLock /> : channelData?.type === "Public" ? <BiHash /> : <BiGlobe />}
                    <h1 className='ml-1'>
                        {channelData?.channel_name}
                    </h1>
                </div>
                {channelData?.type !== "Open" && !channelData?.is_direct_message && !channelData?.is_self_message &&
                    <IonText color='medium' className='font-light text-sm mt-1'>{Object.keys(channelMembers).length} members</IonText>
                }
            </div>
        </IonTitle>
    )
}

const DirectMessageChannelHeader = ({ name, image }: { name: string, image?: string }) => {
    const { url } = useContext(FrappeContext) as FrappeConfig

    return (<IonTitle>
        <div className='flex flex-col items-center justify-start'>
            <div className='flex items-center justify-start'>
                {image ?
                    <IonAvatar className="h-10 w-10">
                        <img src={url + image} />
                    </IonAvatar>
                    :
                    <Avatar src={url + image} name={name} size='40' round />}
                <h1 className='ml-2'>
                    {name}
                </h1>
            </div>
        </div>
    </IonTitle>)
}