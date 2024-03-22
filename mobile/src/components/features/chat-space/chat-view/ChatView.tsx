import { IonList } from '@ionic/react'
import { createContext } from 'react'
import { DateSeparator } from './DateSeparator'
import { ChannelMembersMap } from '../ChatInterface'
import { MessageBlockItem } from './MessageBlock'
import { MessageDateBlock } from '../useChatStream'
import { Message } from '../../../../../../types/Messaging/Message'

type ChatViewProps = {
    messages: MessageDateBlock[],
    members: ChannelMembersMap,
    onMessageSelected: (message: Message) => void
}

export const ChannelMembersContext = createContext<ChannelMembersMap>({})
export const ChatView = ({ messages, members, onMessageSelected }: ChatViewProps) => {

    /** The ChatHistory component renders all the messages in the Chat.
     * It receives a messages array - which consists of two blocks: a Date Block (to show a date separator) and a Message Block (to show a message)
     */

    return (
        <ChannelMembersContext.Provider value={members}>
            <IonList lines='none' className='flex flex-col'>
                {messages.map((message) => {

                    if (message.message_type === "date") {
                        return <DateSeparator key={`date-${message.creation}`} date={message.creation} />
                    } else {
                        return (
                            <MessageBlockItem key={`${message.name}_${message.modified}`} message={message} onMessageSelect={onMessageSelected} />
                        )
                    }
                }
                )}
            </IonList>
        </ChannelMembersContext.Provider>
    )
}