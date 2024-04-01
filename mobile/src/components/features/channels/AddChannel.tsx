import { IonContent, ToastOptions, IonModal, useIonToast, IonHeader } from "@ionic/react";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { useHistory } from "react-router-dom";
import { ErrorBanner } from "../../layout";
import { useChannelList } from "@/utils/channel/ChannelListProvider";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, RadioGroup, Text, TextArea, Theme } from "@radix-ui/themes";

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

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <IonModal ref={modal} onDidDismiss={handleCancel} isOpen={isOpen} presentingElement={presentingElement}>

                    <IonHeader>
                        <Theme>
                            <div className='py-4 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b'>
                                <div className="w-11">
                                    <Button
                                        size='3' variant="ghost" color='gray' onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                                <Text className="text-base cal-sans font-medium">Create Channel</Text>
                                <div>
                                    <Button
                                        variant="ghost"
                                        color='iris'
                                        size='3'
                                        onClick={form.handleSubmit(onSubmit)}
                                        type='submit'
                                    >
                                        Create
                                    </Button>
                                </div>
                            </div>
                        </Theme>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <Theme accentColor="iris">
                            <ErrorBanner error={channelCreationError} />
                            <div className="flex flex-col p-2 gap-4">
                                <FormField
                                    name='channel_name'
                                    control={form.control}
                                    rules={{
                                        required: "Channel name is required",
                                        maxLength: {
                                            value: 50,
                                            message: "Channel name can be atmost 50 characters."
                                        },
                                        pattern: {
                                            // no special characters allowed
                                            // cannot start with a space
                                            value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                            message: "Channel name can only contain letters, numbers and hyphens."
                                        }
                                    }}
                                    render={({ field, formState }) => (
                                        <FormItem>
                                            <FormLabel>Channel Name <span className='text-rose-600'>*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    required
                                                    autoCapitalize="off"
                                                    className="w-full"
                                                    autoComplete="off"
                                                    placeholder='e.g. red-wedding-planning, joffrey-memes'
                                                    aria-label="Channel Name"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value?.toLowerCase().replace(' ', '-') ?? '')}
                                                />
                                            </FormControl>
                                            <FormMessage>{formState.errors && formState.errors?.channel_name?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="channel_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Channel Description</FormLabel>
                                            <FormControl>
                                                <TextArea
                                                    size='3'
                                                    placeholder="Great wine and food. What could go wrong?"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="channel_type"
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel className="font-semibold">Channel Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup.Root
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    color='iris'
                                                >
                                                    <div className="flex flex-col">
                                                        <FormItem className="flex items-center space-y-1 py-3">
                                                            <FormLabel className="font-normal items-center flex gap-2 grow">
                                                                <BiHash size='20' />
                                                                <Text size='3' as='span'>Public</Text>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroup.Item value="Public" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-y-1 py-3">
                                                            <FormLabel className="font-normal items-center flex gap-2 grow">
                                                                <BiLockAlt size='20' />
                                                                <Text as='span' size='3'>Private</Text>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroup.Item value="Private" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-y-1 py-3">
                                                            <FormLabel className="font-normal items-center flex gap-2 grow">
                                                                <BiGlobe size='18' />
                                                                <Text as='span' size='3'>Open</Text>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroup.Item value="Open" />
                                                            </FormControl>
                                                        </FormItem>
                                                    </div>
                                                </RadioGroup.Root>
                                            </FormControl>
                                            <FormDescription size='2'>
                                                {form.watch("channel_type") === 'Public' && <span>When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.</span>}
                                                {form.watch("channel_type") === 'Private' && <span>When a channel is set to private, it can only be viewed or joined by invitation.</span>}
                                                {form.watch("channel_type") === 'Open' && <span>When a channel is set to open, everyone is a member.</span>}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Theme>
                    </IonContent>

                </IonModal>
            </form>
        </Form >

    )
}