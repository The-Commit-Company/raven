import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { FiExternalLink, FiMail } from "react-icons/fi"
import { useBoolean } from "@/hooks/useBoolean"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { Stack } from "@/components/layout/Stack"
import CreateSupportTicketDialog from "../../components/feature/settings/help/SupportRequest"
import SocketIOHealth from "@/components/feature/settings/help/SocketIOHealth"

const HelpAndSupport = () => {
    const [open, { on, off }] = useBoolean()

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Help and Support'
                    description='Your gateway to seamless support, system insights, and community resources.'
                />

                <Stack gap="5" pt="4">
                    <Flex align="center" gap="2">
                        <Text color="gray" size="2" as='span' className='font-medium'>Looking for help? Raise a new support request, and our team will assist you promptly. </Text>
                        <Button size="1" onClick={on} variant="soft" title="Click here to send us feedback or file an issue" aria-label="click here to send us feedback or file an issue">
                            Click here
                        </Button>
                    </Flex>

                    <SocketIOHealth />

                    <ul className="list-none">
                        <li>
                            <Link color='gray' underline="always" size='2' target="_blank"
                                title="https://github.com/The-Commit-Company/raven"
                                href="https://github.com/The-Commit-Company/raven">GitHub <FiExternalLink size='12' />
                            </Link>
                        </li>
                        <li>
                            <Link color='gray' underline="always" size='2' target="_blank"
                                title="https://community.ravenapp.cloud"
                                href="https://community.ravenapp.cloud">Community <FiExternalLink size='12' />
                            </Link>
                        </li>
                        <li>
                            <Link color='gray' underline="always" size='2' target="_blank"
                                title="https://ravenchat.ai"
                                href="https://ravenchat.ai">Website <FiExternalLink size='12' />
                            </Link>
                        </li>
                    </ul>

                    <Link underline="always" size='2' target="_blank"
                        title="support@thecommit.company"
                        href="mailto:support@thecommit.company">Need support? Email us <FiMail size='15' />
                    </Link>

                    <Stack justify="end">
                        {/* @ts-expect-error */}
                        <Text size='2' color='gray'><Text size='4' className="cal-sans text-gray-12 dark:text-white">raven</Text> v{frappe?.boot.versions.raven}</Text>
                        <Text size='1' color='gray'>Crafted by The Commit Company</Text>
                    </Stack>
                </Stack>

            </SettingsContentContainer>

            <CreateSupportTicketDialog open={open} onClose={off} />
        </PageContainer>
    )
}

export const Component = HelpAndSupport
