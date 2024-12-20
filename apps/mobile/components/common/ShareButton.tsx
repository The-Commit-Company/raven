import { Button, ButtonProps } from "@components/nativewindui/Button"
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import ShareIcon from "@assets/icons/ShareIcon.svg"
import { toast } from 'sonner-native'
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import useFileShare from "@hooks/useFileShare"

interface ShareButtonProps {
    uri: string
    buttonProps?: ButtonProps
    iconProps?: SvgProps
}

const ShareButton = ({ uri, buttonProps, iconProps }: ShareButtonProps) => {

    const { colors } = useColorScheme()

    const { shareFile, loading, error } = useFileShare()

    return (
        <Button variant="plain" size="icon" onPress={ } {...buttonProps} >
            <ShareIcon height={20} width={20} color={colors.icon} {...iconProps} />
        </Button>
    )
}

export default ShareButton