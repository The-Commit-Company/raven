import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonRadio, IonRadioGroup, IonText, IonTextarea, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { useHistory } from "react-router-dom";
import { ErrorBanner } from "../../layout";

interface AddChannelProps {
    presentingElement: HTMLElement | undefined
}

type CreateChannelInputs = {
    channel_name: string,
    channel_description: string
    channel_type: 'Private' | 'Public' | 'Open'
}

export const AddChannel = ({ presentingElement }: AddChannelProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateChannelInputs>()
    const [channelType, setChannelType] = useState<CreateChannelInputs['channel_type']>('Public')

    const [value, setValue] = useState<string>('')
    const handleChange = (event: any) => {
        setValue(event.currentTarget.value?.toString().replace(' ', '-') ?? '')
    }

    const { createDoc, error } = useFrappeCreateDoc()

    const [present] = useIonToast()

    const presentToast = (message: string) => {
        present({
            message: message,
            duration: 1500,
            position: 'bottom',
        })
    }

    const history = useHistory()

    const onSubmit = (data: CreateChannelInputs) => {
        createDoc('Raven Channel', {
            ...data,
            type: channelType
        }).then(result => {
            if (result) {
                presentToast(`Channel ${result.name} created successfully`)
                history.push(`channel/${result.name}`)
                modal.current?.dismiss()
            }
        }).catch((err) => {
            if (err.httpStatus === 409) {
                presentToast("Channel name already exists")
            }
            else {
                presentToast("Error creating channel")
            }
        })
    }

    const onDismiss = () => {
        reset()
        modal.current?.dismiss()
    }

    return (
        <IonModal ref={modal} trigger='channel-create' presentingElement={presentingElement}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color={'medium'} onClick={onDismiss}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Create Channel</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color={'primary'} onClick={handleSubmit(onSubmit)}>Create</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {error && <ErrorBanner error={error} />}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <IonList>
                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Channel Name</IonLabel>
                            </IonItemDivider>
                            <IonItem lines='none' className="pb-2">
                                <div slot='start'>
                                    {channelType === 'Public' && <BiHash size='16' color='var(--ion-color-medium)' />}
                                    {channelType === 'Private' && <BiLockAlt size='16' color='var(--ion-color-medium)' />}
                                    {channelType === 'Open' && <BiGlobe size='16' color='var(--ion-color-medium)' />}
                                </div>
                                <IonInput
                                    required
                                    {...register("channel_name", {
                                        required: "Channel name is required",
                                        maxLength: 50,
                                        pattern: {
                                            // no special characters allowed
                                            // cannot start with a space
                                            value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                            message: "Channel name can only contain letters, numbers and hyphens."
                                        }
                                    })}
                                    maxlength={50}
                                    onIonInput={handleChange}
                                    value={value}
                                    placeholder='bugs-bugs-bugs'
                                    className={!!errors?.channel_name ? 'ion-invalid ion-touched' : ''}
                                    aria-label="Channel Name"
                                    errorText={errors?.channel_name?.message}
                                />
                            </IonItem>
                        </IonItemGroup>

                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Description</IonLabel>
                            </IonItemDivider>
                            <IonItem lines='none'>
                                <IonTextarea
                                    {...register("channel_description")}
                                    placeholder='A channel for reporting bugs'
                                    className={errors?.channel_description ? 'ion-invalid' : ''}
                                    aria-label="Channel Description (optional)"
                                    autoGrow
                                    rows={4}
                                />
                            </IonItem>
                        </IonItemGroup>
                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Channel Type</IonLabel>
                            </IonItemDivider>
                            <IonRadioGroup value={channelType} onIonChange={e => setChannelType(e.detail.value)}>
                                <IonItem>
                                    <div slot='start'>
                                        <BiHash size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Public">
                                        Public
                                    </IonRadio>
                                </IonItem>
                                <IonItem>
                                    <div slot='start'>
                                        <BiLockAlt size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Private">
                                        Private
                                    </IonRadio>
                                </IonItem>

                                <IonItem>
                                    <div slot='start'>
                                        <BiGlobe size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Open">
                                        Open
                                    </IonRadio>
                                </IonItem>

                                <IonItem lines='none' className="pt-2">
                                    {channelType === 'Public' && <IonText className="text-sm" color='medium'>When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.</IonText>}
                                    {channelType === 'Private' && <IonText className="text-sm" color='medium'>When a channel is set to private, it can only be viewed or joined by invitation.</IonText>}
                                    {channelType === 'Open' && <IonText className="text-sm" color='medium'>When a channel is set to open, everyone is a member.</IonText>}
                                </IonItem>

                            </IonRadioGroup>

                        </IonItemGroup>

                    </IonList>
                </form>
            </IonContent>
        </IonModal>
    )
}