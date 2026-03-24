import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form'
import { ChannelNameInput } from './ChannelNameInput'
import { ChannelDescriptionInput } from './ChannelDescriptionInput'
import { ChannelTypeSelector } from './ChannelTypeSelector'
import { AddMembersStep } from './AddMembersStep'
import { Stepper } from './Stepper'
import { useChannelTypeInfo } from './useChannelTypeInfo'
import { ChannelCreationForm, CreateChannelStep } from './types'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useNavigate, useParams } from 'react-router'
import { ChannelList, ChannelListItem } from '@raven/types/common/ChannelListItem'
import _ from '@lib/translate'
import ErrorBanner from '@components/ui/error-banner'

interface CreateChannelFormProps {
    onClose: () => void
    selectedWorkspace?: string
}

const STEPS = [
    { id: 1, title: 'Channel Details' },
    { id: 2, title: 'Add Members' },
]

export const CreateChannelForm = ({ onClose: onCloseCallback, selectedWorkspace = '' }: CreateChannelFormProps) => {

    const { workspaceID } = useParams()
    const navigate = useNavigate()
    const { mutate } = useSWRConfig()

    const { call, loading: isSubmitting, error: createChannelError, reset: resetCreateHook } = useFrappePostCall<{ message: ChannelListItem }>('raven.api.raven_channel.create_channel')

    const reset = () => {
        resetCreateHook()
        resetForm()
    }

    const onClose = (channel_name?: string, workspace?: string) => {
        if (channel_name) {
            navigate(`/${workspace}/channel/${channel_name}`)
        }
        onCloseCallback()

        reset()
    }

    const [currentStep, setCurrentStep] = useState<CreateChannelStep>(1)
    const stepContentRef = useRef<HTMLDivElement>(null)

    const form = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public',
            channel_name: '',
            channel_description: '',
            members: [],
        },
    })

    const { handleSubmit, control, setValue, reset: resetForm, trigger } = form

    const [channelType, selectedMembers = []] = useWatch({ control, name: ['type', 'members'] })
    const { header } = useChannelTypeInfo(channelType)

    const handleNext = async () => {
        // Validate step 1 before proceeding
        if (currentStep === 1) {
            const isValid = await trigger(['channel_name', 'channel_description', 'type'])
            if (isValid) {
                setCurrentStep(2)
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as CreateChannelStep)
        }
    }

    // Focus management when step changes
    useEffect(() => {
        // Focus the step content area when step changes for screen reader announcement
        if (stepContentRef.current) {
            stepContentRef.current.focus()
        }
    }, [currentStep])

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ESC key to close dialog
            if (e.key === 'Escape' && !isSubmitting) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [onClose, isSubmitting])

    const onSubmit = async (data: ChannelCreationForm) => {
        call({
            type: data.type,
            channel_name: data.channel_name,
            channel_description: data.channel_description,
            members: data.members?.map((member) => member.name),
            workspace: selectedWorkspace || workspaceID
        }).then((result) => {
            if (result) {
                mutate("channel_list", (data: { message: ChannelList } | undefined) => {
                    if (data) {
                        return {
                            message: {
                                ...data.message,
                                channels: [
                                    ...data.message.channels,
                                    {
                                        ...result.message,
                                    }
                                ]
                            }
                        }
                    }

                }, {
                    revalidate: false
                })
                onClose(result.message.name, selectedWorkspace || workspaceID)
            }
        })
    }

    return (
        <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl" id={currentStep === 1 ? 'step-1-title' : 'step-2-title'}>
                        {currentStep === 1 ? header : _('Add Members')}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {currentStep === 1 ? _("Create a new channel") : _("Add members to the channel")}
                    </DialogDescription>
                    {createChannelError ? <ErrorBanner error={createChannelError} /> : null}
                </DialogHeader>

                {/* Stepper */}
                <div className="mt-6">
                    {channelType !== "Open" ? <Stepper steps={STEPS} currentStep={currentStep - 1} /> : <span className='text-sm'>{_('Channel Details')}</span>}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0" aria-label="Create channel form">
                    {/* Step Content - Fixed Height */}
                    <div
                        ref={stepContentRef}
                        className="pt-4 h-[400px] overflow-hidden"
                        tabIndex={-1}
                        aria-label={currentStep === 1 ? 'Channel details step' : 'Add members step'}
                    >
                        {currentStep === 1 && (
                            <div className="space-y-6 h-full overflow-y-auto px-6" role="group" aria-labelledby="step-1-title">
                                <FormField
                                    control={control}
                                    name="channel_name"
                                    rules={{
                                        required: _('Please add a channel name'),
                                        maxLength: {
                                            value: 50,
                                            message:
                                                _('Channel name cannot be more than 50 characters.'),
                                        },
                                        minLength: {
                                            value: 3,
                                            message:
                                                _('Channel name cannot be less than 3 characters.'),
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                            message:
                                                _('Channel name can only contain letters, numbers and hyphens.'),
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {_('Name')} <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <ChannelNameInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    channelType={channelType}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="channel_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {_('Description')} <span className="font-light text-muted-foreground">
                                                    ({_('optional')})
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <ChannelDescriptionInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {_('What is this channel about?')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <ChannelTypeSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div role="group" aria-labelledby="step-2-title" className="h-full">
                                <AddMembersStep
                                    selectedUsers={selectedMembers || []}
                                    onSelectUsers={(users) => setValue('members', users)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer - Sticky at Bottom */}
                    <div className="border-t bg-background">
                        <div className="px-4 py-4">
                            {channelType !== "Open" ? 
                            (currentStep === 1 ? (
                                <div className="flex items-center justify-between gap-3" role="group" aria-label="Form navigation">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => onClose()}
                                        disabled={isSubmitting}
                                        className="text-sm px-4"
                                        aria-label="Cancel channel creation"
                                    >
                                        {_('Cancel')}
                                    </Button>
                                    <div className="flex items-center">
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="text-sm pl-5 pr-4"
                                            aria-label="Proceed to add members step"
                                        >
                                            {_('Add Members')}
                                            <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3" role="group" aria-label="Form navigation">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleBack}
                                        disabled={isSubmitting}
                                        className="text-sm pl-3 pr-4"
                                        aria-label="Go back to channel details"
                                    >
                                        <ArrowLeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                        {_('Back')}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                        className="text-sm px-5"
                                        aria-label={`Create channel with ${selectedMembers.length + 1} member${selectedMembers.length + 1 !== 1 ? 's' : ''}`}
                                    >
                                        {isSubmitting ? _('Creating...') : _(`Create Channel with ${selectedMembers.length + 1} member${selectedMembers.length + 1 !== 1 ? 's' : ''}`)}
                                    </Button>
                                </div>
                            )) : (
                                <div className="flex items-center justify-between gap-3" role="group" aria-label="Form navigation">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => onClose()}
                                        disabled={isSubmitting}
                                        className="text-sm px-4"
                                        aria-label="Cancel channel creation"
                                    >
                                        {_('Cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                        className="text-sm px-5"
                                        aria-label={`Create channel with ${selectedMembers.length + 1} member${selectedMembers.length + 1 !== 1 ? 's' : ''}`}
                                    >
                                        {isSubmitting ? _('Creating...') : _(`Create Channel`)}
                                    </Button>
                                </div>
                            )}    
                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}

