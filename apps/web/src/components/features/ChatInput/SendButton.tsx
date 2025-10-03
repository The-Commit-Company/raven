import { Button } from "@components/ui/button"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { useAtom } from "jotai"
import { SendIcon } from "lucide-react"
import { uploadedFilesAtom } from "./useFileInput"

type SendButtonProps = {
    channelID: string
}

const SendButton = ({ channelID }: SendButtonProps) => {

    const { createDoc } = useFrappeCreateDoc()

    const [files, setFiles] = useAtom(uploadedFilesAtom(channelID))

    /** 
     * 
     * When the user clicks the send button, we need to upload the editor content as well as upload all the files.
     * 
     * There might be cases where the files have not yet uploaded to the server. In such cases, we should wait for the files to upload and then create the messages.
     * 
     */

    const onClick = () => {

        /** TODO: Check for uploading files and queue messages */

        const promises = files.map(f => createDoc('Raven Message', {
            channel_id: channelID,
            message_type: "File",
            file: f.fileURL
        }))

        Promise.all(promises).then(() => {
            setFiles([])
        })
    }
    return (
        <div className="flex items-center justify-center">
            <Button size="icon" onClick={onClick}>
                <SendIcon />
            </Button>
        </div>
    )
}

export default SendButton