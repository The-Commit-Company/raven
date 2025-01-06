import { Button, Code, Flex, Link, Separator, Text } from "@radix-ui/themes";
import { FiExternalLink, FiMail } from "react-icons/fi"
import { useBoolean } from "@/hooks/useBoolean"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { Stack } from "@/components/layout/Stack"
import CreateSupportTicketDialog from "../../components/feature/settings/help/SupportRequest"
import SocketIOHealth from "@/components/feature/settings/help/SocketIOHealth"
import { LuMessageSquareWarning } from "react-icons/lu";

const HelpAndSupport = () => {
    const [open, { on, off }] = useBoolean()

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Help and Support'
                />

                <Stack gap="5">
                    <Stack>
                        <Text color="gray" size="2" as='span' className='font-medium'>Have ideas or ran into an issue?</Text>
                        <div>
                            <Button size="2" onClick={on} variant="outline"
                                color='gray'
                                className="not-cal cursor-pointer"
                                title="Click here to send us feedback or file an issue" aria-label="click here to send us feedback or file an issue">
                                <LuMessageSquareWarning />  Contact Us
                            </Button>
                        </div>

                    </Stack>
                    <Separator size='4' />

                    <SocketIOHealth />
                    <Separator size='4' />

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
                        <li>
                            <Link underline="always" size='2' target="_blank"
                                color='gray'
                                title="support@thecommit.company"
                                href="mailto:support@thecommit.company">Support Email
                            </Link>
                        </li>
                    </ul>


                    <Stack gap='0'>
                        {/* @ts-expect-error */}
                        <Text size='3' color='gray'><Text size='5' className="cal-sans text-gray-12 dark:text-white">raven</Text> <Code size='2' variant="ghost">v{frappe?.boot.versions.raven}</Code></Text>
                        <Text size='2' color='gray'>Crafted by The Commit Company</Text>
                    </Stack>
                </Stack>

            </SettingsContentContainer>

            <CreateSupportTicketDialog open={open} onClose={off} />
        </PageContainer>
    )
}

export const Component = HelpAndSupport
