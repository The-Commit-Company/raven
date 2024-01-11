import { IonButton, IonButtons, IonContent, ToastOptions, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonTextarea, IonToolbar, useIonToast } from "@ionic/react";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { ChannelListItem, useChannelList } from "@/utils/channel/ChannelListProvider";
import { ErrorBanner } from "@/components/layout";

interface ChannelEditProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    channel: ChannelListItem
}

type ChannelInputs = {
    channel_name: string,
    channel_description: string
}

export const ChannelInfoEditModal = ({ presentingElement, isOpen, onDismiss, channel }: ChannelEditProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { register, control, handleSubmit, formState: { errors }, setValue, reset: resetForm } = useForm<ChannelInputs>({
        defaultValues: {
            channel_name: channel.channel_name,
            channel_description: channel.channel_description
        }
    })

    const { updateDoc, error } = useFrappeUpdateDoc()

    const { mutate } = useChannelList()

    const [present] = useIonToast()

    const presentToast = (message: string, color: ToastOptions['color']) => {
        present({
            message,
            duration: 1500,
            color,
            position: 'bottom',
        })
    }

    const onSubmit = async (data: ChannelInputs) => {

        return updateDoc('Raven Channel', channel.name, {
            channel_name: data.channel_name,
            channel_description: data.channel_description
        }).then(() => {
            resetForm()
            return mutate()
        }).then(() => {
            presentToast("Channel updated successfully.", 'success')
            onDismiss()
        })
    }


    const handleNameChange = useCallback((value?: string | null) => {
        setValue('channel_name', value?.toLowerCase().replace(' ', '-') ?? '')
    }, [setValue])


    return (
        <IonModal ref={modal} onDidDismiss={onDismiss} isOpen={isOpen} presentingElement={presentingElement}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color={'medium'} onClick={onDismiss}>Cancel</IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton color={'primary'} onClick={handleSubmit(onSubmit)}>Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <ErrorBanner error={error} />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <IonList>
                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Channel Name</IonLabel>
                            </IonItemDivider>
                            <IonItem lines='none' className="pb-2">
                                <div slot='start'>
                                    {channel.type === 'Public' && <BiHash size='16' color='var(--ion-color-medium)' />}
                                    {channel.type === 'Private' && <BiLockAlt size='16' color='var(--ion-color-medium)' />}
                                    {channel.type === 'Open' && <BiGlobe size='16' color='var(--ion-color-medium)' />}
                                </div>
                                <Controller
                                    name='channel_name'
                                    control={control}
                                    rules={{
                                        required: "Channel name is required",
                                        maxLength: 50,
                                        pattern: {
                                            // no special characters allowed
                                            // cannot start with a space
                                            value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                            message: "Channel name can only contain letters, numbers and hyphens."
                                        }
                                    }}
                                    render={({ field }) => <IonInput
                                        required
                                        maxlength={50}
                                        autoCapitalize="off"
                                        value={field.value}
                                        placeholder='bugs-bugs-bugs'
                                        className={!!errors?.channel_name ? 'ion-invalid ion-touched' : ''}
                                        aria-label="Channel Name"
                                        errorText={errors?.channel_name?.message}
                                        onIonInput={(e) => handleNameChange(e.target.value as string)}
                                    />}
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
                                    placeholder='Add description'
                                    className={errors?.channel_description ? 'ion-invalid' : ''}
                                    aria-label="Channel Description (optional)"
                                    autoGrow
                                    rows={4}
                                />
                            </IonItem>
                        </IonItemGroup>

                    </IonList>
                </form>
            </IonContent>
        </IonModal>
    )
}