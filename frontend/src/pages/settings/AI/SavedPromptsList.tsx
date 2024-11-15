import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBotAIPrompt } from '@/types/RavenAI/RavenBotAIPrompt'
import { Badge, Button, Checkbox, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { Link } from 'react-router-dom'

type Props = {}

const SavedPromptList = (props: Props) => {

    const { data, isLoading, error } = useFrappeGetDocList<RavenBotAIPrompt>("Raven Bot AI Prompt", {
        fields: ["name", "prompt", "raven_bot", "is_global"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    })
    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Saved Commands'
                    description='Save commonly used commands and prompts for your AI bots and access them via "/" in chat.'
                    actions={<Button asChild>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                <AINotEnabledCallout />
                {data && <SavedPromptTable data={data} />}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const SavedPromptTable = ({ data }: { data: RavenBotAIPrompt[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Bot</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Is Global?</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((d) => (
                    <Table.Row key={d.name}>
                        <Table.Cell maxWidth={"250px"}>
                            <HStack align='center'>
                                <Link to={`${d.name}`} className='hover:underline underline-offset-4'>
                                    <Text weight='medium' className='line-clamp-1 text-ellipsis'>{d.prompt}</Text>
                                </Link>

                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"100px"}>
                            <Text>{d.raven_bot}</Text>
                        </Table.Cell>

                        <Table.Cell maxWidth={"50px"}>
                            <Checkbox checked={d.is_global === 1} />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export const Component = SavedPromptList