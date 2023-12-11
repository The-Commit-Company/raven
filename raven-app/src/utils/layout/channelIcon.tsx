import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi';
import { RavenChannel } from "../../../../types/RavenChannelManagement/RavenChannel";
import { IconBaseProps } from 'react-icons';

export const getChannelIcon = (type: RavenChannel['type']) => {

    switch (type) {
        case 'Private': return BiLockAlt
        case 'Open': return BiGlobe
        default: return BiHash
    }
}

interface ChannelIconProps extends IconBaseProps {
    type: RavenChannel['type']
}

export const ChannelIcon = ({ type, ...props }: ChannelIconProps) => {

    if (!type) return null

    if (type === 'Private') return <BiLockAlt {...props} />
    if (type === 'Open') return <BiGlobe {...props} />
    return <BiHash {...props} />

}
