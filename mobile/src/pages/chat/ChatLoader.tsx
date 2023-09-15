import { IonList, IonSkeletonText } from '@ionic/react'
import React, { PropsWithChildren } from 'react'

type Props = {}

export const ChatLoader = (props: Props) => {
    return (
        <IonList lines='none' className='flex flex-col'>
            <NonContinuationMessageItem>
                <TextLoaderItem />
            </NonContinuationMessageItem>
            <ContinuationMessageItem>
                <ImageLoaderItem />
            </ContinuationMessageItem>
            <ContinuationMessageItem>
                <TextLoaderItem />
            </ContinuationMessageItem>
            <NonContinuationMessageItem>
                <TextLoaderItem />
            </NonContinuationMessageItem>
            <NonContinuationMessageItem>
                <TextLoaderItem />
            </NonContinuationMessageItem>
            <ContinuationMessageItem>
                <TextLoaderItem />
            </ContinuationMessageItem>
            <ContinuationMessageItem>
                <TextLoaderItem />
            </ContinuationMessageItem>
            <ContinuationMessageItem>
                <TextLoaderItem />
            </ContinuationMessageItem>
            <NonContinuationMessageItem>
                <ImageLoaderItem />
            </NonContinuationMessageItem>
        </IonList>
    )
}

const UserAvatarLoaderItem = () => {
    return <IonSkeletonText animated className='h-8 w-8 rounded-md bg-[color:var(--ion-color-light)] object-cover' />
}

const ImageLoaderItem = () => {
    const width = Math.floor(Math.random() * 200) + 150
    const height = Math.floor(Math.random() * 100) + 100
    return <IonSkeletonText animated className='max-w-60 max-h-60' style={{ height, width }} />
}

const TextLoaderItem = () => {
    const width = Math.floor(Math.random() * 200) + 150
    const height = Math.floor(Math.random() * 50) + 20
    return <IonSkeletonText animated className='max-w-[280px]' style={{ height, width }} />
}

const ContinuationMessageItem = ({ children }: PropsWithChildren<{}>) => {
    return <div className='px-2 my-0'>
        <div className='px-2 rounded-md flex'>
            <div className='w-11 mt-0.5'>
            </div>
            {children}
        </div>
    </div>
}

const NonContinuationMessageItem = ({ children }: PropsWithChildren<{}>) => {

    return <div className='px-2 my-0'>
        <div className='px-2 mt-2 pt-1 rounded-md flex'>
            <div className='w-11 mt-0.5'>
                <UserAvatarLoaderItem />
            </div>
            {children}
        </div>
    </div>
}