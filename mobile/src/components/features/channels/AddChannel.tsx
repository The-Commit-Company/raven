import { IonContent, ToastOptions, IonModal, useIonToast, IonHeader } from "@ionic/react";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { useHistory } from "react-router-dom";
import { ErrorBanner } from "../../layout";
import { useChannelList } from "@/utils/channel/ChannelListProvider";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, RadioGroup, Text, TextArea, TextField, Theme } from "@radix-ui/themes";

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

    const channelType = form.watch("channel_type")

    const { channelIcon, helperText } = useMemo(() => {
        switch (channelType) {
            case 'Private':
                return {
                    channelIcon: <BiLockAlt />,
                    helperText: 'When a channel is set to private, it can only be viewed or joined by invitation.'
                }
            case 'Open':
                return {
                    channelIcon: <BiGlobe />,
                    helperText: 'When a channel is set to open, everyone is a member.'
                }
            default:
                return {
                    channelIcon: <BiHash />,
                    helperText: 'When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.'
                }
        }
    }, [channelType])


    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <IonModal ref={modal} onDidDismiss={handleCancel} isOpen={isOpen} presentingElement={presentingElement}>

                    <IonHeader>
                        <Theme accentColor="iris">
                            <div className='py-3 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b rounded-t-3xl'>
                                <div className="w-11">
                                    <Button
                                        size='3' variant="ghost" color='gray' onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                                <Text className="cal-sans font-medium" size='4'>Create Channel</Text>
                                <div>
                                    <Button
                                        variant="ghost"
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
                    <IonContent className="ion-padding bg-gray-2">
                        <Theme accentColor="iris">
                            <ErrorBanner error={channelCreationError} />
                            <div className="flex flex-col py-1.5 gap-4">
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
                                            <FormLabel>Name <span className='text-rose-600'>*</span></FormLabel>
                                            <FormControl>
                                                <TextField.Root
                                                    required
                                                    autoCapitalize="off"
                                                    className="w-full"
                                                    autoComplete="off"
                                                    maxLength={50}
                                                    size={'3'}
                                                    placeholder='e.g. red-wedding-planning'
                                                    aria-label="Channel Name"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value?.toLowerCase().replace(' ', '-') ?? '')}
                                                >
                                                    <TextField.Slot side="left">
                                                        {channelIcon}
                                                    </TextField.Slot>
                                                    {field.value &&
                                                        <TextField.Slot side='right'>
                                                            <Text size='2' weight='light' color='gray'>{50 - field.value.length}</Text>
                                                        </TextField.Slot>
                                                    }
                                                </TextField.Root>
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
                                            <FormLabel>Description</FormLabel>
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
                                                        <FormItem className="flex w-full items-center space-y-1 py-2">
                                                            <FormLabel className="font-normal justify-between items-center flex gap-2 grow">
                                                                <div className="flex gap-2 items-center">
                                                                    <BiHash size='20' />
                                                                    <Text size='3' as='span'>Public</Text>
                                                                </div>
                                                                <FormControl>
                                                                    <RadioGroup.Item value="Public" />
                                                                </FormControl>
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-y-1 py-3">
                                                            <FormLabel className="font-normal justify-between items-center flex gap-2 grow">
                                                                <div className="flex gap-2 items-center">
                                                                    <BiLockAlt size='20' />
                                                                    <Text as='span' size='3'>Private</Text>
                                                                </div>
                                                                <FormControl>
                                                                    <RadioGroup.Item value="Private" />
                                                                </FormControl>
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-y-1 py-3">
                                                            <FormLabel className="font-normal justify-between items-center flex gap-2 grow">
                                                                <div className="flex gap-2 items-center">
                                                                    <BiGlobe size='18' />
                                                                    <Text as='span' size='3'>Open</Text>
                                                                </div>
                                                                <FormControl>
                                                                    <RadioGroup.Item value="Open" />
                                                                </FormControl>
                                                            </FormLabel>
                                                        </FormItem>
                                                    </div>
                                                </RadioGroup.Root>
                                            </FormControl>
                                            <FormDescription size='2'>
                                                {helperText}
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