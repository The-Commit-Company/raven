import { IonAvatar, IonTitle } from "@ionic/react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext } from "react"
import Avatar from "react-avatar"

export const DirectMessageHeader = ({ name, image }: { name: string, image?: string }) => {

    const { url } = useContext(FrappeContext) as FrappeConfig

    return (<IonTitle>
        <div className='flex flex-col items-center justify-start'>
            <div className='flex items-center justify-start'>
                {image ?
                    <IonAvatar className="h-10 w-10">
                        <img src={url + image} />
                    </IonAvatar>
                    :
                    <Avatar src={url + image} name={name} size='40' round />}
                <h1 className='ml-2'>
                    {name}
                </h1>
            </div>
        </div>
    </IonTitle>)
}