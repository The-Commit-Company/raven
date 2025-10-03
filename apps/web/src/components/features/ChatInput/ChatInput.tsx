import { Input } from "@components/ui/input"
import { InputFileList, AddFileButton } from "./InputFiles"
import SendButton from "./SendButton"

interface ChatInputProps {
    channelID: string
}
const ChatInput = ({ channelID }: ChatInputProps) => {
    return (
        <div className="p-2 pb-4 w-full flex flex-col gap-2">
            <InputFileList channelID={channelID} />
            <div className="flex gap-2 items-end rounded-sm w-full">
                <div className="flex items-center justify-center">
                    <AddFileButton channelID={channelID} />
                </div>
                <div className="w-full">
                    <Input type="text" placeholder="Type a message..." className="w-full" autoFocus />
                </div>
                <SendButton channelID={channelID} />
            </div>
        </div>
    )
}

export default ChatInput