import CodeBlock from '@/components/layout/CodeBlock'
import { Stack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Code, Heading, Text } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

const BotDocs = () => {

    const { getValues } = useFormContext<RavenBot>()

    const bot_id = getValues('name')

    const botVarName = bot_id.replace(/-/g, '_')

    const SectionHeading = ({ children }: { children: React.ReactNode }) => {
        return <Heading as='h3' size='3' className='not-cal' weight='medium'>{children}</Heading>
    }

    const Paragraph = ({ children }: { children: React.ReactNode }) => {
        return <Text as='p' size='2' color='gray'>{children}</Text>
    }

    const codeSamples = {
        sendMessage: `${botVarName} = frappe.get_doc("Raven Bot", "${bot_id}")

# Send a message to a channel. Text can be in HTML format.
${botVarName}.send_message(channel_id="channel-name", text="This is a test message.")`,

        sendMessageInMarkdown: `${botVarName}.send_message(
        channel_id="channel-name", 
        text="This is a test message.", 
        markdown=True
    )`,

        sendMessageWithDocumentLink: `${botVarName}.send_message(
            channel_id="channel-name", 
            text="This is a test message.", 
            link_doctype="DocType",
            link_document="Document Name"
        )`,

        sendDirectMessage: `${botVarName}.send_direct_message(
            user_id="john.doe@example.com", 
            text="This is a test message."
        )`
    }

    return (
        <Stack gap='3' pt='2'>
            <Text as='p' size='3'>
                The following code samples show how to use the bot/agent in a Frappe app or Server Script.
            </Text>
            <Stack gap='0'>
                <Stack gap='1'>
                    <SectionHeading>
                        Sending a message to a channel
                    </SectionHeading>
                    <Paragraph>
                        Bots can be used to send messages to channels with HTML formatted content.
                    </Paragraph>
                </Stack>
                <CodeBlock
                    code={codeSamples.sendMessage}
                />
            </Stack>
            <Stack gap='0'>
                <Stack gap='1'>
                    <SectionHeading>
                        Sending a message to a channel in markdown format
                    </SectionHeading>
                    <Paragraph>
                        You can send markdown formatted text to a channel by setting the <Code>markdown</Code> parameter to True.
                    </Paragraph>
                </Stack>
                <CodeBlock
                    code={codeSamples.sendMessageInMarkdown}
                />
            </Stack>

            <Stack gap='0'>
                <Stack gap='1'>
                    <SectionHeading>
                        Sending a message with a document link
                    </SectionHeading>
                    <Paragraph>
                        You can send a message with a link to any document in the system by setting the <Code>link_doctype</Code> and <Code>link_document</Code> parameters.
                    </Paragraph>
                </Stack>
                <CodeBlock
                    code={codeSamples.sendMessageWithDocumentLink}
                />
            </Stack>
            <Stack gap='0'>
                <Stack gap='1'>
                    <SectionHeading>
                        Sending a direct message to a user
                    </SectionHeading>
                    <Paragraph>
                        You can send a direct message to a user by calling the <Code>send_direct_message</Code> method and setting the user_id parameter.
                        This method also accepts markdown and document link parameters.
                    </Paragraph>
                </Stack>
                <CodeBlock
                    code={codeSamples.sendDirectMessage}
                />
            </Stack>
        </Stack>
    )
}

export default BotDocs