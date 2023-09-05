import React, { useState } from 'react'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonProgressBar, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { addSharp, alertCircle, checkmarkCircle, closeCircleOutline } from 'ionicons/icons';
import { getFileExtension } from '../../../../../raven-app/src/utils/operations';
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensions';
import { useFrappeCreateDoc, useFrappeFileUpload, useFrappeUpdateDoc } from 'frappe-react-sdk';

type Props = {
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    pickFiles: () => void,
    channelID: string,
    onMessageSend: () => void
}
export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
export const FileUploadModal = ({ files, setFiles, pickFiles, channelID, onMessageSend }: Props) => {

    const [currentFileName, setCurrentFileName] = useState('')
    const [completedFiles, setCompletedFiles] = useState<string[]>([])
    const { createDoc } = useFrappeCreateDoc()
    const { upload } = useFrappeFileUpload()
    const { updateDoc } = useFrappeUpdateDoc()

    const [loading, setLoading] = useState(false)
    const [errorMap, setErrorMap] = React.useState<{ [key: string]: string }>({})


    const uploadFiles = async () => {
        setLoading(true)
        // Loop over all files and upload them
        for (let i = 0; i < files.length; i++) {
            setCurrentFileName(files[i].name)
            const file = files[i]
            let message_doc = ''
            await createDoc('Raven Message', {
                channel_id: channelID
            }).then(d => {
                message_doc = d.name
                return upload(file, {
                    doctype: 'Raven Message',
                    docname: d.name,
                    fieldname: 'file',
                    isPrivate: true,
                })
            }).then((f) => {
                updateDoc('Raven Message', message_doc, {
                    file: f.file_url,
                    message_type: fileExt.includes(getFileExtension(f.name)) ? "Image" : "File",
                })
                setCompletedFiles(cf => [...cf, file.name])
            }).catch((e) => {
                setErrorMap(em => ({ ...em, [file.name]: e.message }))
            })
        }
        onMessageSend()
        clearFiles()
    }
    const clearFiles = () => {
        setCurrentFileName('')
        setCompletedFiles([])
        setLoading(false)
        setErrorMap({})
        setFiles([])
    }

    const removeFile = (file: File) => {
        setFiles(f => f.filter((f) => f.name !== file.name))
    }

    const overallProgress = completedFiles.length / files.length

    return (
        <IonModal isOpen={files.length > 0}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot='start'>
                        <IonButton color='medium' onClick={clearFiles} disabled={loading}>
                            Close
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Upload files</IonTitle>
                    <IonButtons slot='end'>
                        <IonButton className='font-bold' disabled={loading} onClick={uploadFiles}>
                            Upload
                        </IonButton>
                    </IonButtons>
                    <IonProgressBar type="determinate" hidden={!loading} value={overallProgress}></IonProgressBar>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className='py-2 mt-2 px-4 text-sm'>
                    <IonText color='medium'>Files will be shared with all channel members.</IonText>
                </div>
                <IonList>
                    {files.map((f, i) => <IonItem key={f.name + i}>
                        <div slot='start'>
                            {getFileExtensionIcon(getFileExtension(f.name))}
                        </div>
                        <IonLabel>{f.name}</IonLabel>
                        {!loading &&
                            <IonButton size='small' slot='end' color='danger' fill='clear' onClick={() => removeFile(f)}>
                                <IonIcon size='small' slot='icon-only' icon={closeCircleOutline} />
                            </IonButton>
                        }
                        {currentFileName === f.name && <IonSpinner slot='end' name="crescent"></IonSpinner>}
                        {completedFiles.includes(f.name) && <IonIcon size='small' slot='end' color='success' icon={checkmarkCircle} />}
                        {errorMap[f.name] && <IonIcon size='small' slot='end' color='danger' icon={alertCircle} />}
                    </IonItem>)}
                    {!loading && <IonItem lines='full' detail={false} button onClick={pickFiles}>
                        <IonIcon slot='start' color='primary' icon={addSharp} />
                        <IonLabel color='primary'>Add more</IonLabel>
                    </IonItem>
                    }
                </IonList>
            </IonContent>
        </IonModal>
    )
}