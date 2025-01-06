import { atom, useAtom } from 'jotai'
import MessageActionModal from './MessageActionModal'

type MessageActionAtomType = {
    actionID: string,
    messageID: string
}
export const messageActionAtom = atom<MessageActionAtomType>({
    actionID: '',
    messageID: ''
})

const MessageActionController = () => {

    const [messageAction, setMessageAction] = useAtom(messageActionAtom)

    const closeMessageAction = () => {
        setMessageAction({ actionID: '', messageID: '' })
    }

    return (
        <MessageActionModal
            actionID={messageAction.actionID}
            messageID={messageAction.messageID}
            onClose={closeMessageAction}
        />
    )
}

export default MessageActionController