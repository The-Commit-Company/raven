import { useContext, useState } from "react"
import { User } from "../../../../../raven-app/src/types/User/User"
import { ChannelContext } from "../../../pages/channels/ViewChannel"
import { DateObjectToTimeString, DateObjectToFormattedDateStringWithoutYear } from "../../../../../raven-app/src/utils/operations"
// import { ActionsPalette } from "../../message-action-palette/ActionsPalette"
import { MessageReactions } from "./MessageReactions"
import { Message, MessageBlock } from "../../../../../raven-app/src/types/Messaging/Message"
import { IonAvatar, IonItem, IonText } from "@ionic/react"
import Avatar from "react-avatar"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
// import { PreviousMessageBox } from "./PreviousMessageBox"

interface ChatMessageBoxProps {
    message: Message,
    handleScroll?: (newState: boolean) => void,
    children?: React.ReactNode,
    onOpenUserDetailsDrawer?: (selectedUser: User) => void,
    handleScrollToMessage?: (name: string, channel: string, messages: MessageBlock[]) => void,
    replyToMessage?: (message: Message) => void
    mutate?: () => void
}

export const ChatMessageBox = ({ message, onOpenUserDetailsDrawer, handleScroll, children, handleScrollToMessage, mutate, replyToMessage, ...props }: ChatMessageBoxProps) => {

    const { channelMembers, users } = useContext(ChannelContext)
    const { name, owner: user, creation: timestamp, message_reactions, is_continuation, is_reply, linked_message } = message
    const { url } = useContext(FrappeContext) as FrappeConfig


    return (
        <IonItem>

            {is_continuation === 0 &&
                <div className='flex pt-4 items-start w-full'>
                    <div style={{ height: "40px", width: "40px", maxWidth: "40px" }} className='w-1/5'>
                        {channelMembers[message.owner]?.user_image ?
                            <IonAvatar style={{ "--border-radius": "8px" }} className="h-10 w-10">
                                <img src={url + channelMembers[message.owner]?.user_image} />
                            </IonAvatar>
                            :
                            <Avatar src={url + channelMembers[message.owner]?.user_image} name={channelMembers[message.owner]?.full_name} size='40' round="8px" />}
                    </div>
                    <div className="w-full pl-2">
                        <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <IonText className='font-semibold text-sm' >{channelMembers?.[user]?.full_name ?? users?.[user]?.full_name ?? user}</IonText>

                            <IonText className="font-thin text-xs">{DateObjectToTimeString(new Date(timestamp))}</IonText>
                        </div>

                        {/* {is_reply === 1 && linked_message &&
                            <PreviousMessageBox previous_message_id={linked_message} />
                        } */}
                        {children}
                        <MessageReactions message_reactions={message_reactions} name={name} />
                    </div>
                </div>
            }

            {is_continuation === 1 &&
                <div className='flex py-0 items-start pl-12'>
                    {/* {is_reply === 1 && linked_message &&
                            <PreviousMessageBox previous_message_id={linked_message} />
                        } */}
                    {children}
                    <MessageReactions name={name} message_reactions={message_reactions} />
                </div>
            }

            {/* {message && handleScroll && <ActionsPalette
                message={message}
                showButtons={showButtons}
                handleScroll={handleScroll}
                is_continuation={is_continuation}
                replyToMessage={replyToMessage}
                mutate={mutate} />
            } */}

        </IonItem>
    )
}