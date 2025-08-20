import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { Stack } from '@/components/layout/Stack'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Button, Card, Text, Badge, Callout, Flex, Skeleton, RadioCards, IconButton, AlertDialog } from '@radix-ui/themes'
import { BiErrorCircle, BiCheck, BiPlus, BiTrash } from 'react-icons/bi'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { useState } from 'react'
import { ProcessorTypesResponse, ExistingProcessorsResponse, ExistingProcessor } from '@/components/feature/settings/ai/bots/BotDocumentProcessorsForm'
import { toast } from 'sonner'

const DocumentProcessors = () => {
    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()
    const [selectedProcessorType, setSelectedProcessorType] = useState<string>('')

    // Fetch existing processors - already created processors present in the Google Project
    const { data: existingProcessors, isLoading: loadingExisting, error: existingError, mutate: refetchProcessors } = useFrappeGetCall<ExistingProcessorsResponse>(
        'raven.ai.google_ai.get_list_of_processors',
        undefined,
        undefined,
        {
            revalidateOnFocus: false,
        }
    )

    // Create processor
    const { call: createProcessor, loading } = useFrappePostCall('raven.ai.google_ai.create_document_processor')

    // Delete processor
    const { call: deleteProcessor, loading: deletingProcessor } = useFrappePostCall('raven.ai.google_ai.delete_document_processor')

    const handleCreateProcessor = () => {
        if (!selectedProcessorType || !isRavenAdmin) return

        createProcessor({ processor_type_key: selectedProcessorType }).then(() => {
            refetchProcessors()
            toast.success('Processor created successfully', {
                description: 'The processor has been created and is now available to use.'
            })
            setSelectedProcessorType('')
        })
    }

    const handleDeleteProcessor = (processorId: string, processorName: string) => {
        deleteProcessor({ processor_id: processorId }).then(() => {
            refetchProcessors()
            toast.success('Processor deleted successfully', {
                description: `${processorName} has been deleted from your Google Cloud project.`
            })
        })
        .catch((error) => {
            toast.error('Failed to delete processor', {
                description: error.message
            })
        })
    }

    if (!isRavenAdmin) {
        return (
            <PageContainer>
                <SettingsContentContainer>
                    <SettingsPageHeader
                        title='Document Processors'
                        description='Create and manage document processors for your bots.'
                    />
                    <Callout.Root color="amber">
                        <Callout.Icon><BiErrorCircle /></Callout.Icon>
                        <Callout.Text>You need Raven Admin permissions to manage document processors.</Callout.Text>
                    </Callout.Root>
                </SettingsContentContainer>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Document Processors'
                    description='View your active document processors or select a processor type and create a new processor.'
                    actions={
                        <Button
                            onClick={handleCreateProcessor}
                            disabled={!selectedProcessorType || loading}
                            loading={loading}
                        >
                            <BiPlus />
                            Create Processor
                        </Button>
                    }
                />
                <AINotEnabledCallout />

                <Stack gap='6'>
                    <ExistingProcessorsList 
                        processors={existingProcessors?.message || []}
                        isLoading={loadingExisting}
                        error={existingError}
                        onDeleteProcessor={handleDeleteProcessor}
                        isDeletingProcessor={deletingProcessor}
                    />

                    <ProcessorTypeSelector
                        selectedProcessorType={selectedProcessorType}
                        setSelectedProcessorType={setSelectedProcessorType}
                    />
                </Stack>
            </SettingsContentContainer>
        </PageContainer>
    )
}

const ExistingProcessorsList = ({ 
    processors,
    isLoading, 
    error,
    onDeleteProcessor,
    isDeletingProcessor
}: {
    processors: ExistingProcessor[]
    isLoading: boolean
    error: any
    onDeleteProcessor: (processorId: string, processorName: string) => void
    isDeletingProcessor: boolean
}) => {
    const [processorToDelete, setProcessorToDelete] = useState<ExistingProcessor | null>(null)

    if (isLoading) {
        return (
            <Stack gap='2'>
                <Skeleton className='h-16 w-full' />
                <Skeleton className='h-16 w-full' />
            </Stack>
        )
    }

    if (error) {
        return (
            <Callout.Root color="red">
                <Callout.Icon><BiErrorCircle /></Callout.Icon>
                <Callout.Text>Error loading processors: {error.message}</Callout.Text>
            </Callout.Root>
        )
    }

    if (processors.length === 0) {
        return (
            <Stack gap='2'>
                <Text size="3" weight="medium">Active Processors ({processors.length})</Text>
                <Text size="2" className="text-gray-11">
                    No processors created yet. Select a type below to create your first processor.
                </Text>
            </Stack>
        )
    }

    return (
        <Stack gap='3'>
            <Text size="3" weight="medium">Active Processors ({processors.length})</Text>
            <Stack className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {processors.map((processor) => {
                    return (
                        <Card key={processor.id} className="p-3">
                            <Stack gap="2">
                                <Flex justify="between" align="center">
                                <Text size="2" weight="bold" className="truncate pr-8">
                                    {processor.display_name}
                                </Text>
                                <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="red"
                                        onClick={() => setProcessorToDelete(processor)}
                                        disabled={isDeletingProcessor}
                                        className="hover:bg-red-3"
                                    >
                                        <BiTrash />
                                    </IconButton>
                                </Flex>
                               
                                <Text size="1" color="gray" className="truncate">
                                    {processor.type}
                                </Text>
                                <Badge 
                                    color={processor.state ? 'green' : 'red'} 
                                    variant="soft" 
                                    size="1"
                                    className="self-start"
                                >
                                    {processor.state ? 'Active' : 'Inactive'}
                                </Badge>
                            </Stack>
                        </Card>
                    )
                })}
            </Stack>

            {/* Delete Confirmation Dialog */}
            <AlertDialog.Root 
                open={!!processorToDelete} 
                onOpenChange={(open) => !open && setProcessorToDelete(null)}
            >
                <AlertDialog.Content style={{ maxWidth: 450 }}>
                    <AlertDialog.Title>Delete Processor</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        <Text size="2" >
                            Are you sure you want to delete <strong>{processorToDelete?.display_name}</strong>?
                        </Text>
                        <br />
                        <Text size="1">
                            This will permanently remove the processor from your Google Cloud project.
                            Any agents currently using this document processor will no longer be able to use it.
                        </Text>
                    </AlertDialog.Description>

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" disabled={isDeletingProcessor}>
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                variant="solid" 
                                color="red"
                                loading={isDeletingProcessor}
                                onClick={() => {
                                    if (processorToDelete) {
                                        onDeleteProcessor(processorToDelete.id, processorToDelete.display_name)
                                        setProcessorToDelete(null)
                                    }
                                }}
                            >
                                Delete Processor
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Stack>
    )
}

const ProcessorTypeSelector = ({
    selectedProcessorType,
    setSelectedProcessorType,
}: {
    selectedProcessorType: string
    setSelectedProcessorType: (processorType: string) => void
}) => {
    // Fetch available processor types - processor types that can be created in the Google Project
    const { data: processorTypes, isLoading: loadingTypes, error: typesError } = useFrappeGetCall<ProcessorTypesResponse>(
        'raven.ai.google_ai.get_available_processor_types'
    )

    if (loadingTypes) {
        return (
            <Stack gap='2'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
            </Stack>
        )
    }

    if (typesError) {
        return (
            <Callout.Root color="red">
                <Callout.Icon><BiErrorCircle /></Callout.Icon>
                <Callout.Text>Error loading processor types: {typesError.message}</Callout.Text>
            </Callout.Root>
        )
    }

    if (!processorTypes?.message) {
        return null
    }

    return (
        <Stack gap='3'>
            <Text size="3" weight="medium">Create a new processor</Text>
            <RadioCards.Root
                value={selectedProcessorType}
                onValueChange={setSelectedProcessorType}
                className="flex flex-col gap-3"
            >
                {Object.entries(processorTypes.message).map(([key, config]) => (
                    <RadioCards.Item
                        key={key}
                        value={key}
                        className="w-full cursor-pointer hover:bg-gray-2 transition-colors duration-200 border border-gray-6 rounded-md px-1 py-2"
                    >
                        <Flex align="center" className="w-full p-4" gap="0">
                            <Flex className="w-1/4 px-2" align="start" gap="2" direction="column">
                                <Text size="3" weight="bold" className="text-gray-12 leading-tight">
                                    {config.display_name}
                                </Text>
                                <Badge color='gray' variant='outline' size="1" className="w-fit">
                                    {config.category}
                                </Badge>
                            </Flex>

                            <Flex className="w-1/5 px-2" direction="column">
                                <Text size="3" className="text-gray-12 leading-relaxed font-bold">
                                    {config.pricing.split(' ')[0]}
                                </Text>
                                <Text size="2" className="text-gray-10 leading-relaxed">
                                    {config.pricing.split(' ').slice(1).join(' ')}
                                </Text>
                            </Flex>

                            <Flex className="w-2/5 px-2">
                                <Text size="2" className="text-gray-11 leading-relaxed">
                                    {config.description}
                                </Text>
                            </Flex>

                            <Flex className="w-1/5 px-2" direction="column" gap="1">
                                {config.best_for.map((bestFor, index) => (
                                    <Flex key={index} align='center' gap='2'>
                                        <BiCheck className='text-accent-9 flex-shrink-0' size='16' />
                                        <Text size="2" className="text-gray-11 leading-tight">
                                            {bestFor}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Flex>
                    </RadioCards.Item>
                ))}
            </RadioCards.Root>
        </Stack>
    )
}

export const Component = DocumentProcessors