import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { __ } from "@/utils/translations"
import { Stack } from "@/components/layout/Stack"
import { Box, Select } from "@radix-ui/themes"
import { HelperText, Label } from "@/components/common/Form"
import { useAtom } from "jotai"
import { EnterKeyBehaviourAtom } from "@/utils/preferences"

const Preferences = () => {

    const [enterKeyBehaviour, setEnterKeyBehaviour] = useAtom(EnterKeyBehaviourAtom)

    return (

        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={__('Preferences')}
                    description={__('Configure your preferences.')}
                />

                <Stack gap='6' pt='2'>
                    <Stack className="max-w-[480px]">
                        <Box>
                            <Label htmlFor='EnterKeyBehaviour' isRequired>When writing a message, press <strong>Enter</strong> to:</Label>
                            <Select.Root value={enterKeyBehaviour} name="EnterKeyBehaviour" onValueChange={(value) => setEnterKeyBehaviour(value as "new-line" | "send-message")}>
                                <Select.Trigger className='w-full' autoFocus />
                                <Select.Content>
                                    <Select.Item value='send-message'>Send Message</Select.Item>
                                    <Select.Item value='new-line'>Start a new line</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Box>
                        <HelperText>
                            {enterKeyBehaviour === 'send-message'
                                ? 'Pressing Enter will immediately send your message. Use Shift+Enter to add a new line.'
                                : 'Pressing Enter will add a new line. Use Shift+Enter or Ctrl/Cmd+Enter to send your message.'
                            }
                        </HelperText>
                    </Stack>
                </Stack>
            </SettingsContentContainer>
        </PageContainer>
    )
}

export const Component = Preferences