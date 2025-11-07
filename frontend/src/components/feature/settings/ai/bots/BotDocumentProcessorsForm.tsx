import { ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Checkbox, Text, Separator, Callout, Flex, Badge, Skeleton, RadioCards } from '@radix-ui/themes'
import { useFormContext, Controller } from 'react-hook-form'
import { BiCheck, BiInfoCircle } from 'react-icons/bi'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Link } from 'react-router-dom'

export interface ProcessorTypeConfig {
    type: string
    display_name: string
    description: string
    best_for: string[]
    pricing: string
    category: 'digitize' | 'extract' | 'specialized'
}

export interface ProcessorTypesResponse {
    message: Record<string, ProcessorTypeConfig>
}

export interface ExistingProcessor {
    id: string
    name: string
    display_name: string
    type: string
    processor_type_key: string
    state: string
}

export interface ExistingProcessorsResponse {
    message: ExistingProcessor[]
}

const getProcessorTypeBestFor = (processorType: string) => {
    switch (processorType) {
        case 'OCR_PROCESSOR':
            return ['General text extraction', 'Multi-language documents', 'Handwriting recognition']
        case 'FORM_PARSER_PROCESSOR':
            return ['Application forms', 'Surveys', 'Registration forms', 'Structured data']
        case 'BANK_STATEMENT_PROCESSOR':
            return ['Financial analysis', 'Loan processing', 'Bank statement digitization']
        case 'INVOICE_PROCESSOR':
            return ['Invoice processing', 'Accounts payable automation', 'Tax document preparation', 'Financial record keeping']
        case 'EXPENSE_PROCESSOR':
            return ['Expense reports', 'Travel reimbursements', 'Receipt digitization']
        default:
            return []
    }
}

export const BotDocumentProcessorsForm = () => {
    const { control, watch, formState: { errors } } = useFormContext<RavenBot>()
    const { ravenSettings } = useRavenSettings()

    const useDocumentParser = watch('use_google_document_parser')
    const isGoogleApisEnabled = ravenSettings?.enable_google_apis

    // Fetch existing processors when document parsing is enabled
    const { data: existingProcessors, isLoading: loadingProcessors, error: processorsError } = useFrappeGetCall<ExistingProcessorsResponse>(
        'raven.ai.google_ai.get_list_of_processors',
        undefined,
        useDocumentParser && isGoogleApisEnabled ? undefined : null,
        {
            revalidateOnFocus: false,
        }
    )

    if (!isGoogleApisEnabled) {
        return (
            <Stack gap='4'>
                <Callout.Root color="red" size="1">
                    <Callout.Icon>
                        <BiInfoCircle />
                    </Callout.Icon>
                    <Callout.Text>
                        Document Processors require Google Cloud APIs to be enabled in your Raven settings.
                    </Callout.Text>
                </Callout.Root>
            </Stack>
        )
    }

    const hasExistingProcessors = existingProcessors?.message && existingProcessors.message.length > 0

    return (
        <Stack gap='4'>
            <Stack className='max-w-prose'>
                <Text as="label" size="2">
                    <HStack align='center'>
                        <Controller
                            control={control}
                            name='use_google_document_parser'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )}
                        />
                        <span>Use Google Document/Vision AI to parse documents</span>
                    </HStack>
                </Text>
                <HelperText>
                    When images or PDFs are uploaded to the agent, Raven will automatically call Google Cloud APIs
                    to process the document and send its results to the agent for better context.
                </HelperText>
            </Stack>

            {useDocumentParser ? (
                <>
                    <Separator className='w-full' />
                    <Stack gap='4'>
                        <Stack>
                            <Text size="3" weight="medium" className="text-gray-12">
                                Document Processor Selection
                            </Text>

                            <Flex align="center" gap="1">
                            <Text size="2" className="text-gray-11">
                                Choose an existing document processor for this bot.
                                Processors can be shared across multiple bots.
                            </Text>
                            <Text size="2" className="text-gray-11">
                                <Link to="/settings/document-processors" target="_blank" className='text-accent-9 hover:underline'>
                                    Create Document Processors
                                </Link>
                            </Text>
                            </Flex>
                            
                        </Stack>

                        {/* Loading state */}
                        {loadingProcessors && (
                            <Skeleton className="h-10 w-full" />
                        )}

                        {/* Error state */}
                        {processorsError && (
                            <Callout.Root color="red" size="1">
                                <Callout.Icon>
                                    <BiInfoCircle />
                                </Callout.Icon>
                                <Callout.Text>
                                    Error fetching processors: {processorsError.message}
                                </Callout.Text>
                            </Callout.Root>
                        )}

                        {/* No processors available */}
                        {!loadingProcessors && !processorsError && !hasExistingProcessors && (
                            <Callout.Root color="amber" size="1">
                                <Callout.Icon>
                                    <BiInfoCircle />
                                </Callout.Icon>
                                <Callout.Text>
                                    <Flex gap="2">
                                        <Text>No document processors have been created yet. You need to create at least one processor before you can assign it to this bot.</Text>
                                        <Link to="/settings/document-processors" target="_blank" className='text-amber-800 dark:text-amber-500 hover:underline'>
                                            Create Document Processors
                                        </Link>
                                    </Flex>
                                </Callout.Text>
                            </Callout.Root>
                        )}

                        {/* Processor selection */}
                        {!loadingProcessors && hasExistingProcessors && (
                            <Stack gap="3">
                                <Controller
                                    control={control}
                                    name="google_document_processor_id"
                                    render={({ field }) => (
                                        <RadioCards.Root
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="flex flex-col gap-3"
                                        >
                                            {existingProcessors.message.map((processor) => (
                                                <RadioCards.Item
                                                    key={processor.id}
                                                    value={processor.id}
                                                    className="w-full cursor-pointer hover:bg-gray-2 transition-colors duration-200 border border-gray-6 rounded-md px-1 py-2"
                                                >
                                                    <Flex align="center" className="w-full p-2" gap="0">
                                                        <Flex className="w-1/3 px-2" align="start" gap="2" direction="column">
                                                            <Text size="3" weight="bold" className="text-gray-12 leading-tight">
                                                                {processor.display_name}
                                                            </Text>
                                                            <Badge
                                                                color={processor.state ? 'green' : 'red'}
                                                                variant="soft"
                                                                size="1"
                                                                className="self-start"
                                                            >
                                                                {processor.state ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </Flex>
                                                        <Flex className="w-1/3 px-2" align="start" gap="2" direction="column">
                                                            <Text size="2" className="text-gray-11 leading-relaxed">
                                                                {processor.type} 
                                                            </Text>
                                                        </Flex>

                                                        <Flex className="w-1/3 px-2" direction="column" gap="1">
                                                            {getProcessorTypeBestFor(processor.type).map((bestFor, index) => (
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
                                    )}
                                />

                                <HelperText>
                                    This processor will be used to process any documents, images, or PDFs uploaded to the thread and send its results to the agent for better context.
                                </HelperText>

                            </Stack>
                        )}



                        {errors.google_document_processor_id && (
                            <ErrorText>{errors.google_document_processor_id?.message}</ErrorText>
                        )}
                    </Stack>
                </>
            ) : null}
        </Stack>
    )
}