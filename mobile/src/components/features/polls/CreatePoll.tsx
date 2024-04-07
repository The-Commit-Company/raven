import { IonContent, ToastOptions, IonModal, useIonToast, IonHeader, IonToggle, IonCheckbox, IonItem, IonList } from "@ionic/react";
import { useFrappePostCall } from "frappe-react-sdk";
import { useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { ErrorBanner } from "../../layout";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Button, Checkbox, Flex, IconButton, Text, TextField, Theme } from "@radix-ui/themes";
import { RavenPoll } from "@/types/RavenMessaging/RavenPoll";
import { BiPlus, BiTrash } from "react-icons/bi";

interface CreatePollProps {
    presentingElement?: HTMLElement,
    isOpen: boolean,
    onDismiss: VoidFunction
}

export const CreatePoll = ({ presentingElement, isOpen, onDismiss }: CreatePollProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const methods = useForm<RavenPoll>({
        // Initialize the form with 2 option fields by default
        defaultValues: {
            options: [{
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }, {
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }],
        }
    })

    const { register, handleSubmit, control, reset } = methods
    const { fields, remove, append } = useFieldArray({
        control: control,
        name: 'options'
    })

    const optionPlaceholders = ['Cersei Lannister', 'Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Night King', 'Arya Stark', 'Sansa Stark', 'Jaime Lannister', 'Bran Stark', 'The Hound']

    const handleAddOption = () => {
        // limit the number of options to 10
        if (fields.length >= 10) {
            return
        } else {
            append({
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            })
        }
    }

    const handleRemoveOption = (index: number) => {
        // Do not remove the last 2 options
        if (fields.length === 2) {
            return
        }
        remove(index)
    }

    const { call: createPoll, error } = useFrappePostCall('raven.api.raven_poll.create_poll')
    const { channelID } = useParams<{ channelID: string }>()

    const [present] = useIonToast()

    const presentToast = (message: string, color: ToastOptions['color']) => {
        present({
            message,
            duration: 1500,
            color,
            position: 'bottom',
        })
    }

    const onSubmit = (data: RavenPoll) => {
        return createPoll({
            ...data,
            "channel_id": channelID
        }).then(() => {
            presentToast("Poll created successfully!", 'success')
            onDismiss()
        }).catch((err) => {
            presentToast("Error while creating the poll.", 'danger')
        })
    }

    const handleCancel = () => {
        reset()
        onDismiss()
    }

    return (
        <IonModal ref={modal} onDidDismiss={handleCancel} isOpen={isOpen} presentingElement={presentingElement}>

            <IonHeader>
                <Theme>
                    <div className='py-4 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b rounded-t-3xl'>
                        <div className="w-11">
                            <Button
                                size='3' variant="ghost" color='gray' onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                        <Text className="text-base cal-sans font-medium">Create Poll</Text>
                        <div>
                            <Button
                                variant="ghost"
                                color='iris'
                                size='3'
                                onClick={handleSubmit(onSubmit)}
                                type='submit'>
                                Create
                            </Button>
                        </div>
                    </div>
                </Theme>
            </IonHeader>

            <IonContent className="ion-padding bg-gray-2">
                <Form {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Theme accentColor="iris">
                            <div>
                                <ErrorBanner error={error} />
                                <div className="flex flex-col p-2 gap-4">
                                    <FormField
                                        name='question'
                                        control={control}
                                        rules={{ required: "Question is required", }}
                                        render={({ field, formState }) => (
                                            <FormItem>
                                                <FormLabel>Question <span className='text-rose-600'>*</span></FormLabel>
                                                <FormControl>
                                                    <TextField.Root
                                                        required
                                                        className="w-full"
                                                        autoComplete="off"
                                                        size={'2'}
                                                        placeholder='Who do you think deserves to sit on the Iron Throne?'
                                                        aria-label="Question"
                                                        {...field}>
                                                    </TextField.Root>
                                                </FormControl>
                                                <FormMessage>{formState.errors && formState.errors?.question?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="options"
                                        render={({ formState }) => (
                                            <FormItem>
                                                <FormLabel>Options <span className='text-rose-600'>*</span></FormLabel>

                                                {fields.map((option, index) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                        <FormControl>
                                                            <TextField.Root
                                                                required
                                                                className="w-full"
                                                                autoComplete="off"
                                                                size={'2'}
                                                                placeholder={optionPlaceholders[index]}
                                                                {...register(`options.${index}.option`)} />
                                                        </FormControl>
                                                        <IconButton
                                                            disabled={fields.length === 2}
                                                            color="red"
                                                            variant={'ghost'}
                                                            size={'1'}
                                                            title="Remove Option"
                                                            aria-label='Remove option'
                                                            onClick={() => handleRemoveOption(index)}>
                                                            <BiTrash size={'12'} />
                                                        </IconButton>
                                                    </div>
                                                ))}
                                                <Flex justify={'between'}>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        color='iris'
                                                        size='1'
                                                        disabled={fields.length >= 10}
                                                        onClick={handleAddOption}>
                                                        <BiPlus size={'14'} />
                                                        Add Option
                                                    </Button>
                                                    <FormDescription size='1'>Maximum of 10 options allowed</FormDescription>
                                                </Flex>
                                                <FormMessage>{formState.errors && formState.errors?.options?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    <Flex direction={'column'} gap='2'>
                                        <FormLabel>Settings</FormLabel>

                                        <IonList inset>
                                            <IonItem color='dark'>
                                                <IonToggle>
                                                    Allow users to select multiple options
                                                </IonToggle>
                                            </IonItem>
                                            <IonItem color='dark'>
                                                <IonToggle>
                                                    Make this poll anonymous
                                                </IonToggle>
                                            </IonItem>
                                        </IonList>

                                        <FormField
                                            control={control}
                                            name="is_multi_choice"
                                            render={({ field: { onChange, ...f } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        {/* <Checkbox
                                                            {...f}
                                                            onCheckedChange={(v) => onChange(v ? 1 : 0)} /> */}
                                                        <IonCheckbox labelPlacement="end">Allow users to select multiple options</IonCheckbox>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="is_anonymous"
                                            render={({ field: { onChange, ...f } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        {/* <Checkbox
                                                            {...f}
                                                            onCheckedChange={(v) => onChange(v ? 1 : 0)} /> */}
                                                        {/* <IonCheckbox labelPlacement="end">Make this poll anonymous</IonCheckbox> */}
                                                    </FormControl>
                                                    <IonToggle>Make this poll anonymous</IonToggle>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </Flex>

                                </div>
                            </div>
                        </Theme>
                    </form>
                </Form>
            </IonContent>

        </IonModal>

    )
}