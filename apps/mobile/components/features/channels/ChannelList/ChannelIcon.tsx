import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import HashIcon from '@assets/icons/HashIcon.svg';
import LockIcon from '@assets/icons/LockIcon.svg';

const iconSize = 18

export const ChannelIcon = ({ type, fill, size = iconSize }: { type: string, fill?: string, size?: number }) => {
    switch (type) {
        case 'Open':
            return <GlobeIcon fill={fill} height={size} width={size} />
        case 'Private':
            return <LockIcon fill={fill} height={size} width={size} />
        case 'Public':
            return <HashIcon fill={fill} height={size} width={size} />
        default:
            return <HashIcon fill={fill} height={size} width={size} />
    }
}