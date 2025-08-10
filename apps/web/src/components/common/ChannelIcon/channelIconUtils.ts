import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi';
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel';

export const getChannelIcon = (type: RavenChannel['type']) => {
    switch (type) {
        case 'Private': return BiLockAlt
        case 'Open': return BiGlobe
        default: return BiHash
    }
} 