import { Text } from '@components/nativewindui/Text'
import { FileMessage } from '@raven/types/common/Message'
import { Pressable } from 'react-native'

type Props = {
    message: FileMessage
}

const FileMessageRenderer = ({ message }: Props) => {

    // const fileExtension = getFileExtension(message.file)

    // const fileName = getFileName(message.file)

    // const isVideo = isVideoFile(fileExtension)

    // const isPDF = fileExtension === 'pdf'
    return (
        <Pressable>
            <Text className='text-xs text-foreground/50'>{message.file.split('/').pop()}</Text>
        </Pressable>
    )
}

export default FileMessageRenderer