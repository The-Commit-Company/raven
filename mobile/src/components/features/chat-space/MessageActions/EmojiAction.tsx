import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { ActionProps } from "./common"
import { useCallback } from "react"
import { IonButton, IonContent, IonModal } from "@ionic/react"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import EmojiPicker from "@/components/common/EmojiPicker"
import './emojiAction.styles.css'
import { Theme } from "@radix-ui/themes"


const STANDARD_EMOJIS = ['👍', '✅', '❤️', '🎉', '👀']

interface EmojiActionProps extends ActionProps {
    presentingElement: any
}
export const EmojiAction = ({ message, onSuccess, presentingElement }: EmojiActionProps) => {

    const { name: messageID } = message
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
            .then(() => mutate(`get_messages_for_channel_${message.channel_id}`))
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
            className={"flex items-center flex-col bg-gray-2 aspect-square justify-center rounded-full"}
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
            className={"flex items-center flex-col bg-gray-2 text-gray-10 aspect-square justify-center rounded-full"}
        >
            <span>
                <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 8C13 11.3137 10.3137 14 7 14C3.68629 14 1 11.3137 1 8C1 4.68629 3.68629 2 7 2" stroke="currentColor" strokeLinecap="round"></path><path d="M4.66708 7.22157C5.09486 7.22157 5.44486 6.87157 5.44486 6.44379C5.44486 6.01602 5.09486 5.66602 4.66708 5.66602C4.23931 5.66602 3.88931 6.01602 3.88931 6.44379C3.88931 6.87157 4.23931 7.22157 4.66708 7.22157ZM9.33375 7.22157C9.76153 7.22157 10.1115 6.87157 10.1115 6.44379C10.1115 6.01602 9.76153 5.66602 9.33375 5.66602C8.90597 5.66602 8.55597 6.01602 8.55597 6.44379C8.55597 6.87157 8.90597 7.22157 9.33375 7.22157ZM7.00042 11.4993C8.44421 11.4993 9.67732 10.6215 10.2124 9.37346C10.339 9.07807 10.1004 8.77713 9.77903 8.77713H4.2218C3.90041 8.77713 3.66178 9.07807 3.78843 9.37346C4.32351 10.6215 5.55662 11.4993 7.00042 11.4993Z" fill="currentColor"></path><path d="M12 1V5" stroke="currentColor" strokeLinecap="round"></path><path d="M10 3H14" stroke="currentColor" strokeLinecap="round"></path></svg>
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
            <IonContent>
                <Theme accentColor="iris">
                    <EmojiPicker onSelect={onClick} />
                </Theme>
            </IonContent>
        </IonModal>
    </div>
}

