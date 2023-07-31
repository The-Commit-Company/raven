import { IonSpinner, IonText } from '@ionic/react'
import React from 'react'

type Props = {
    text?: string
}

export const FullPageLoader = ({ text = "Ravens are finding their way to you..." }: Props) => {
    return (
        <div className='h-full w-full flex justify-center items-center flex-col'>
            <IonSpinner color={'dark'} name='crescent' />
            <IonText color='medium' className='text-sm mt-3'>{text}</IonText>
        </div>
    )
}