import { Button, ButtonProps } from "@components/nativewindui/Button"
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

    const { shareFile, loading, error } = useFileShare(uri)

    const handleShare = async () => {
        shareFile()
        if (error) {
            toast.error(error)
        }
    }

    return (
        <Button variant="plain" size="icon" onPress={handleShare} {...buttonProps} disabled={loading} >
            <ShareIcon height={20} width={20} color={colors.icon} {...iconProps} />
        </Button>
    )
}

export default ShareButton