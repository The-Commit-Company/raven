import { UserAvatar } from '@/components/common/UserAvatar'
import { IonAvatar, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal } from '@ionic/react'
import { Button, Theme, Text } from '@radix-ui/themes'
import { useRef } from 'react'
import { Poll } from '../chat-space/chat-view/MessageBlock'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useGetUser } from '@/hooks/useGetUser'

interface ViewPollVotesProps {
    isOpen: boolean,
    onDismiss: VoidFunction,
    poll: Poll
}

type VoteData = {
    users: string[]
    count: number
    percentage: number
}

type PollVotesResponse = Record<string, VoteData>

export const ViewPollVotes = ({ isOpen, onDismiss, poll }: ViewPollVotesProps) => {

    const modal = useRef<HTMLIonModalElement>(null)

    // fetch poll votes using poll_id
    const { data, error } = useFrappeGetCall<{ message: PollVotesResponse }>('raven.api.raven_poll.get_all_votes', {
        'poll_id': poll.poll.name,
    }, `poll_votes_${poll.poll.name}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return (
        <IonModal ref={modal} onDidDismiss={onDismiss} isOpen={isOpen}>
            <IonHeader>
                <Theme accentColor="iris">
                    <div className='py-3 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b rounded-t-3xl'>
                        <div className="w-11">
                            <Button size='3' variant="ghost" color='gray' onClick={() => onDismiss()}>Cancel</Button>
                        </div>
                        <div className="flex flex-col items-baseline">
                            <div className='flex items-center gap-1'>
                                <Text className="cal-sans font-medium" size='4'>Poll Votes</Text>
                            </div>
                            <Text size='1' color='gray' className="pl-5 tracking-wide">{poll.poll.total_votes} vote{poll.poll.total_votes > 1 ? 's' : ''}</Text>
                        </div>
                        <div className='w-10'></div>
                    </div>
                </Theme>
            </IonHeader>

            <IonContent>
                <Theme accentColor="iris">
                    <div className="flex items-center justify-between py-4 px-4">
                        <Text size='3' weight='medium'>{poll.poll.question}</Text>
                    </div>
                    <div className='py-2'>
                        {data?.message && Object.keys(data.message).map((opt) => {
                            const option = data.message[opt]
                            const optionName = poll.poll.options.find(o => o.name === opt)?.option
                            return (
                                <div key={opt} className="flex flex-col">
                                    <div className="flex justify-between items-baseline px-4">
                                        <div className="flex items-baseline gap-1">
                                            <Text size='2' color='gray' as='span'>{optionName}</Text>
                                            <Text size='2' color='gray' as='span'>- {option.percentage}%</Text>
                                        </div>
                                        <Text size='2' color='gray' as='span'>{option.count} vote{option.count > 1 ? 's' : ''}</Text>
                                    </div>

                                    <IonList inset className='!mt-2'>
                                        {option.users.map(user => (
                                            <UserVote key={user} user_id={user} />
                                        ))}
                                    </IonList>
                                </div>
                            )
                        })}
                    </div>
                </Theme>
            </IonContent>
        </IonModal>
    )
}

const UserVote = ({ user_id }: { user_id: string }) => {

    const user = useGetUser(user_id)

    return <IonItem color='light'>
        <IonAvatar slot='start'>
            <UserAvatar alt={user?.full_name} src={user?.user_image} size='3' className='-mt-0.5' />
        </IonAvatar>
        <IonLabel>
            <div className='flex flex-col -gap-0.5 text-ellipsis justify-center'>
                <Text as='span' className='block' weight='medium' size='3'>{user?.full_name}</Text>
            </div>
        </IonLabel>
    </IonItem>
}