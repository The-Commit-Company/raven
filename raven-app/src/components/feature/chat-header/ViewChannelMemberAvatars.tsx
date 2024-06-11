import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Avatar } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"

interface ViewChannelDetailsButtonProps {
    channelData: ChannelListItem,
}

export const ViewChannelMemberAvatars = ({ channelData }: ViewChannelDetailsButtonProps) => {

    const { channelMembers } = useFetchChannelMembers(channelData.name)

    const totalMembers = Object.keys(channelMembers).length

    const extraNumber = Math.min(totalMembers - 3, 9)

    return (
        <div className={'flex items-center -space-x-1 rtl:space-x-reverse animate-fadein'}>
            {Object.entries(channelMembers).map(([name, member], index) => {
                if (index < 3)
                    return <UserAvatar
                        key={name}
                        src={member.user_image ?? undefined}
                        alt={member.full_name ?? member.name}
                        radius='full'
                        variant='solid'
                        className="border border-gray-2"
                    />
            })}
            {totalMembers > 3 && <span className="inline-block">
                <Avatar
                    fallback={`${extraNumber}+`} size={'1'}
                    variant='soft'
                    color='gray'
                    radius={'full'} className="border border-slate-4 text-[10px]" />
            </span>}
        </div>
    )
}