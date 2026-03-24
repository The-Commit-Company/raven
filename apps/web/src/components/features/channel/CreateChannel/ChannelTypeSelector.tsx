import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { Label } from '@components/ui/label'
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { useChannelTypeInfo } from './useChannelTypeInfo'
import _ from '@lib/translate'

interface ChannelTypeSelectorProps {
    value: RavenChannel['type']
    onChange: (value: RavenChannel['type']) => void
}

export const ChannelTypeSelector = ({ value, onChange }: ChannelTypeSelectorProps) => {
    const { helperText } = useChannelTypeInfo(value)

    return (
        <FormItem>
            <FormLabel>{_('Channel Type')}</FormLabel>
            <FormControl>
                <RadioGroup
                    onValueChange={onChange}
                    value={value}
                    className="flex gap-4"
                    aria-label="Select channel type"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Public" id="public" aria-describedby="channel-type-description" className='cursor-pointer'/>
                        <Label htmlFor="public" className="font-normal cursor-pointer">
                            {_('Public')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Private" id="private" aria-describedby="channel-type-description" className='cursor-pointer'/>
                        <Label htmlFor="private" className="font-normal cursor-pointer">
                            {_('Private')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Open" id="open" aria-describedby="channel-type-description" className='cursor-pointer'/>
                        <Label htmlFor="open" className="font-normal cursor-pointer">
                            {_('Open')}
                        </Label>
                    </div>
                </RadioGroup>
            </FormControl>
            <FormDescription className="min-h-12" id="channel-type-description">{helperText}</FormDescription>
            <FormMessage />
        </FormItem>
    )
}

