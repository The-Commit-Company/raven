import { Avatar, Flex, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { RavenThreadParticipant } from "@/types/RavenMessaging/RavenThreadParticipant"

interface ViewThreadParticipantsProps {
    participants: RavenThreadParticipant[]
}

export const ViewThreadParticipants = ({ participants }: ViewThreadParticipantsProps) => {

    const totalParticipants = Object.keys(participants).length

    const extraNumber = Math.min(totalParticipants - 3, 9)

    return (
        <Flex align={'center'} gap='2'>
            <Text size='1' className={'text-gray-11'}>Participants: {totalParticipants}</Text>
            <div className={'flex items-center -space-x-1 rtl:space-x-reverse animate-fadein'}>
                {Object.entries(participants).map(([name, member], index) => {
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
                {totalParticipants > 3 && <span className="inline-block">
                    <Avatar
                        fallback={`${extraNumber}+`} size={'1'}
                        variant='soft'
                        color='gray'
                        radius={'full'} className="border border-slate-4 text-[10px]" />
                </span>}
            </div>
        </Flex>
    )
}