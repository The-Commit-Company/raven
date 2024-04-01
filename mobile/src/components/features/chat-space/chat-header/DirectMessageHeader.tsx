import { UserAvatar } from "@/components/common/UserAvatar"
import { CustomAvatar } from "@/components/ui/avatar"
import { useGetUser } from "@/hooks/useGetUser"
import { UserContext } from "@/utils/auth/UserProvider"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { IonTitle } from "@ionic/react"
import { Text } from "@radix-ui/themes"
import { useContext } from "react"


export const DirectMessageHeader = ({ channel }: { channel: DMChannelListItem }) => {

    const { currentUser } = useContext(UserContext)
    const user = useGetUser(channel.peer_user_id)

    const name = user?.name === currentUser ? `${user?.full_name} (You)` : user?.full_name ?? user?.name ?? 'Unknown User'
    return <DirectMessageHeaderUI name={name} image={user?.user_image} isBot={user?.type === 'Bot'} />
}
export const DirectMessageHeaderUI = ({ name, image, isBot }: { name: string, image?: string, isBot?: boolean }) => {

    return (<IonTitle>
        <div className='flex flex-col items-center justify-start h-8'>
            <div className='flex items-center justify-start gap-2'>
                <UserAvatar src={image ? `${image}` : undefined} alt={name} isBot={isBot} />
                <Text size='3' className='text-wrap cal-sans font-medium'>
                    {name}
                </Text>
            </div>
        </div>
    </IonTitle>)
}