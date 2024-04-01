import { BiGlobe, BiHash, BiLock } from "react-icons/bi"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";
import { Text } from "@radix-ui/themes";

export const ChannelHeader = ({ channel }: { channel: ChannelListItem }) => {
    const isLongName = channel.channel_name.length > 40
    const ICON_SIZE = '18px'

    return (
        <div >
            <div className="flex flex-col items-baseline">
                <div className='flex items-center gap-1'>
                    {channel.type === 'Private' ? <BiLock fontSize={ICON_SIZE} /> : channel.type === 'Public' ? <BiHash fontSize={ICON_SIZE} /> : <BiGlobe fontSize={ICON_SIZE} />}
                    <Text className='text-lg font-medium cal-sans leading-normal'>
                        {isLongName ? channel.channel_name.substring(0, 40) + '...' : channel.channel_name}
                    </Text>
                </div>
                {/* To-Do: Add count of members here */}
                {/* <Text size='1' color='gray' className="pl-5 tracking-wide">2 members</Text> */}
            </div>
        </div>
    )
}