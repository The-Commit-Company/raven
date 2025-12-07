import { Input } from "@components/ui/input"
import { InputFileList, AddFileButton } from "./InputFiles"
import SendButton from "./SendButton"
import { forwardRef } from "react"

interface ChatInputProps {
    channelID: string
}
const ChatInput = forwardRef<HTMLFormElement, ChatInputProps>(({ channelID }, ref) => {

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // const formData = new FormData(e.currentTarget)
        // const message = formData.get('message') as string
        // console.log(message)
    }
    return (
        <form ref={ref} onSubmit={onSubmit} className="p-2 pb-4 w-full flex flex-col gap-2">
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
        </form>
    )
})

export default ChatInput