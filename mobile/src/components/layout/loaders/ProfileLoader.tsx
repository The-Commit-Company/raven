import { IonList, IonSkeletonText, IonText, IonThumbnail } from "@ionic/react"

export interface Props { }

export const ProfileLoader = (props: Props) => {
    return (
        <IonList>
            <div className="my-8 flex justify-center flex-col items-center ion-text-center space-y-2">
                <IonThumbnail className="w-32 h-32 rounded-full">
                    <IonSkeletonText animated style={{ height: '100%', width: '100%' }} className="w-32 h-32 mb-2 rounded-full"> </IonSkeletonText>
                </IonThumbnail>
                <h2 className='font-bold h2 text-2xl'>
                    <IonSkeletonText animated style={{ height: '1.5rem', width: 180 }} />
                </h2>
                <span>
                    <IonText color="primary">
                        <IonSkeletonText animated style={{ fontSize: '16px', height: '1rem', width: 300 }} />
                    </IonText>
                </span>
            </div>
        </IonList>
    )
}