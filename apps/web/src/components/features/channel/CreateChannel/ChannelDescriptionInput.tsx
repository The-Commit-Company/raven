import { Textarea } from '@components/ui/textarea'

interface ChannelDescriptionInputProps {
    value: string
    onChange: (value: string) => void
}

export const ChannelDescriptionInput = ({ value, onChange }: ChannelDescriptionInputProps) => {
    return (
        <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Add a description to help others understand what this channel is for..."
            className="resize-none"
            rows={3}
            aria-label="Channel description"
        />
    )
}

