import { IonButton, IonButtons, IonContent, ToastOptions, IonHeader, IonModal, IonText, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { useHistory } from "react-router-dom";
import { ErrorBanner } from "../../layout";
import { useChannelList } from "@/utils/channel/ChannelListProvider";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddChannelProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction
}

type CreateChannelInputs = {
    channel_name: string,
    channel_description: string
    channel_type: 'Private' | 'Public' | 'Open'
}

export const AddChannel = ({ presentingElement, isOpen, onDismiss }: AddChannelProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const form = useForm<CreateChannelInputs>({
        defaultValues: {
            channel_name: "",
            channel_description: "",
            channel_type: "Public"
        }
    })
    const [channelType, setChannelType] = useState<CreateChannelInputs['channel_type']>('Public')

    const { createDoc, error: channelCreationError, reset } = useFrappeCreateDoc()

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

    const history = useHistory()

    const onSubmit = (data: CreateChannelInputs) => {
        let name = data.channel_name
        createDoc('Raven Channel', {
            channel_name: data.channel_name,
            channel_description: data.channel_description,
            type: data.channel_type
        }).catch((err) => {
            if (err.httpStatus === 409) {
                presentToast("Channel name already exists.", 'danger')
            }
            else {
                presentToast("Error while creating the channel.", 'danger')
            }
        }).then((result) => {
            name = result.name
            form.reset()
            return mutate()
        }).then(() => {
            presentToast("Channel created successfully.", 'success')
            onDismiss()
            history.push(`channel/${name}`)
        })
    }

    const handleCancel = () => {
        form.reset()
        onDismiss()
    }


    return (
        <IonModal ref={modal} onDidDismiss={handleCancel} isOpen={isOpen} presentingElement={presentingElement}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color={'medium'} onClick={handleCancel}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Create Channel</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color={'primary'} onClick={form.handleSubmit(onSubmit)}>Create</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <ErrorBanner error={channelCreationError} />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ul>
                            <div>
                                <li className="list-none">
                                    <div className="p-2">
                                        <FormField
                                            name='channel_name'
                                            control={form.control}
                                            rules={{
                                                required: "Channel name is required",
                                                maxLength: {
                                                    value: 50,
                                                    message:"Channel name can be atmost 50 characters."
                                                },
                                                pattern: {
                                                    // no special characters allowed
                                                    // cannot start with a space
                                                    value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                                    message: "Channel name can only contain letters, numbers and hyphens."
                                                }
                                            }}
                                            render={({ field, formState }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="font-semibold">Channel Name <span className='text-rose-600'>*</span></FormLabel>
                                                    <div className="flex items-center gap-2">
                                                        <FormControl>
                                                            <Input
                                                                required
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                placeholder='bugs-bugs-bugs'
                                                                aria-label="Channel Name"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.value?.toLowerCase().replace(' ', '-') ?? '')}                       
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage>{formState.errors && formState.errors?.channel_name?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </li>
                            </div>
                            <Separator />
                            <div>
                                <li className="list-none">
                                    <div className="p-2">
                                        <FormField
                                            control={form.control}
                                            name="channel_description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold">Channel Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="A channel for reporting bugs"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </li>
                            </div>
                            <Separator />
                            <div>
                                <div className="p-2">
                                    <FormField
                                        control={form.control}
                                        name="channel_type"
                                        render={({ field }) => (
                                            <FormItem >
                                                <FormLabel className="font-semibold">Channel Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col"
                                                    >
                                                        <FormItem className="flex items-center space-y-0 p-1">
                                                            <FormLabel className="font-normal flex gap-2 grow">
                                                                <BiHash size='16' />
                                                                <span>Public</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroupItem value="Public" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <Separator />
                                                        <FormItem className="flex items-center space-y-0 p-1">
                                                            <FormLabel className="font-normal flex gap-2 grow">
                                                                <BiLockAlt size='16' />
                                                                <span>Private</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroupItem value="Private" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <Separator />
                                                        <FormItem className="flex items-center space-y-0 p-1">
                                                            <FormLabel className="font-normal flex gap-2 grow">
                                                                <BiGlobe size='16' />
                                                                <span>Open</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroupItem value="Open" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <Separator />
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormDescription>
                                                    {form.watch("channel_type") === 'Public' && <IonText className="text-sm" color='medium'>When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.</IonText>}
                                                    {form.watch("channel_type") === 'Private' && <IonText className="text-sm" color='medium'>When a channel is set to private, it can only be viewed or joined by invitation.</IonText>}
                                                    {form.watch("channel_type") === 'Open' && <IonText className="text-sm" color='medium'>When a channel is set to open, everyone is a member.</IonText>}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                        </ul>
                    </form>
                </Form>
            </IonContent>
        </IonModal>
    )
}