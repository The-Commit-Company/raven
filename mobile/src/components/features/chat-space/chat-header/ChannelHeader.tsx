import { BiGlobe, BiHash, BiLock } from "react-icons/bi"
import { IonTitle } from "@ionic/react"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";

const ICON_SIZE = '18px'
export const ChannelHeader = ({ channel }: { channel: ChannelListItem }) => {
    const isLongName = channel.channel_name.length > 20
    return (
        <IonTitle>
            <div className='flex flex-col items-center'>
                <div className='flex items-center'>
                    {channel.type === 'Private' ? <BiLock fontSize={ICON_SIZE} /> : channel.type === 'Public' ? <BiHash fontSize={ICON_SIZE} /> : <BiGlobe fontSize={ICON_SIZE} />}
                    <h1 className='ml-1 pb-0.5'>
                        {isLongName ? channel.channel_name.substring(0, 20) + '...' : channel.channel_name}
                    </h1>
                </div>
            </div>
        </IonTitle>
    )
}