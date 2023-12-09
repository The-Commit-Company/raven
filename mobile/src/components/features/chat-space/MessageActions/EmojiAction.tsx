import { BiBookAdd } from "react-icons/bi"

type Props = {}

export const EmojiAction = (props: Props) => {
    return (
        <div className="p-4 text-center grid grid-cols-6">
            <QuickEmojiAction emoji="👍" />
            <QuickEmojiAction emoji="✅" />
            <QuickEmojiAction emoji="❤️" />
            <QuickEmojiAction emoji="🎉" />
            <QuickEmojiAction emoji="👀" />
            <QuickEmojiAction emoji="😂" />
        </div>
    )
}


const QuickEmojiAction = ({ emoji }: { emoji: string }) => {
    return <div>
        <span className="text-2xl">{emoji}</span>
    </div>
}

