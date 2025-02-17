import { UserAvatar } from '@/components/common/UserAvatar'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, HoverCard, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { BiBot, BiSolidCheckCircle, BiSolidXCircle } from 'react-icons/bi'
import { RiSparkling2Fill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

type Props = {}

const BotList = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error } = useFrappeGetDocList<RavenBot>("Raven Bot", {
        fields: ["name", "bot_name", "is_ai_bot", "description", "image", "enable_file_search", "dynamic_instructions", "instruction", "allow_bot_to_write_documents", "enable_code_interpreter"],
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
                    title='Agents'
                    description='Use agents to send reminders, run AI assistants, and more.'
                    actions={<Button asChild disabled={!isRavenAdmin} title={!isRavenAdmin ? "You don't have permissions to create agents." : "Create a new agents."}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {data && data.length > 0 && <BotTable bots={data} />}

                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <BiBot />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Get started with agents</EmptyStateTitle>
                    <EmptyStateDescription>Create agents to run automations on Raven.<br />Send reminders, document notifications and run AI assistants.</EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first agent
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const BotTable = ({ bots }: { bots: RavenBot[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {bots?.map((bot) => (
                    <Table.Row key={bot.name}>
                        <Table.Cell maxWidth={"150px"}>
                            <HStack align='center'>
                                <Link to={`${bot.name}`} className='hover:underline underline-offset-4'>
                                    <HStack align='center'>
                                        <UserAvatar src={bot.image} alt={bot.bot_name} />
                                        <Text weight='medium'>{bot.bot_name}</Text>
                                    </HStack>
                                </Link>
                                {bot.is_ai_bot ?
                                    <HoverCard.Root>
                                        <HoverCard.Trigger>
                                            <Badge color='purple'><RiSparkling2Fill /> AI</Badge>
                                        </HoverCard.Trigger>
                                        <HoverCard.Content>
                                            <Stack>
                                                <BotFeatureRow
                                                    enabled={bot.allow_bot_to_write_documents}
                                                    label="Can Write Documents"
                                                />
                                                <BotFeatureRow
                                                    enabled={bot.enable_file_search}
                                                    label="File Search"
                                                />
                                                <BotFeatureRow
                                                    enabled={bot.enable_code_interpreter}
                                                    label="Code Interpreter"
                                                />
                                                <BotFeatureRow
                                                    enabled={bot.dynamic_instructions}
                                                    label="Dynamic Instructions"
                                                />

                                            </Stack>
                                        </HoverCard.Content>
                                    </HoverCard.Root>
                                    : null}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"250px"}>
                            <Text className='line-clamp-1 text-ellipsis'>{bot.description ? bot.description : bot.instruction}</Text>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

const BotFeatureRow = ({ enabled, label }: { enabled?: 0 | 1, label: string }) => {
    return (
        <HStack align='center'>
            {enabled ? <BiSolidCheckCircle className='text-green-9' /> : <BiSolidXCircle className='text-red-9' />}
            <Text className='text-gray-12' size='2'>{label}</Text>
        </HStack>
    )
}
export const Component = BotList