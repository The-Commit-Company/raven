import { FileExtensionIcon } from "../../../../utils/layout/FileExtensionIcon"
import { FileMessage } from "../../../../../../types/Messaging/Message"
import { getFileExtension, getFileName } from "../../../../utils/operations"
import { UserFields } from "@/utils/users/UserListProvider"
import { Box } from "@radix-ui/themes"

interface FileMessageBlockProps {
    message: FileMessage,
    user?: UserFields,
}

export const FileMessageBlock = ({ message }: FileMessageBlockProps) => {

    const fileExtension = getFileExtension(message.file)

    const fileName = getFileName(message.file)

    return <Box>

    </Box>

}