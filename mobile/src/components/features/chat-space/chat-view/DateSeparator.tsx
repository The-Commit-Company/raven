import { DateObjectToFormattedDateString } from '@/utils/operations/operations'
import { IonText } from '@ionic/react'

type Props = {
    date: string
}

const parseDateString = (date: string) => {
    const dateObj = new Date(date)
    return DateObjectToFormattedDateString(dateObj)
}
export const DateSeparator = ({ date }: Props) => {
    return (
        <div className='relative my-2 px-2'>
            <div className="absolute inset-0 flex items-center mx-4" aria-hidden="true">
                <div className="w-full border-t" style={{ borderColor: "var(--ion-color-light)" }} />
            </div>
            <div className="relative flex justify-center">
                <IonText className="px-2 text-sm bg-[var(--ion-background-color)]" color='medium'>{parseDateString(date)}</IonText>
            </div>
        </div>
    )
}