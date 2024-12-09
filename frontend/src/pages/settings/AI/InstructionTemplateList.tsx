import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenBotInstructionTemplate } from '@/types/RavenAI/RavenBotInstructionTemplate'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Code, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { BiFile } from 'react-icons/bi'
import { RiSparkling2Fill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

type Props = {}

const InstructionTemplateList = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error } = useFrappeGetDocList<RavenBotInstructionTemplate>("Raven Bot Instruction Template", {
        fields: ["name", "template_name", "dynamic_instructions", "instruction"],
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
                    title='Instruction Templates'
                    description='Save commonly used instructions as templates for your bots.'
                    actions={<Button asChild disabled={!isRavenAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                <AINotEnabledCallout />
                {data && data.length > 0 && <InstructionTable data={data} />}
                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <BiFile />
                    </EmptyStateIcon>
                    <EmptyStateTitle>AI Instruction Templates</EmptyStateTitle>
                    <EmptyStateDescription>
                        Most bots require the same kind of instructions to perform their tasks, like "format dates as DD-MM-YYYY" or "the current user is <Code color='gray'>{"{{user}}"}</Code>".<br />Save commonly used instructions as templates for your AI bots.
                    </EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first template
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const InstructionTable = ({ data }: { data: RavenBotInstructionTemplate[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((d) => (
                    <Table.Row key={d.name}>
                        <Table.Cell maxWidth={"150px"}>
                            <HStack align='center'>
                                <Link to={`${d.name}`} className='hover:underline underline-offset-4'>
                                    <Text weight='medium'>{d.template_name}</Text>
                                </Link>
                                {d.dynamic_instructions ?
                                    <Badge color='purple'><RiSparkling2Fill /> Dynamic</Badge>

                                    : null}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"250px"}>
                            <Text className='line-clamp-1 text-ellipsis'>{d.instruction}</Text>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export const Component = InstructionTemplateList