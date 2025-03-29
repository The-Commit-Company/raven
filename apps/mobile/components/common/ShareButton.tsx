import ShareIcon from "@assets/icons/ShareIcon.svg"
import { toast } from 'sonner-native'
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import useFileShare from "@hooks/useFileShare"
import { TouchableOpacity } from "react-native-gesture-handler"

interface ShareButtonProps {
    uri: string
    iconProps?: SvgProps
}

const ShareButton = ({ uri, iconProps }: ShareButtonProps) => {

    const { colors } = useColorScheme()

    const { shareFile, loading, error } = useFileShare(uri)

    const handleShare = () => {
        shareFile()
        if (error) {
            toast.error(error)
        }
    }

    return (
        <TouchableOpacity hitSlop={10} className="m-4" onPress={handleShare} disabled={loading} >
            <ShareIcon height={20} width={20} color={colors.icon} {...iconProps} />
        </TouchableOpacity>
    )
}

export default ShareButton