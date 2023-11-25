import { Globe, Hash, Lock, LucideProps } from "lucide-react";
import { RavenChannel } from "../../../../types/RavenChannelManagement/RavenChannel";

export const getChannelIcon = (type: RavenChannel['type']) => {

    switch (type) {
        case 'Private': return Lock
        case 'Open': return Globe
        default: return Hash
    }
}

interface ChannelIconProps extends LucideProps {
    type: RavenChannel['type']
}

export const ChannelIcon = ({ type, ...props }: ChannelIconProps) => {

    if (!type) return null

    if (type === 'Private') return <Lock {...props} />
    if (type === 'Open') return <Globe {...props} />
    return <Hash {...props} />

}
