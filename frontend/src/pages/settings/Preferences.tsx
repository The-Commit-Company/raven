import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { __ } from "@/utils/translations"
import { HStack, Stack } from "@/components/layout/Stack"
import { Box, Select, IconButton, Popover } from "@radix-ui/themes"
import { HelperText, Label } from "@/components/common/Form"
import { useAtom } from "jotai"
import { EnterKeyBehaviourAtom, QuickEmojisAtom } from "@/utils/preferences"
import { lazy, Suspense } from "react"
import { Loader } from "@/components/common/Loader"

const EmojiPicker = lazy(() => import("@/components/common/EmojiPicker/EmojiPicker"))

const Preferences = () => {

    const [enterKeyBehaviour, setEnterKeyBehaviour] = useAtom(EnterKeyBehaviourAtom)
    const [quickEmojis, setQuickEmojis] = useAtom(QuickEmojisAtom)

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
                                : 'Pressing Enter will add a new line. Use Ctrl/Cmd+Enter to send your message.'
                            }
                        </HelperText>
                    </Stack>

                    <Stack className="max-w-[480px]">
                        <Label htmlFor='QuickEmojis'>Set Favourite Emojis for Reactions</Label>
                        <HStack gap='2'>
                            {quickEmojis.map((emoji, index) => (
                                <Popover.Root key={index}>
                                    <Popover.Trigger>
                                        <IconButton
                                            size="2"
                                            variant="soft"
                                            color="gray"
                                            className="min-w-[48px]"
                                        >
                                            {emoji || "➕"}
                                        </IconButton>
                                    </Popover.Trigger>
                                    <Popover.Content>
                                        <Suspense fallback={<Loader />}>
                                            <EmojiPicker
                                                onSelect={(selectedEmoji) => {
                                                    const newEmojis = [...quickEmojis];
                                                    newEmojis[index] = selectedEmoji;
                                                    setQuickEmojis(newEmojis);
                                                }}
                                                allowCustomEmojis={false}
                                            />
                                        </Suspense>
                                    </Popover.Content>
                                </Popover.Root>
                            ))}
                        </HStack>
                        <HelperText>
                            Click on any button to set your favorite emoji for quick reactions. These emojis will be available as quick reactions in chat messages.
                        </HelperText>
                    </Stack>
                </Stack>
            </SettingsContentContainer>
        </PageContainer>
    )
}

export const Component = Preferences