import { useCallback } from 'react'
import { Input } from '@components/ui/input'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'

interface ChannelNameInputProps {
    value: string
    onChange: (value: string) => void
    channelType: RavenChannel['type']
}

export const ChannelNameInput = ({ value, onChange, channelType }: ChannelNameInputProps) => {
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            // Convert to lowercase and replace spaces with hyphens
            const newValue = event.target.value?.toLowerCase().replace(/\s+/g, '-')
            onChange(newValue)
        },
        [onChange]
    )

    const getChannelIcon = () => {
        switch (channelType) {
            case 'Private':
                return <BiLockAlt className="h-4 w-4" />
            case 'Open':
                return <BiGlobe className="h-4 w-4" />
            default:
                return <BiHash className="h-4 w-4" />
        }
    }

    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                {getChannelIcon()}
            </div>
            <Input
                value={value}
                onChange={handleChange}
                maxLength={50}
                placeholder="e.g. marketing, design-team, project-alpha"
                className="pl-9 pr-12"
                autoFocus
                aria-describedby="channel-name-counter"
                aria-label={`Channel name (${channelType})`}
            />
            <div
                id="channel-name-counter"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-light"
                aria-live="polite"
                aria-atomic="true"
            >
                <span className="sr-only">{50 - value.length} characters remaining</span>
                <span aria-hidden="true">{50 - value.length}</span>
            </div>
        </div>
    )
}

