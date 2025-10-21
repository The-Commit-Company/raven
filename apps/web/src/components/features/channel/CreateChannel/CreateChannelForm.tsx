import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
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
import { Separator } from '@components/ui/separator'
import { ChannelNameInput } from './ChannelNameInput'
import { ChannelDescriptionInput } from './ChannelDescriptionInput'
import { ChannelTypeSelector } from './ChannelTypeSelector'
import { AddMembersStep } from './AddMembersStep'
import { Stepper } from './Stepper'
import { useChannelTypeInfo } from './useChannelTypeInfo'
import { ChannelCreationForm, CreateChannelStep } from './types'

interface CreateChannelFormProps {
    onClose: () => void
}

const STEPS = [
    { id: 1, title: 'Channel Details' },
    { id: 2, title: 'Add Members' },
]

export const CreateChannelForm = ({ onClose }: CreateChannelFormProps) => {
    const [currentStep, setCurrentStep] = useState<CreateChannelStep>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const stepContentRef = useRef<HTMLDivElement>(null)

    const form = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public',
            channel_name: '',
            channel_description: '',
            members: [],
        },
    })

    const channelType = form.watch('type')
    const selectedMembers = form.watch('members') || []
    const { header } = useChannelTypeInfo(channelType)

    const handleNext = async () => {
        // Validate step 1 before proceeding
        if (currentStep === 1) {
            const isValid = await form.trigger(['channel_name', 'channel_description', 'type'])
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
        try {
            setIsSubmitting(true)
            // TODO: Implement actual channel creation API call
            console.log('Creating channel:', data)
            console.log('Selected members:', data.members?.map((m) => m.name))

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Close dialog and reset form on success
            onClose()
            form.reset()
            setCurrentStep(1)
        } catch (error) {
            console.error('Error creating channel:', error)
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl" id={currentStep === 1 ? 'step-1-title' : 'step-2-title'}>
                        {currentStep === 1 ? header : 'Add Members'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {currentStep === 1
                            ? 'Channels are where your team communicates. They are best when organized around a topic - #development, for example.'
                            : 'Invite members to your new channel. You can always add more members later.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Stepper */}
                <div className="mt-6">
                    <Stepper steps={STEPS} currentStep={currentStep - 1} />
                </div>
            </div>

            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0" aria-label="Create channel form">
                    {/* Step Content - Fixed Height */}
                    <div
                        ref={stepContentRef}
                        className="py-4 h-[400px] overflow-hidden"
                        tabIndex={-1}
                        aria-label={currentStep === 1 ? 'Channel details step' : 'Add members step'}
                    >
                        {currentStep === 1 && (
                            <div className="space-y-4 h-full overflow-y-auto px-6" role="group" aria-labelledby="step-1-title">
                                <FormField
                                    control={form.control}
                                    name="channel_name"
                                    rules={{
                                        required: 'Please add a channel name',
                                        maxLength: {
                                            value: 50,
                                            message:
                                                'Channel name cannot be more than 50 characters.',
                                        },
                                        minLength: {
                                            value: 3,
                                            message:
                                                'Channel name cannot be less than 3 characters.',
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                            message:
                                                'Channel name can only contain letters, numbers and hyphens.',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Name <span className="text-destructive">*</span>
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
                                    control={form.control}
                                    name="channel_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description{' '}
                                                <span className="font-light text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <ChannelDescriptionInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                What is this channel about?
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
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
                            <div role="group" aria-labelledby="step-2-title">
                                <AddMembersStep
                                    selectedUsers={selectedMembers}
                                    onSelectUsers={(users) => form.setValue('members', users)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer - Sticky at Bottom */}
                    <div className="border-t bg-background">
                        <div className="px-4 py-4">
                            {currentStep === 1 ? (
                                <div className="flex items-center justify-between gap-3" role="group" aria-label="Form navigation">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="text-sm px-4"
                                        aria-label="Cancel channel creation"
                                    >
                                        Cancel
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            className="text-sm px-5"
                                            aria-label="Create channel without adding members"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create Channel'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="text-sm !pl-5 !pr-4"
                                            aria-label="Proceed to add members step"
                                        >
                                            Add Members
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
                                        className="text-sm !pl-3 !pr-4"
                                        aria-label="Go back to channel details"
                                    >
                                        <ArrowLeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="text-sm px-5"
                                        aria-label={`Create channel with ${selectedMembers.length + 1} member${selectedMembers.length + 1 !== 1 ? 's' : ''}`}
                                    >
                                        {isSubmitting ? 'Creating...' : `Create Channel with ${selectedMembers.length + 1} member${selectedMembers.length + 1 !== 1 ? 's' : ''}`}
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

