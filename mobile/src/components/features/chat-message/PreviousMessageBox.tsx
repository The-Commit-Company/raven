import { Message } from '../../../../../raven-app/src/types/Messaging/Message'
import { MarkdownRenderer } from '../../common/MarkdownRenderer'
import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString, getFileExtension, getFileName } from '../../../../../raven-app/src/utils/operations'
import { useContext } from 'react'
import { getFileExtensionIcon } from '../../../../../raven-app/src/utils/layout/fileExtensionIcon'
import { IoMdClose } from 'react-icons/io'
import { useFrappeGetDoc, useFrappePostCall } from 'frappe-react-sdk'
import { IonButton, IonCard, IonText } from '@ionic/react'
import { ErrorBanner } from '../../layout'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'

interface PreviousMessageBoxProps {
    previous_message_id?: string,
    previous_message_content?: Message,
    onReplyingToMessageClose?: () => void
}

export const PreviousMessageBox = ({ previous_message_id, previous_message_content, onReplyingToMessageClose }: PreviousMessageBoxProps) => {

    const { channelMembers, users } = useContext(ChannelContext)
    const MAX_TRUNCATED_LENGTH = 100

    if (previous_message_content) {
        return (
            <IonCard>
                <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <IonText className='font-semibold text-sm'>{channelMembers?.[previous_message_content.owner]?.full_name ?? users?.[previous_message_content.owner]?.full_name ?? previous_message_content.owner}</IonText>
                            <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <IonText className="font-thin text-xs">{DateObjectToFormattedDateStringWithoutYear(new Date(previous_message_content.creation))}</IonText>
                                <IonText className="font-thin text-xs">at</IonText>
                                <IonText className="font-thin text-xs">{DateObjectToTimeString(new Date(previous_message_content.creation))}</IonText>
                            </div>
                        </div>
                        {/* message content */}
                        {previous_message_content.message_type === 'Text' &&
                            <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <MarkdownRenderer content={previous_message_content.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                                </div>
                                {previous_message_content.text.length > MAX_TRUNCATED_LENGTH && <IonText className='text-sm'>...</IonText>}
                            </div>
                        }
                        {(previous_message_content.message_type === 'Image' || previous_message_content.message_type === 'File') &&
                            <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    {previous_message_content.message_type === 'Image' &&
                                        <img src={previous_message_content.file} alt='File preview' className='h-8 w-8' />}
                                </div>
                                <IonText className='text-sm overflow-hidden whitespace-nowrap text-ellipsis'>{getFileName(previous_message_content.file)}</IonText>
                            </div>
                        }
                    </div>

                    <IonButton
                        onClick={onReplyingToMessageClose}
                        size="small"
                        title='Remove message'
                        aria-label="Remove message"
                        fill="clear" >
                        <IoMdClose />
                    </IonButton>

                </div>
            </IonCard>
        )
    }

    if (previous_message_id) {

        const { data, error } = useFrappeGetDoc<Message>('Raven Message', previous_message_id)
        const { channelData } = useContext(ChannelContext)

        const { call, error: indexingError, reset } = useFrappePostCall<{ message: string }>("raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message")

        if (indexingError) {
            return <ErrorBanner heading='error while searching for previous message' />
        }
        if (error) {
            return <ErrorBanner heading='previous message not found, this message may have been deleted' />
        }
        if (data) {
            return <IonCard>
                <div>
                    <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <IonText color='primary' className='text-xs font-semibold'>{channelMembers?.[data.owner]?.full_name ?? users?.[data.owner]?.full_name ?? data.owner}</IonText>
                        <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <IonText className='text-xs font-thin'>{DateObjectToFormattedDateStringWithoutYear(new Date(data.creation))}</IonText>
                            <IonText className='text-xs font-thin'>at</IonText>
                            <IonText className='text-xs font-thin'>{DateObjectToTimeString(new Date(data.creation))}</IonText>
                        </div>
                    </div>
                    {/* message content */}
                    {data.message_type === 'Text' &&
                        <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <MarkdownRenderer content={data.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                            </div>
                            {data.text.length > MAX_TRUNCATED_LENGTH && <IonText className='text-sm'>...</IonText>}
                        </div>
                    }
                    {(data.message_type === 'Image' || data.message_type === 'File') &&
                        <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                {data.message_type === 'Image' &&
                                    <img src={data.file} alt='File preview' className='h-8 w-8' />
                                }
                            </div>
                            <IonText className='text-sm overflow-hidden whitespace-nowrap text-ellipsis'>{getFileName(data.file)}</IonText>
                        </div>
                    }
                </div>
            </IonCard>
        }
    }

    return null
}