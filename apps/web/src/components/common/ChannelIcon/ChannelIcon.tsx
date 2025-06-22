import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi';
import { IconBaseProps } from 'react-icons';
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel';

interface ChannelIconProps extends IconBaseProps {
    type: RavenChannel['type']
}

export const ChannelIcon = ({ type, ...props }: ChannelIconProps) => {
    if (!type) return null
    if (type === 'Private') return <BiLockAlt {...props} />
    if (type === 'Open') return <BiGlobe {...props} />
    return <BiHash {...props} />
}
