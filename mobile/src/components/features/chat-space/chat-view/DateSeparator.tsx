import { Text } from "@radix-ui/themes"

type Props = {
    date: string
}

export const DateSeparator = ({ date }: Props) => {
    return (
        <div className='relative flex items-center my-2 gap-2 px-2' id={`date-${date}`}>
            <div className="grow border-t border-gray-7"></div>
            <Text as='span' size='1' color='gray' className="font-semibold shrink">{date}</Text>
            <div className="grow border-t border-gray-7"></div>
        </div>
    )
}