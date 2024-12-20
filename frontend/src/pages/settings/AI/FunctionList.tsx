import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Checkbox, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { LuSquareFunction } from 'react-icons/lu'
import { Link } from 'react-router-dom'

type Props = {}

const FunctionList = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error } = useFrappeGetDocList<RavenAIFunction>("Raven AI Function", {
        fields: ["name", "description", "function_name", "type", "requires_write_permissions"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    }, isRavenAdmin ? undefined : null, {
        errorRetryCount: 2
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Functions'
                    description='Declare functions to be used by your AI bots.'
                    actions={<Button asChild disabled={!isRavenAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={4} />}
                <ErrorBanner error={error} />
                <AINotEnabledCallout />
                {data && data.length > 0 && <FunctionTable functions={data} />}
                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <LuSquareFunction />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Bots + Functions = AI Magic</EmptyStateTitle>
                    <EmptyStateDescription>
                        Use the no-code builder to create functions that allow AI bots to perform actions within the system when requested, like creating documents, or fetching reports to analyze.
                    </EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first function
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const FunctionTable = ({ functions }: { functions: RavenAIFunction[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Writes</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {functions?.map((f) => (
                    <Table.Row key={f.name}>
                        <Table.Cell maxWidth={"250px"}>
                            <HStack align='center'>
                                <Link to={`${f.name}`} className='hover:underline underline-offset-4'>
                                    <Text weight='medium'>{f.function_name}</Text>
                                </Link>
                                {/* {bot.is_ai_bot ?
                                    <HoverCard.Root>
                                        <HoverCard.Trigger>
                                            <Badge color='purple'><RiSparkling2Fill /> AI</Badge>
                                        </HoverCard.Trigger>
                                        <HoverCard.Content>
                                            <Stack>
                                                <BotFeatureRow
                                                    enabled={bot.dynamic_instructions}
                                                    label="Dynamic Instructions"
                                                />
                                                <BotFeatureRow
                                                    enabled={bot.enable_file_search}
                                                    label="File Search"
                                                />
                                                <BotFeatureRow
                                                    enabled={bot.allow_bot_to_write_documents}
                                                    label="Can Write Documents"
                                                />
                                            </Stack>
                                        </HoverCard.Content>
                                    </HoverCard.Root>
                                    : null} */}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"300px"}>
                            <Text className='line-clamp-1 text-ellipsis'>{f.description}</Text>
                        </Table.Cell>
                        <Table.Cell maxWidth={"150px"}>
                            <Badge variant='outline'>{f.type}</Badge>
                        </Table.Cell>

                        <Table.Cell maxWidth={"50px"}>
                            <Checkbox checked={f.requires_write_permissions === 1} />
                        </Table.Cell>

                        {/* <Table.Cell maxWidth={"250px"}>
                            <Text className='line-clamp-1 text-ellipsis'>{bot.description ? bot.description : bot.instruction}</Text>
                        </Table.Cell> */}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export const Component = FunctionList