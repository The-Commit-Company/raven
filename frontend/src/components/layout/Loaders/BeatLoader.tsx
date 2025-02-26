import { FlexProps, Text } from "@radix-ui/themes"
import { HStack } from "../Stack"
import clsx from "clsx"

type BeatLoaderProps = FlexProps & {
    text?: string
}

const BeatLoader = ({ text = 'Loading...', ...props }: BeatLoaderProps) => {
    return <HStack align='center' {...props} className={clsx('gap-1.5 px-0.5 py-2 w-full justify-center', props.className)}>
        <div className="flex items-center space-x-1 -mb-0.5">
            <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <Text size={'1'} weight='medium' as='span'>{text}</Text>
    </HStack>
}

export default BeatLoader