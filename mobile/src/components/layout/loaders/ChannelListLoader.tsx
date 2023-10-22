import { IonList, IonSkeletonText } from '@ionic/react'

export const ChannelListLoader = () => {
    return (
        <IonList lines='none' className='flex flex-col'>
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
            <ChannelLoaderItem />
        </IonList>
    )
}

const ChannelIconLoaderItem = () => {
    return <IonSkeletonText animated className='h-8 w-8 rounded-md bg-[color:var(--ion-color-light)] object-cover' />
}

const ChannelNameLoaderItem = () => {
    const width = Math.floor(Math.random() * 200) + 150
    return <IonSkeletonText animated className='max-w-[280px]' style={{ height: 32, width }} />
}

const ChannelLoaderItem = () => {
    return <div className='px-2 my-0'>
        <div className='px-2 mt-2 rounded-md flex'>
            <div className='w-11'>
                <ChannelIconLoaderItem />
            </div>
            <ChannelNameLoaderItem />
        </div>
    </div>
}