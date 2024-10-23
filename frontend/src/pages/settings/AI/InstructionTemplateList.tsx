import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBotInstructionTemplate } from '@/types/RavenAI/RavenBotInstructionTemplate'
import { Badge, Button, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { RiSparkling2Fill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

type Props = {}

const InstructionTemplateList = (props: Props) => {

    const { data, isLoading, error } = useFrappeGetDocList<RavenBotInstructionTemplate>("Raven Bot Instruction Template", {
        fields: ["name", "template_name", "dynamic_instructions", "instruction"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    })
    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Instruction Templates'
                    description='Save commonly used instructions as templates for your bots.'
                    actions={<Button asChild>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                <AINotEnabledCallout />
                {data && <InstructionTable data={data} />}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const InstructionTable = ({ data }: { data: RavenBotInstructionTemplate[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm'>
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