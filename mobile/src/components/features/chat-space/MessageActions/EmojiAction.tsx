import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { BiSmile } from "react-icons/bi"
import { ActionProps } from "./common"
import { useCallback } from "react"
import { IonButton, IonContent, IonModal } from "@ionic/react"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import EmojiPicker from "@/components/common/EmojiPicker"
import './emojiAction.styles.css'


const STANDARD_EMOJIS = ['👍', '✅', '❤️', '🎉', '👀']

interface EmojiActionProps extends ActionProps {
    presentingElement: any
}
export const EmojiAction = ({ message, onSuccess, presentingElement }: EmojiActionProps) => {

    const { data: { name: messageID } } = message
    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const { mutate } = useSWRConfig()

    const saveReaction = useCallback(async (emoji: string) => {
        Haptics.impact({
            style: ImpactStyle.Light
        })
        return reactToMessage({
            message_id: messageID,
            reaction: emoji
        })
            .then(() => mutate(`get_messages_for_channel_${message.data.channel_id}`))
            .then(() => onSuccess())
    }, [messageID, reactToMessage])

    return (
        <div className="px-1 pb-2 text-center grid grid-cols-6 gap-2">
            {STANDARD_EMOJIS.map(emoji => <QuickEmojiAction
                key={emoji}
                emoji={emoji} onClick={() => saveReaction(emoji)}
            />)
            }
            <OtherEmojiAction
                presentingElement={presentingElement}
                onClick={saveReaction}
            />
        </div>
    )
}


const QuickEmojiAction = ({ emoji, onClick }: { emoji: string, onClick: VoidFunction }) => {
    return <div>
        <IonButton
            slot='icon-only'
            shape="round"
            fill='clear'
            className={"flex items-center flex-col bg-zinc-800 aspect-square justify-center rounded-full"}
            onClick={onClick}>
            <span className="text-lg block rounded-md w-9">{emoji}</span>
        </IonButton>
    </div>
}

const OtherEmojiAction = ({ presentingElement, onClick }: { presentingElement: any, onClick: (emoji: string) => void }) => {
    return <div>
        <IonButton
            slot='icon-only'
            shape="round"
            id='emoji-picker'
            fill='clear'
            className={"flex items-center flex-col bg-zinc-800 text-zinc-300 aspect-square justify-center rounded-full"}
        >
            <span>
                <BiSmile size='24' />
            </span>
        </IonButton>
        <IonModal
            trigger="emoji-picker"
            id='emoji-picker-modal'
            handle
            presentingElement={presentingElement}
            // handleBehavior="cycle"
            canDismiss
        >
            <IonContent className="ion-padding">
                <div>
                    <EmojiPicker onSelect={onClick} />
                </div>
            </IonContent>
        </IonModal>
    </div>
}

