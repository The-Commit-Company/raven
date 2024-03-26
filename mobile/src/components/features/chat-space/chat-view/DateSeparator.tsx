import { DateObjectToFormattedDateString } from '@/utils/operations/operations'

type Props = {
    date: string
}

const parseDateString = (date: string) => {
    const dateObj = new Date(date)
    return DateObjectToFormattedDateString(dateObj)
}
export const DateSeparator = ({ date }: Props) => {
    return (
        <div className='relative flex items-center my-2 px-2'>
            <div className="grow border-t border-foreground/20"></div>
            <span className="shrink px-2 text-xs font-semibold text-foreground/80">{parseDateString(date)}</span>
            <div className="grow border-t border-foreground/20"></div>
        </div>
    )
}